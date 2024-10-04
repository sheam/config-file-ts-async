import os, { platform } from 'os';
import path from 'path';
import { compileConfigIfNecessary } from './compileUtil.js';
import { DEFAULT_CACHE_DIR } from './constants.js';
import { CacheConfig, ILoadOptions } from './types.js';

/** Load a typescript configuration file.
 * For speed, the typescript file is transpiled to javascript and cached.
 * @internal
 * @param tsFile the file to compile
 * @param loadOptions options how compilation happens, and where output is cached
 * @returns the default exported value from the configuration file or undefined
 */
export async function loadTsConfig<TConfig extends object>(
  tsFile: string,
  loadOptions: ILoadOptions
): Promise<TConfig> {
  const realOutDir = getOutDir(tsFile, loadOptions.cacheConfig);
  const jsConfigCompileResult = await compileConfigIfNecessary(
    tsFile,
    realOutDir,
    loadOptions.compileConfig
  );
  if (!jsConfigCompileResult.success) {
    throw new Error(`Failed to compile config file ${tsFile}`);
  }
  const modulePath: string =
    loadOptions.compileConfig.module === 'NodeNext'
      ? `file://${path.resolve(jsConfigCompileResult.output!)}`
      : jsConfigCompileResult.output!;
  try {
    const config = await import(modulePath);
    return config.default as TConfig;
  } catch (e: unknown) {
    throw new Error(
      `Failed to import compiled config file from ${modulePath}`,
      { cause: e }
    );
  }
}

/**
 * Get the output directory for the file.
 * @internal
 * @param tsFile absolute path to ts file to compile
 * @param cacheConfig configuration of cache directory
 */
export function getOutDir(tsFile: string, cacheConfig: CacheConfig): string {
  const tsFileDir = path.dirname(path.resolve(tsFile));

  if (cacheConfig.cacheType === 'global') {
    const safePath =
      platform() === 'win32' ? tsFileDir.replace(/^(.+):/, '$1') : tsFileDir;
    return path.join(
      os.homedir(),
      DEFAULT_CACHE_DIR,
      cacheConfig.programName.replace(/[^a-z0-9]+/gi, '-'),
      safePath
    );
  } else if (cacheConfig.cacheType === 'local') {
    const subDir = cacheConfig.cacheDir || DEFAULT_CACHE_DIR;
    if (path.isAbsolute(subDir)) {
      throw new Error(
        `cache directory '${subDir}' is not a path relative to the project root '${process.cwd()}'.`
      );
    }
    const relativePath = tsFileDir.replace(process.cwd(), '');
    return path.join(process.cwd(), subDir, relativePath);
  }
  throw new Error('unknown cache config type');
}
