/* eslint-disable @typescript-eslint/explicit-function-return-type */
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  compileConfigIfNecessary,
  jsOutFile,
  nearestNodeModules,
  symLinkForce,
} from '../compileUtil.js';
import { ILoadOptions } from '../types.js';
import { getOutDir } from '../loadTsConfig.js';
import { rimrafSync } from 'rimraf';
import { TEST_CACHE_DIR } from './contants.js';

test('jsOutFile (windows)', () => {
  if (os.platform() !== 'win32') return;

  const file = 'test/example.config.ts';
  const outFile = jsOutFile(file, TEST_CACHE_DIR);
  const expected = path.join(
    TEST_CACHE_DIR,
    process.cwd().replace(/^.:/, ''),
    file.replace(/\.ts$/, '.js')
  );
  expect(outFile).toEqual(expected);
});

test('jsOutFile (non-windows)', () => {
  if (os.platform() === 'win32') return;

  const file = 'test/example.config.ts';
  const cwd = path.resolve(process.cwd());
  const outFile = jsOutFile(file, TEST_CACHE_DIR);
  const expected = path.join(TEST_CACHE_DIR, cwd, file);
  expect(outFile).toEqual(expected);
});

test('nearestNodeModules', async () => {
  const nodeModules = await nearestNodeModules('test')!;
  const expectedPath = path.join(path.resolve(process.cwd()), 'node_modules');
  expect(nodeModules).toEqual(expectedPath);
});

test('symLinkForce deletes if necessary', async () => {
  const tempDir = fs.mkdtempSync('symLinkTest');
  const link = path.join(tempDir, 'link');
  try {
    expect(fs.existsSync(link)).toBeFalsy();
    await symLinkForce('/', link);
    await symLinkForce('/', link);
    expect(fs.existsSync(link)).toBeTruthy();
    expect(fs.lstatSync(link).isSymbolicLink()).toBeTruthy();
  } finally {
    fs.rmSync(tempDir, { recursive: true });
  }
});

describe('makes use of cache', () => {
  const exampleConfigFile = `${__dirname}/testconfigs/commonjs/example.commonjs.config.ts`;
  const config = {
    cacheConfig: { cacheType: 'local', cacheDir: TEST_CACHE_DIR },
    compileConfig: {
      strict: false,
      module: 'CommonJS',
    },
  } as ILoadOptions;
  const outDir = getOutDir(exampleConfigFile, config.cacheConfig);
  beforeEach(() => {
    rimrafSync(outDir);
  });
  it('loading a config file twice does not recompile', async () => {
    const realOutDir = getOutDir(exampleConfigFile, config.cacheConfig);
    const firstResult = await compileConfigIfNecessary(
      exampleConfigFile,
      realOutDir,
      config.compileConfig
    );
    const secondResult = await compileConfigIfNecessary(
      exampleConfigFile,
      realOutDir,
      config.compileConfig
    );
    expect(firstResult.success).toBe(true);
    expect(firstResult.compiled).toBe(true);

    expect(secondResult.success).toBe(true);
    expect(secondResult.compiled).toBe(false);
  });
});
