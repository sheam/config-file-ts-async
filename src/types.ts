interface IGlobalCacheConfig {
  /**
   * Use global if this will be used in a utility application that may be run from any directory.
   * The cache directory will the users home directory.
   */
  cacheType: 'global';

  /**
   * Name of the program. Use to avoid collision in the global cache directory.
   */
  programName: string;
}

interface IProjectCacheConfig {
  /**
   * Use local for use within your own projects.
   * The cache directory will be placed in the current working directory;
   * In the case of an NPM script this is always beside the package.json file.
   */
  cacheType: 'local';

  /**
   * Name of the cash dir relative to the package.json file. Defaults to the value of DEFAULT_CACHE_DIR.
   */
  cacheDir?: string;
}

export type CacheConfig = IGlobalCacheConfig | IProjectCacheConfig;

export interface ICompileOptions {
  strict?: boolean;
  module: 'CommonJS' | 'NodeNext';
}

export interface ILoadOptions {
  cacheConfig: CacheConfig;
  compileConfig: ICompileOptions;
}

export interface ICompileIfNecessaryResult {
  success: boolean;
  compiled: boolean;
  output?: string;
}

export interface CompileResult {
  localSources: string[];
  compiled: boolean;
}
