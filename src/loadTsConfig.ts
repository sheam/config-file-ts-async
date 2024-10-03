import os, { platform } from 'os';
import path from 'path';
import { compileConfigIfNecessary } from './compileUtil.js';
import { DEFAULT_CACHE_DIR } from './constants.js';
import { CacheConfig } from './types.js';

interface IDefaultModule<TConfig extends object> {
  default: TConfig;
}

/** Load a typescript configuration file.
 * For speed, the typescript file is transpiled to javascript and cached.
 *
 * @param tsFile the file to compile
 * @param cacheConfig where to cache files.
 * @param strict use strict compilation mode
 * @returns the default exported value from the configuration file or undefined
 */
// export async function loadTsConfig<TConfig extends object>(
//   tsFile: string,
//   cacheConfig: CacheConfig,
//   strict = true
// ): Promise<TConfig | undefined> {
export function loadTsConfig<TConfig extends object>(
  tsFile: string,
  cacheConfig: CacheConfig,
  strict = true
): TConfig | undefined {
  const realOutDir = getOutDir(tsFile, cacheConfig);
  const jsConfig = compileConfigIfNecessary(tsFile, realOutDir, strict);
  if (!jsConfig) {
    return undefined;
  }

  const end = jsConfig.length - path.extname(jsConfig).length;
  const requirePath = jsConfig.slice(0, end);
  // const config = await import(requirePath);
  // eslint-disable-next-line
  const config = require(requirePath);
  return (config as IDefaultModule<TConfig>).default;
}

/**
 * Get the output directory for the file.
 * @param tsFile absolute path to ts file to compile
 * @param cacheConfig configuration of cache directory
 */
export function getOutDir(tsFile: string, cacheConfig: CacheConfig): string {
  const tsFileDir = path.dirname(path.resolve(tsFile));

  if (cacheConfig.type === 'global') {
    const safePath =
      platform() === 'win32' ? tsFileDir.replace(/^(.+):/, '$1') : tsFileDir;
    return path.join(
      os.homedir(),
      DEFAULT_CACHE_DIR,
      cacheConfig.programName.replace(/[^a-z0-9]+/gi, '-'),
      safePath
    );
  } else if (cacheConfig.type === 'local') {
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
