/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { rimrafSync } from 'rimraf';
import { _withCompileCount } from '../compileUtil.js';
import { getOutDir, loadTsConfig } from '../loadTsConfig.js';
import { SomeConfig, someConfigUtil } from './SomeConfig.js';
import { CacheConfig } from '../types.js';
import path from 'path';
import os from 'os';
import { DEFAULT_CACHE_DIR } from '../constants.js';

export const exampleConfigFile = `${__dirname}/example.config.ts`;

describe('cache dir', () => {
  it('local cache dir', () => {
    const config = {
      type: 'local',
      cacheDir: '.config-file-ts-node-cache-tests',
    } as CacheConfig;
    const outDir = getOutDir(exampleConfigFile, config);
    expect(outDir).toEqual(
      path.resolve(
        `${process.cwd()}/.config-file-ts-node-cache-tests/src/__tests__`
      )
    );
  });
  it('global cache dir', () => {
    const config = {
      type: 'global',
      programName: 'config file tests',
    } as CacheConfig;
    const outDir = getOutDir(exampleConfigFile, config);
    expect(
      outDir.startsWith(path.join(os.homedir(), DEFAULT_CACHE_DIR))
    ).toBeTruthy();
    expect(outDir.endsWith(__dirname.substring(2))).toBeTruthy();
  });
});

describe('loading', () => {
  const LOCAL_CACHE_CONFIG: CacheConfig = {
    type: 'local',
    cacheDir: '.config-file-ts-node-cache-tests',
  };
  let outDir: string;
  beforeEach(() => {
    outDir = getOutDir(exampleConfigFile, LOCAL_CACHE_CONFIG);
    rimrafSync(outDir);
  });

  it('loading a config file', () => {
    const conf = loadTsConfig<SomeConfig>(
      exampleConfigFile,
      LOCAL_CACHE_CONFIG
    )!;
    expect(conf).toBeDefined();
    expect(conf.foo).toEqual(someConfigUtil());
    expect(conf.bar).toStrictEqual([1, 2, 3]);
  });

  it('loading a config file twice does not recompile', () => {
    const compiles = _withCompileCount(() => {
      loadTsConfig(exampleConfigFile, LOCAL_CACHE_CONFIG);
      loadTsConfig(exampleConfigFile, LOCAL_CACHE_CONFIG);
    });
    expect(compiles).toEqual(1);
  });
});
