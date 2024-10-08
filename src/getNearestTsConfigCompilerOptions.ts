import { find as findTsConfig, load as loadTsConfig } from 'tsconfig';
import { ICompileOptions } from './types.js';

const DefaultCompileOptions = {
  strict: false,
  module: 'CommonJS',
} as ICompileOptions;

interface ILoadConfigResult {
  compilerOptions: ICompileOptions;
  tsConfigPath: string | undefined;
}

/**
 * Get the necessary compiler options from the nearest TS Config.
 * @param startDir the starting directory to search _up_ from.
 * @return compiler options, or the default options if no tsconfig file is found.
 */
export async function getNearestTsConfigCompilerOptions(
  startDir: string
): Promise<ILoadConfigResult> {
  const tsConfigFilePath = await findTsConfig(startDir);
  if (!tsConfigFilePath) {
    return { compilerOptions: DefaultCompileOptions, tsConfigPath: undefined };
  }
  const loadResult = await loadTsConfig(tsConfigFilePath);
  const options = loadResult.config.compilerOptions;
  const moduleOption = (
    options.module ||
    options.moduleResolution ||
    ''
  ).toLowerCase();
  return {
    tsConfigPath: tsConfigFilePath,
    compilerOptions: {
      strict: options.strict === true,
      module:
        moduleOption === 'nodenext' || moduleOption === 'node16'
          ? 'NodeNext'
          : 'CommonJS',
    },
  };
}
