import { lstat, readFile, stat, symlink, unlink, writeFile } from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { FS_ROOT } from './constants.js';
import { getTsCompileOptions } from './getCompileOptions.js';
import { tsCompile } from './tsCompile.js';
import { ICompileIfNecessaryResult, ICompileOptions } from './types.js';
import { existsAsync } from './util.js';

/**
 * Determine if any files need compiling
 * @internal
 * @param srcGlobs globs for source files.
 * @param outDir output directory for compilation
 */
export async function needsCompile(
  srcGlobs: string[],
  outDir: string
): Promise<boolean> {
  const filePromises = srcGlobs.flatMap(src => glob.glob(src));
  const fileLists = await Promise.all(filePromises);
  const files = fileLists.flat(1);
  const srcDestPairs = compilationPairs(files, outDir);
  return anyOutDated(srcDestPairs);
}

/**
 * Determine the output file path
 * @internal
 * @param tsFile file to compile
 * @param outDir output directory
 * @return path to the js file that will be produced by typescript compilation
 */
export function jsOutFile(tsFile: string, outDir: string): string {
  const tsAbsolutePath = path.resolve(tsFile);
  const tsAbsoluteDir = path.dirname(tsAbsolutePath);
  const dirFromRoot = path.relative(FS_ROOT, tsAbsoluteDir);
  const jsDir = path.join(outDir, dirFromRoot);
  const outFile = changeSuffix(path.basename(tsFile));
  return path.join(jsDir, outFile);
}

/*
We set rootDir to fsRoot for tsc compilation.

That means that the .js output files produced by typescript will be in a deep tree
of subdirectories mirroring the path from / to the source file.
  e.g. /home/lee/proj/foo.ts will output to outdir/home/proj/lee/foo.js.

We need to set a rootDir so that the output tree js files produced by typescript is
predictable prior to compilation. Without a rootDir, tsc will make an output tree that
is as short as possible depending on the imports used by the .ts files. Shorter is nice,
but the unpredictability breaks checks for on-demand compilation.

A .ts file can import from parent directories.
  e.g. import * from "../util".
So we use the file system root as the rootDir to be conservative in handling
potential parent directory imports.
*/

/**
 * Compile if output is not stale
 * @internal
 * @param sources sources to compile
 * @param outDir output directory
 * @param compileOptions options for us with compilation
 */
export async function compileIfNecessary(
  sources: string[],
  outDir: string,
  compileOptions: ICompileOptions
): Promise<ICompileIfNecessaryResult> {
  const extendedSourceList = await extendedSources(outDir);
  const sourceSet = new Set([...sources, ...extendedSourceList]);
  const allSources = [...sourceSet];
  if (await needsCompile(allSources, outDir)) {
    const { compiled, localSources } = await tsCompile(
      sources,
      getTsCompileOptions(outDir, compileOptions)
    );
    if (compiled) {
      await saveExtendedSources(outDir, localSources);
      await linkNodeModules(outDir);
    }
    return { success: compiled, compiled: compiled };
  }
  return { success: true, compiled: false };
}

/**
 * local sources used in last compilation, including imports
 * @internal
 * @param outDir output directory
 */
async function extendedSources(outDir: string): Promise<string[]> {
  const file = sourcesFile(outDir);
  if (!(await existsAsync(file))) {
    return [];
  }
  const lines = await readFile(file, 'utf8');
  return lines.split('\n');
}

/**
 * get the path for sourcesFiles
 * @internal
 * @param outDir
 */
function sourcesFile(outDir: string): string {
  return path.join(outDir, '_sources');
}

/**
 * Save outputs
 * @internal
 * @param outDir
 * @param allSources
 */
function saveExtendedSources(
  outDir: string,
  allSources: string[]
): Promise<void> {
  const file = sourcesFile(outDir);
  return writeFile(file, allSources.join('\n'));
}

/**
 *Put a link in the output directory to node_modules.
 * @internal
 * @param outDir output directory
 */
