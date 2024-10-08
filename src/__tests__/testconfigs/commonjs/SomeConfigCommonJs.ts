import { SharedFile } from '../SharedFile';

export interface SomeConfigCommonJs {
  foo?: string;
  bar?: number[];
  driver?: string;
  file: SharedFile;
}

export function sampleCommonJsUtil(): string {
  return 'CommonJs';
}
