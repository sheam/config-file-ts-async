## config-file-ts-async

_Just use TypeScript for configuration files._

####

### Summary

Based on config-file-ts by _lee mighdoll_.
This version adds support for asynchronous opperations, and more flexible cache storage.

TypeScript is more syntactically **flexible** than JSON. Comments are allowed. Keys needn't be quoted.
Arrays can have trailing commas.

TypeScript allows a little **programming** in config files. Share variables, use utility functions, etc.

TypeScript **types** provide free error checking, and free IDE support for getting config files right.

### Fast

Parsing TypeScript config files is plenty quick. config-file-ts caches the TypeScript output.

Assuming TypeScript is in your environment, config-file-ts adds about 5kb to your program, or 1.5kb minified.

### How to use

```bash
$ yarn add config-file-ts-async
```

In the config file, export default. `my.config.ts`:

```ts
export default {
  entry: 'my stuff', // comments are welcome now
};
```

Feel free to add types and scripting. `my.config.ts`:

```ts
import os from 'os'; // use installed libraries in the config
import { MyConfig } from './MyProgram';

export default {
  entry: `${os.userInfo().username}'s stuff`, // use scripting in the config file
} as MyConfig; // typecheck the config file
```

Read the config file in your program. `MyProgram.ts`:

```ts
export interface MyConfig {
  entry?: string;
}

const config = await loadTsConfig<MyConfig>('my.config.ts', {
  cacheType: 'local',
});
```

### tsconfig.json

You can control how the config file is compiled with a TS Config file.
The options honoured are: strict and module. So you can put a tsconfig.json file beside your config file:

```json
{
  "compilerOptions": {
    "strict": true, // this setting is honoured
    "module": "CommonJS", // or "NodeNext" is also supported
    "target": "ESNext" // hardcoded: but set it in your tsconfig for linting purposes
  }
}
```
