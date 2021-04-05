import Yargs from 'yargs';
import { isEmpty } from 'lodash';
import { apixLog } from './apix.utils';

import { ApixDb } from './apix.db';
import { ApixResource } from './apix.types';

export const getResource = async (resource: string) => {
  const db = new ApixDb();
  const result = await db.findOne<ApixResource>({
    kind: 'Resource' as string,
    'metadata.name': resource,
  });
  if (!result) {
    console.error(`No resource named '${resource}' found. use 'apix get resource' to list resource types`);
    return [];
  }
  const request = { kind: result.spec.kind };
  return db.find(request);
};

export const command = 'get <resource>';
export const describe = 'get all resources of a given type';
export const builder = (yargs: Yargs.Argv) => {
  return yargs
    .positional('resource', { describe: 'name an apix resource type' })
    .completion('completion', async (current, argv) => {
      const resources = await getResource('resource');
      return resources?.map(resource => resource.metadata.name) ?? [];
    });
};
export const handler = async (argv: Yargs.Arguments) => {
  const result = await getResource(argv.resource as string);
  if (result.length === 0) {
    console.error(`No resource named '${argv.resource}' found. use 'apix get resource' to list resource types`);
    return;
  }
  apixLog(result, { language: argv.o as string, type: 'log' });
};
