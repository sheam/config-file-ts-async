import { CompilerOptions, ModuleKind } from 'typescript';
import { FS_ROOT } from './constants.js';
import { ICompileOptions } from './types.js';

export function getTsCompileOptions(
  outDir: string,
  compileOptions: ICompileOptions
): CompilerOptions {
  return {
    outDir,
    rootDir: FS_ROOT,
    module: ModuleKind[compileOptions.module] || ModuleKind.CommonJS,
    skipLibCheck: true,
    strict: compileOptions.strict === true,
    noImplicitAny: compileOptions.strict === true,
    noEmitOnError: true,
  } as CompilerOptions;
}
