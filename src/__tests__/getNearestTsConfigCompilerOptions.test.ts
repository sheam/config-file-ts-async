import path from 'path';
import {
  DEFAULT_COMPILER_OPTIONS,
  getNearestTsConfigCompilerOptions,
} from '../getNearestTsConfigCompilerOptions.js';

describe('finds the correct TsConfig file', () => {
  it('given a TS file path', async () => {
    const fileToLoad = path.resolve(
      `${__dirname}/testconfigs/nodenext/example.nodenext.config.mts`
    );
    const expectedTsConfigPath = path.join(
      path.dirname(fileToLoad),
      'tsconfig.json'
    );
    const result = await getNearestTsConfigCompilerOptions(fileToLoad);
    expect(result.tsConfigPath).toBe(expectedTsConfigPath);
  });
  it('given a starting directory', async () => {
    const dir = path.resolve(`${__dirname}/testconfigs/commonjs/subfolder`);
    const expectedTsConfigPath = path.resolve(
      path.join(`${__dirname}/testconfigs/commonjs`, 'tsconfig.json')
    );
    const result = await getNearestTsConfigCompilerOptions(dir);
    expect(result.tsConfigPath).toBe(expectedTsConfigPath);
  });
  it('loads default compiler options if no ts config found', async () => {
    const fsRoot = path.parse(process.cwd()).root;
    const result = await getNearestTsConfigCompilerOptions(fsRoot);
    expect(result.tsConfigPath).toBeFalsy();
    expect(result.compilerOptions).toEqual(DEFAULT_COMPILER_OPTIONS);
  });
  it('loads compiler options from project root when given an directory with no tsconfig file', async () => {
    const expectedTsConfigPath = path.join(
      path.resolve(__dirname, '../..'),
      'tsconfig.json'
    );
    const result = await getNearestTsConfigCompilerOptions(__dirname);
    expect(result.tsConfigPath).toBe(expectedTsConfigPath);
  });
  it('loads compiler options from project root when given an file path with no tsconfig file in parent dir', async () => {
    const expectedTsConfigPath = path.join(
      path.resolve(__dirname, '../..'),
      'tsconfig.json'
    );
    const result = await getNearestTsConfigCompilerOptions(
      path.join(__dirname, 'SharedFile.ts')
    );
    expect(result.tsConfigPath).toBe(expectedTsConfigPath);
  });
});
describe('loads the correct compiler options from the file', () => {
  it('correctly determines strict is true', async () => {
    const dir = path.join(__dirname, 'testconfigs/nodenext');
    const result = await getNearestTsConfigCompilerOptions(dir);
    expect(result.compilerOptions.strict).toBe(true);
  });
  it('correctly determines strict is false', async () => {
    const dir = path.join(__dirname, 'testconfigs/commonjs');
    const result = await getNearestTsConfigCompilerOptions(dir);
    expect(result.compilerOptions.strict).toBe(false);
  });
  it('correctly determines module is CommonJS', async () => {
    const dir = path.join(__dirname, 'testconfigs/commonjs');
    const result = await getNearestTsConfigCompilerOptions(dir);
    expect(result.compilerOptions.module).toBe('CommonJS');
  });
  it('correctly determines module is NodeNext', async () => {
    const dir = path.join(__dirname, 'testconfigs/nodenext');
    const result = await getNearestTsConfigCompilerOptions(dir);
    expect(result.compilerOptions.module).toBe('NodeNext');
  });
});
