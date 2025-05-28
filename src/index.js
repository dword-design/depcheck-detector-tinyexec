import {
  compact,
  filter,
  flatMap,
  flatten,
  groupBy,
  keys,
  map,
  mapValues,
  uniq,
} from '@dword-design/functions';
import fs from 'fs-extra';
import moduleRoot from 'module-root';

export default (node, deps) => {
  if (node.type !== 'CallExpression' || node.callee?.name !== 'x') {
    return [];
  }

  const segments = [
    ...(node.arguments[0].type === 'StringLiteral'
      ? [node.arguments[0].value]
      : []),
    ...(node.arguments[1]?.type === 'ArrayExpression'
      ? node.arguments[1].elements
        |> filter({ type: 'StringLiteral' })
        |> map('value')
      : []),
  ];

  if (segments.length > 0) {
    const binaryPackageMap =
      deps
      |> flatMap(dep => {
        const packageConfig = fs.readJsonSync(
          `${moduleRoot(dep)}/package.json`,
        );

        const bin = packageConfig.bin || {};

        const binaries =
          typeof bin === 'string' ? [packageConfig.name] : bin |> keys;

        return binaries |> map(binary => ({ binary, dep }));
      })
      |> groupBy('binary')
      |> mapValues(tuples => tuples |> map('dep'));

    return (
      segments
      |> map(segment => binaryPackageMap[segment])
      |> compact
      |> flatten
      |> uniq
    );
  }

  return [];
};
