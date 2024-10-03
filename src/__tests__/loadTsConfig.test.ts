/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { rimrafSync } from 'rimraf';
import { _withCompileCount } from '../compileUtil.js';
import { defaultOutDir, loadTsConfig } from '../loadTsConfig.js';
import { SomeConfig, someConfigUtil } from './SomeConfig.js';

export const exampleConfigFile = `${__dirname}/example.config.ts`;

test('loading a config file', () => {
  const outDir = defaultOutDir(exampleConfigFile);
  rimrafSync(outDir);
  const conf = loadTsConfig<SomeConfig>(exampleConfigFile)!;
  expect(conf.foo).toEqual(someConfigUtil());
  expect(conf.bar).toStrictEqual([1, 2, 3]);
});

test('loading a config file twice does not recompile', () => {
  const outDir = defaultOutDir(exampleConfigFile);
  rimrafSync(outDir);
  const compiles = _withCompileCount(() => {
    loadTsConfig(exampleConfigFile);
    loadTsConfig(exampleConfigFile);
  });
  expect(compiles).toEqual(1);
});
