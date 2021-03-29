import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import { AxiosError } from 'axios';
import { highlight } from 'cli-highlight';
import sh from 'shelljs';
import YAML from 'yaml';

import { ApixConfig, ApixKind, ApixObject } from './apix.types';

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
    const resource = kind.toLowerCase();
    const files = sh.find(project.path).filter(file => new RegExp(`\\.${resource}\\.ya?ml`).test(file));
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

type ApixLogOptions = { language: string; type: string };

export function apixLog<T>(obj: T, options: ApixLogOptions) {
  let output: string;
  if (options.language === 'json') {
    output = JSON.stringify(obj, undefined, 2);
    prettyPrint(output, options);
    return;
  }
  if (options.language === 'yaml') {
    output = YAML.stringify(obj);
    prettyPrint(output, options);
    return;
  }
  prettyPrint((obj as unknown) as string, options);
}

function prettyPrint(output: string, options: ApixLogOptions) {
  if (process.stdout.isTTY && output.length < 65535) {
    console[options.type](highlight(output, { language: options.language, ignoreIllegals: true }));
  } else {
    console[options.type](output);
  }
}

export const isAxiosError = (error: unknown): error is AxiosError => (error as AxiosError).isAxiosError;
