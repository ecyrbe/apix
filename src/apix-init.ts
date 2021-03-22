import { homedir } from 'os';
import { writeFileSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import * as sh from 'shelljs';
import Yargs from 'yargs';
import YAML from 'yaml';
import { merge } from 'lodash';

import { ApixConfig, ApixMode, ApixResources } from './apix.types';
import { resourceUsage } from 'node:process';

export const command = 'init [name]';
export const describe = 'create an apix project ';
export const builder = (yargs: Yargs.Argv) => {
  yargs.options('path', { describe: 'optional path to apix repository', default: '.' });
  yargs.positional('name', { describe: 'name of the repository', default: 'default' });
};
export const handler = async (argv: Yargs.Arguments) => {
  const projectName = argv.name as string;
  const projectPath = resolve(argv.path as string);

  const configPath = join(homedir(), '.apix');
  if (!sh.test('-e', configPath)) {
    sh.mkdir(configPath);
  }

  const configFile = join(configPath, 'apix.config.yml');
  let config: ApixConfig = {
    apiVersion: 'apix/v1',
    kind: 'Configuration',
    metadata: {
      name: 'config',
      labels: {
        app: 'apix',
      },
    },
    spec: {
      mode: ApixMode.operations,
      projects: [
        {
          name: projectName,
          path: projectPath,
        },
      ],
      project: projectName,
    },
  };
  if (sh.test('-f', configFile)) {
    const original = YAML.parse(readFileSync(configFile).toString());
    config = merge(original, config);
  }
  writeFileSync(configFile, YAML.stringify(config), { flag: 'w' });

  let resources: ApixResources[] = [
    {
      apiVersion: 'apix/v1',
      kind: 'Resource',
      metadata: {
        name: 'resource',
        labels: {
          name: 'apix',
        },
      },
      spec: {
        description: 'apix resource types',
        kind: 'Resource',
        apified: false,
        operations: ['get'],
      },
    },
    {
      apiVersion: 'apix/v1',
      kind: 'Resource',
      metadata: {
        name: 'api',
        labels: {
          name: 'apix',
        },
      },
      spec: {
        description: 'declared apis',
        kind: 'Api',
        apified: false,
        operations: ['get', 'create', 'delete', 'patch', 'describe'],
      },
    },
    {
      apiVersion: 'apix/v1',
      kind: 'Resource',
      metadata: {
        name: 'endpoint',
        labels: {
          name: 'apix',
        },
      },
      spec: {
        description: 'declared endpoints of an api',
        kind: 'Endpoint',
        apified: true,
        operations: ['get', 'create', 'delete', 'patch', 'describe', 'exec'],
      },
    },
  ];
  resources.forEach((resource) => {
    const resourceFile = join(projectPath, `apix.${resource.metadata.name}.resource.yml`);
    if (sh.test('-f', resourceFile)) {
      const original = YAML.parse(readFileSync(resourceFile).toString());
      config = merge(original, resource);
    }
    writeFileSync(resourceFile, YAML.stringify(resource), { flag: 'w' });
  });
};
