import { CompilerOptions, ModuleKind, ScriptTarget } from 'typescript';
import { FS_ROOT } from './constants.js';
import { ICompileOptions } from './types.js';

export function getTsCompileOptions(
  outDir: string,
  compileOptions: ICompileOptions
): CompilerOptions {
  return {
    outDir,
    target: ScriptTarget.ESNext,
    rootDir: FS_ROOT,
    module: ModuleKind[compileOptions.module] || ModuleKind.CommonJS,
    allowJs: true,
    skipLibCheck: true,
    strict: compileOptions.strict,
    noImplicitAny: compileOptions.strict,
    noEmitOnError: true,
  } as CompilerOptions;
}
