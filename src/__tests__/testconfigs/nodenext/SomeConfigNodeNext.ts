import { SharedFile } from '../SharedFile.js';

export interface SomeConfigNodeNext {
  foo?: string;
  bar?: number[];
  driver?: string;
  file: SharedFile;
}

export function sampleNodeNextUtil(): string {
  return 'NodeNext';
}
