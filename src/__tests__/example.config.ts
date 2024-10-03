import * as os from 'os';
import { SomeConfig, someConfigUtil } from './SomeConfig.js';

export default {
  foo: someConfigUtil(),
  bar: [1, 2, 3],
  driver: os.userInfo().username,
} as SomeConfig;
