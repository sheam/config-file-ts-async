/* eslint-disable @typescript-eslint/explicit-function-return-type */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { jsOutFile, nearestNodeModules, symLinkForce } from '../compileUtil.js';

const CACHE_DIR = '.config-file-ts-cache';
test('jsOutFile (windows)', () => {
  if (os.platform() !== 'win32') return;

  const file = 'test/example.config.ts';
  const outFile = jsOutFile(file, CACHE_DIR);
  const expected = path.join(
    CACHE_DIR,
    process.cwd().replace(/^.:/, ''),
    file.replace(/\.ts$/, '.js')
  );
  expect(outFile).toEqual(expected);
});

test('jsOutFile (non-windows)', () => {
  if (os.platform() === 'win32') return;

  const file = 'test/example.config.ts';
  const cwd = path.resolve(process.cwd());
  const outFile = jsOutFile(file, CACHE_DIR);
  const expected = path.join(CACHE_DIR, cwd, file);
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
