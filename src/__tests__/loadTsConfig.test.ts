/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { rimrafSync } from 'rimraf';
import { getOutDir, loadTsConfig } from '../loadTsConfig.js';
import { CacheConfig, ILoadOptions } from '../types.js';
// @ts-ignore
import path from 'path';
// @ts-ignore
import os from 'os';
import { DEFAULT_CACHE_DIR } from '../constants.js';
import {
  sampleCommonJsUtil,
  SomeConfigCommonJs,
} from './testconfigs/commonjs/SomeConfigCommonJs.js';

describe('cache dir', () => {
  const exampleConfigFile = `${__dirname}/example.config.ts`;
  it('local cache dir', () => {
    const config = {
      cacheType: 'local',
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
      cacheType: 'global',
      programName: 'config file tests',
    } as CacheConfig;
    const outDir = getOutDir(exampleConfigFile, config);
    expect(
      outDir.startsWith(path.join(os.homedir(), DEFAULT_CACHE_DIR))
    ).toBeTruthy();
    expect(outDir.endsWith(__dirname.substring(2))).toBeTruthy();
  });
});

describe('loading CommonJS config', () => {
  const exampleConfigFile = `${__dirname}/testconfigs/commonjs/example.commonjs.config.ts`;
  const loadConfig: ILoadOptions = {
    cacheConfig: {
      cacheType: 'local',
      cacheDir: '.config-file-ts-node-cache-tests',
    },
    compileConfig: {
      module: 'CommonJS',
      strict: false,
    },
  };
  let outDir: string;
  beforeEach(() => {
    outDir = getOutDir(exampleConfigFile, loadConfig.cacheConfig);
    rimrafSync(outDir);
  });

  it('loading a config file', async () => {
    const conf = await loadTsConfig<SomeConfigCommonJs>(
      exampleConfigFile,
      loadConfig
    )!;
    expect(conf).toBeDefined();
    expect(conf!.foo).toEqual(sampleCommonJsUtil());
    expect(conf!.bar).toStrictEqual([1, 2, 3]);
  });
});

describe('loading NodeNext config', () => {
  const exampleConfigFile = `${__dirname}/testconfigs/nodenext/example.nodenext.config.ts`;
  const loadConfig: ILoadOptions = {
    cacheConfig: {
      cacheType: 'local',
      cacheDir: '.config-file-ts-node-cache-tests',
    },
    compileConfig: {
      module: 'NodeNext',
      strict: false,
    },
  };

  it('loading a config file', async () => {
    rimrafSync((loadConfig.cacheConfig as any).cacheDir);
    const conf = await loadTsConfig<any>(exampleConfigFile, loadConfig)!;
    expect(conf).toBeDefined();
    // expect(conf!.foo).toEqual(sampleNodeNextUtil());
    // expect(conf!.bar).toStrictEqual([1, 2, 3]);
  });
});
