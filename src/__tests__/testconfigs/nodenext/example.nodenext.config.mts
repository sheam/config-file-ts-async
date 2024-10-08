import os from 'os';
import {
  SomeConfigNodeNext,
  sampleNodeNextUtil,
} from './SomeConfigNodeNext.mjs';

export default {
  foo: sampleNodeNextUtil(),
  bar: [1, 2, 3],
  driver: os.userInfo().username,
  file: { reason: 'test-compile' },
} as SomeConfigNodeNext;
