import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import sh from 'shelljs';
import YAML from 'yaml';

import { ApixConfig, ApixKind, ApixObject, ApixResources } from './apix.types';
import { resolve } from 'node:path';

let configPath = join(homedir(), '.apix');
let configFile = join(configPath, 'apix.config.yml');
let config: ApixConfig = undefined;

export async function getConfig() {
  if (!config) {
    const file = (await readFile(configFile)).toString();
    config = YAML.parse(file);
  }
  return config;
}

export async function hasConfig() {
  return !!config || (sh.test('-e', configPath) && sh.test('-e', configFile));
}

export async function loadResources(kind: ApixKind): Promise<ApixObject[]> {
  const config = await getConfig();
  const project = config.spec.projects.find(project => project.name === config.spec.project);
  if (project) {
    const files = sh.find(project.path).filter(file => new RegExp(`\\.${kind}\\.ya?ml`).test(file));
    const resources = await Promise.allSettled(
      files.map(async file => {
        const document = (await readFile(file)).toString();
        return YAML.parse(document) as ApixObject;
      })
    );
    resources
      .filter((resource): resource is PromiseRejectedResult => resource.status === 'rejected')
      .forEach(resource => console.error(resource.reason));
    return resources
      .filter((resource): resource is PromiseFulfilledResult<ApixObject> => resource.status === 'fulfilled')
      .map(resource => resource.value);
  }
}

export async function storeResources(directory: string, resources: ApixObject[]) {
  if (!sh.test('-e', directory)) {
    sh.mkdir(directory);
  }
  resources.forEach(resource => {
    writeFile(
      join(directory, `${resource.metadata.name}.${resource.kind.toLowerCase()}.yml`),
      YAML.stringify(resource),
      {
        flag: 'w',
      }
    );
  });
}
