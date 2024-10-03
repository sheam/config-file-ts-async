import { PathLike, constants } from 'fs';
import { access } from 'node:fs/promises';

/**
 * @internal
 * Determine if a file exists
 * @param path the path to check
 */
export async function existsAsync(path: PathLike): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}
