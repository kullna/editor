import fs from 'fs';
import path from 'path';

const startDir = './src';
const outputFilename = 'docs-index.ts';

function traverse(dir, callback) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const absolutePath = path.join(dir, file);
    const stats = fs.statSync(absolutePath);
    if (stats.isDirectory()) {
      traverse(absolutePath, callback);
    } else {
      callback(absolutePath);
    }
  }
}

let importString = '';
let exportsObject = {};

traverse(startDir, filePath => {
  if (filePath.endsWith('.ts') && !filePath.endsWith('index.ts')) {
    const relativePath = path.relative(startDir, filePath);
    const importPath = `./${relativePath}`.replace(/\\/g, '/');
    const alias = filePath.replaceAll('/', '_').replaceAll('.', '_');

    importString += `import * as ${alias} from '${importPath.replace('.ts', '')}';\n`;
    importString += `export * as ${alias} from '${importPath.replace('.ts', '')}';\n`;

    const pathSegments = relativePath.split(path.sep);
    pathSegments.pop(); // Remove filename
    let currentObject = exportsObject;

    for (const segment of pathSegments) {
      if (!currentObject[segment]) {
        currentObject[segment] = {};
      }
      currentObject = currentObject[segment];
    }

    currentObject[path.basename(filePath, '.ts')] = alias;
  }
});

let exportString =
  'export const docsIndex = ' + JSON.stringify(exportsObject, null, 2).replaceAll('"', '') + ';';

const outputString = importString + '\n' + exportString;
fs.writeFileSync(path.join(startDir, outputFilename), outputString);

console.log('Generated ./src/docs-index.ts - useful for generating documentation of private APIs.');
