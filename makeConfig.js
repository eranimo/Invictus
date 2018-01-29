const { lstatSync, readdirSync, writeFileSync } = require('fs')
const { join } = require('path')

const isDirectory = source => lstatSync(source).isDirectory();
const getDirectories = source => readdirSync(source).map(name => join(source, name)).filter(isDirectory);

var paths = {
  'worker-loader!*': ['*']
};
const packages = getDirectories('./packages');
for (const dir of packages) {
  const dirname = dir.replace('packages/', '');
  paths[`@invictus/${dirname}`] = [`./${dirname}/src`];
  paths[`@invictus/${dirname}/*`] = [`./${dirname}/src/*`];
}


const config = {
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": "./packages",
    "paths": paths
  },
  "include": [
    "typings",
    "packages/*/src/**/*"
  ],
  "exclude": [
    "node_modules"
  ]
}
console.log('Making tsconfig.json for lerna project...');
writeFileSync('./tsconfig.json', JSON.stringify(config, null, 2));
