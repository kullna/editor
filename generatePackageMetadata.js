import fs from 'fs';
import path from 'path';
import {program} from 'commander';
import semver from 'semver';
import prettier from 'prettier';

async function main() {
  // Read package.json
  const packageJsonPath = path.join('package.json');
  const packageJsonContents = fs.readFileSync(packageJsonPath, 'utf-8');
  const packageData = JSON.parse(packageJsonContents);

  // Define the command-line interface using the incremented version
  program
    .version(packageData.version)
    .description('Generates a package.ts file based on package.json')
    .option('-e, --env <environment>', 'Specify the environment value', 'DEVELOPMENT')
    .parse(process.argv);
  const options = program.opts();
  const environment = options.env;

  // Increment version by one patch number using semantic versioning
  let incrementedVersion = String(packageData.version);
  if (environment === 'DEVELOPMENT') {
    incrementedVersion = String(semver.inc(packageData.version, 'patch'));
    incrementedVersion += '-dev';
  }

  const packageTsContent = `
/* !! THIS IS AN AUTO-GENERATED FILE !! */

/**
 * Represents the package configuration.
 */
export const Package = {
  name: '${packageData.name}',
  version: '${incrementedVersion}',
  description: '${packageData.description}',
  environment: '${environment}'
};
`;

  const packageTsPath = path.join('src', 'package.ts');
  await formatWithPrettier(packageTsContent).then(formattedContent => {
    fs.writeFileSync(packageTsPath, formattedContent);

    console.log(`Name: ${packageData.name}`);
    console.log(`Version: ${incrementedVersion}`);
    console.log(`Description: ${packageData.description}`);
    console.log(`Environment: ${environment}`);
    console.log('');
  });
}

async function formatWithPrettier(content) {
  const prettierConfigPath = path.join(import.meta.url, '..', '.prettierrc.json');

  let options = {parser: 'typescript'};

  try {
    const loadedOptions = await prettier.resolveConfig(prettierConfigPath);
    if (loadedOptions) {
      options = {...options, ...loadedOptions};
    }
  } catch (error) {
    console.error('Error reading prettier config:', error);
  }

  return prettier.format(content, options);
}

main();
