/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { rimrafSync } from 'rimraf';
import { getOutDir, loadTsConfig } from '../loadTsConfig.js';
import { SomeConfig, someConfigUtil } from './SomeConfig.js';
import { CacheConfig } from '../types.js';
// @ts-ignore
import path from 'path';
// @ts-ignore
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

  it('loading a config file', async () => {
    const conf = await loadTsConfig<SomeConfig>(
      exampleConfigFile,
      LOCAL_CACHE_CONFIG,
      false
    )!;
    expect(conf).toBeDefined();
    expect(conf!.foo).toEqual(someConfigUtil());
    expect(conf!.bar).toStrictEqual([1, 2, 3]);
  });

  //TODO
  // it('loading a config file twice does not recompile', async () => {
  //   const firstResult = await loadTsConfig(exampleConfigFile, LOCAL_CACHE_CONFIG);
  //   const secondResult = await loadTsConfig(exampleConfigFile, LOCAL_CACHE_CONFIG);
  //   expect(firstResult.).toEqual(1);
  // });
});
