import * as os from 'os';
import { sampleCommonJsUtil, SomeConfigCommonJs } from './SomeConfigCommonJs';

export default {
  foo: sampleCommonJsUtil(),
  bar: [1, 2, 3],
  driver: os.userInfo().username,
} as SomeConfigCommonJs;
