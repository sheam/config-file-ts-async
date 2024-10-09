import { SharedFile } from '../SharedFile.js';

export interface SomeConfigNodeNext {
  foo?: string;
  bar?: number[];
  driver?: string;
  file: SharedFile;
  configType: 'NodeNext';
}

export function sampleNodeNextUtil(): string {
  return 'NodeNext';
}
