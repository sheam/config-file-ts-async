import path from 'path';

/**
 * Name of cache directory.
 * @internal
 */
export const DEFAULT_CACHE_DIR = '.ts-config-file-cache';
export const FS_ROOT = path.parse(process.cwd()).root;
