import tester from '@dword-design/tester';
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir';
import depcheck from 'depcheck';
import outputFiles from 'output-files';

import self from './index.js';

export default tester(
  {
    args: {
      'node_modules/foo/package.json': JSON.stringify({
        bin: './dist/cli.js',
        name: 'foo',
      }),
      'src/index.js': "x('bar', ['foo'])",
    },
    'bin object': {
      'node_modules/foo/package.json': JSON.stringify({
        bin: { foo: './dist/cli.js' },
      }),
      'src/index.js': "x('foo')",
    },
    'bin string': {
      'node_modules/foo/package.json': JSON.stringify({
        bin: './dist/cli.js',
        name: 'foo',
      }),
      'src/index.js': "x('foo')",
    },
    'esm not exporting package.json': {
      'node_modules/foo': {
        'package.json': JSON.stringify({
          bin: { bar: './dist/cli.js' },
          exports: './src/index.js',
          main: 'src/index.js',
          type: 'module',
        }),
        'src/index.js': '',
      },
      'src/index.js': "x('bar')",
    },
    valid: {
      'node_modules/foo/package.json': JSON.stringify({
        bin: './dist/cli.js',
        name: 'foo',
      }),
      'src/index.js': "x('foo')",
    },
  },
  [
    {
      transform: test => async () => {
        await outputFiles(test);

        const result = await depcheck('.', {
          detectors: [self],
          package: { dependencies: { foo: '^1.0.0' } },
        });

        expect(result.dependencies).toEqual([]);
      },
    },
    testerPluginTmpDir(),
  ],
);