async function linkNodeModules(outDir: string): Promise<void> {
  /*
   * Note that this only puts a link to the single node_modules directory
   * that's closest by.
   *
   * But I think node's module resolution will search multiple
   * parent directories for multiple node_modules at runtime. So just one
   * node_modules link may be insufficient in some complicated cases.
   *
   * If supporting the more complicated case is worthwhile, we can consider
   * e.g. encoding a full list of node_modules and setting NODE_PATH instead
   * of the symlink approach here.
   */
  const nodeModules = await nearestNodeModules(process.cwd());
  if (nodeModules) {
    const linkToModules = path.join(outDir, 'node_modules');
    await symLinkForce(nodeModules, linkToModules);
  }
}

/**
 * Determine if a path is a symbolic link
 * @internal
 * @param link path to the link
 */
async function isSymLink(link: string): Promise<boolean> {
  const info = await lstat(link);
  return info.isSymbolicLink();
}

/**
 * Create a symlink if one doesn't exist.
 * @internal
 * If it does exist delete it.
 * @param existing existing link
 * @param link path to new link
 */
export async function symLinkForce(
  existing: string,
  link: string
): Promise<void> {
  if (await existsAsync(link)) {
    if (!(await isSymLink(link))) {
      throw `symLinkForce refusing to unlink non-symlink ${link}`;
    }
    await unlink(link);
  }
  await symlink(
    existing,
    link,
    process.platform === 'win32' ? 'junction' : null
  );
}

/**
 * Find the nearest node modules directory
 * @internal
 * @param dir directory to start looking from.
 * @return the resolved path to the nearest node_modules file,
 * either in the provided directory or a parent.
 */
export async function nearestNodeModules(
  dir: string
): Promise<string | undefined> {
  const resolvedDir = path.resolve(dir);
  const modulesFile = path.join(resolvedDir, 'node_modules');

  if (await existsAsync(modulesFile)) {
    return modulesFile;
  } else {
    const { dir: parent, root } = path.parse(resolvedDir);
    if (parent !== root) {
      return nearestNodeModules(parent);
    } else {
      return undefined;
    }
  }
}

/**
 * Compile a typescript config file to js if necessary, if the js
 * file doesn't exist or is older than the typescript file.
 * @internal
 * @param tsFile path to ts config file
 * @param outDir directory to place the compiled js file
 * @param compileOptions options for us with compilation
 * @returns the path to the compiled javascript config file,
 *   or undefined if the compilation fails.
 */
export async function compileConfigIfNecessary(
  tsFile: string,
  outDir: string,
  compileOptions: ICompileOptions
): Promise<ICompileIfNecessaryResult> {
  if (!(await existsAsync(tsFile))) {
    throw new Error(`config file: ${tsFile} not found`);
  }

  const result = await compileIfNecessary([tsFile], outDir, compileOptions);
  if (!result.success) {
    throw new Error(`failed to compile config file ${tsFile}`);
  }
  return {
    ...result,
    output: jsOutFile(tsFile, outDir),
  };
}

/**
 * get a collection of inputs and mapped outputs
 * @internal
 * @param srcFiles files to be compiled
 * @param outDir directory which compiled files reside
 */
function compilationPairs(
  srcFiles: string[],
  outDir: string
): [string, string][] {
  return srcFiles.map(tsFile => [tsFile, jsOutFile(tsFile, outDir)]);
}

/**
 * Determine if any files are outdated
 * @internal
 * @param filePairs collection of inputs and output files
 */
async function anyOutDated(filePairs: [string, string][]): Promise<boolean> {
  for (const pair of filePairs) {
    const [srcPath, outPath] = pair;
    if (!(await existsAsync(outPath))) {
      return true;
    }
    const srcTime = (await stat(srcPath)).mtime;
    const outTime = (await stat(outPath)).mtime;
    return srcTime > outTime;
  }
  return false;
}

const suffixMap: { [key: string]: string } = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '.mts': '.mjs',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '.cts': '.cjs',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '.ts': '.js',
};
/**
 * Change the suffix on a typescript file to be a javascript extension
 * @internal
 * @param filePath the file path with correct JS extension
 */
function changeSuffix(filePath: string): string {
  const dir = path.dirname(filePath);
  const curSuffix = path.extname(filePath).toLowerCase();
  const newSuffix = suffixMap[curSuffix];
  const base = path.basename(filePath, curSuffix);
  return path.join(dir, base + newSuffix);
}
