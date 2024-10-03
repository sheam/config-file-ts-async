/* eslint-disable @typescript-eslint/explicit-function-return-type */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { jsOutFile, nearestNodeModules, symLinkForce } from '../compileUtil.js';

const CACHE_DIR = '.config-file-ts-cache';
test('jsOutFile (windows)', () => {
  if (os.platform() !== 'win32') return;

  const outFile = jsOutFile('test\\example.config.ts', CACHE_DIR);
  const expected = `.config-file-ts-cache\\Users\\${process.env.USERNAME}\\source\\repos\\config-file-ts\\test\\example.config.js`;
  expect(outFile).toEqual(expected);
});

test('jsOutFile (non-windows)', () => {
  if (os.platform() === 'win32') return;

  const cwd = path.resolve(process.cwd());
  const outFile = jsOutFile('test/example.config.ts', 'out');
  expect(outFile).toEqual(path.join('out', cwd, 'test', 'example.config.js'));
});

test('nearestNodeModules', () => {
  const nodeModules = nearestNodeModules('test')!;
  const expectedPath = path.join(path.resolve(process.cwd()), 'node_modules');
  expect(nodeModules).toEqual(expectedPath);
});

test('symLinkForce deletes if necessary', () => {
  const tempDir = fs.mkdtempSync('symLinkTest');
  const link = path.join(tempDir, 'link');
  try {
    expect(fs.existsSync(link)).toBeFalsy();
    symLinkForce('/', link);
    symLinkForce('/', link);
    expect(fs.existsSync(link)).toBeTruthy();
    expect(fs.lstatSync(link).isSymbolicLink()).toBeTruthy();
  } finally {
    fs.rmSync(tempDir, { recursive: true });
  }
});
