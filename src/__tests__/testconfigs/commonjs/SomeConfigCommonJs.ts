import { SharedFile } from '../SharedFile.js';

export interface SomeConfigCommonJs {
  foo?: string;
  bar?: number[];
  driver?: string;
  file: SharedFile;
  configType: 'CommonJS';
}

export function sampleCommonJsUtil(): string {
  return 'CommonJs';
}
