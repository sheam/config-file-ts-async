import path from 'path';
import {
  CompilerOptions,
  createProgram,
  EmitResult,
  flattenDiagnosticMessageText,
  getPreEmitDiagnostics,
  Program,
} from 'typescript';
import { CompileResult } from './types.js';
import { debugLog } from './util.js';

/**
 * Compile sources
 * @internal
 * @param fileNames file name to compile
 * @param options typesript compiler options
 */
export function tsCompile(
  fileNames: string[],
  options: CompilerOptions
): Promise<CompileResult> {
  return new Promise<CompileResult>((resolve, reject) => {
    debugLog(`compiling: ${fileNames}`);
    try {
      const program = createProgram(fileNames, options);
      const sources = program
        .getSourceFiles()
        .map(f => f.fileName)
        .filter(name => !name.includes('node_modules'));
      const emitResult = program.emit();
      logDiagnostics(program, emitResult);
      resolve({ localSources: sources, compiled: !emitResult.emitSkipped });
    } catch (e: unknown) {
      reject(e);
    }
  });
}

function logDiagnostics(program: Program, emitResult: EmitResult): void {
  const allDiagnostics = getPreEmitDiagnostics(program).concat(
    emitResult.diagnostics
  );

  allDiagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start!
      );
      const message = flattenDiagnosticMessageText(
        diagnostic.messageText,
        '\n'
      );

      const filePath = path.resolve(diagnostic.file.fileName);
      debugLog(`tsc: (${filePath}:${line + 1}:${character + 1}): ${message}`);
    } else {
      debugLog(flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    }
  });
}
