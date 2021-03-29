import Yargs from 'yargs';
import { isEmpty } from 'lodash';
import { apixLog } from './apix.utils';

import { ApixDb } from './apix.db';
import { ApixResource } from './apix.types';

export const command = 'get <resource>';
export const describe = 'get all resources of a given type';
export const builder = (yargs: Yargs.Argv) => {
  return yargs.positional('resource', { describe: 'name an apix resource type' });
};
export const handler = async (argv: Yargs.Arguments) => {
  const db = new ApixDb();
  const resource = await db.findOne<ApixResource>({
    kind: 'Resource' as string,
    'metadata.name': argv.resource as string,
  });
  if (!resource) {
    console.error(`No resource named '${argv.resource}' found. use 'apix get resource' to list resource types`);
    return;
  }
  const request = { kind: resource.spec.kind };
  const result = await db.find(request);
  if (result.length === 0) {
    console.error(`No resource named '${argv.resource}' found. use 'apix get resource' to list resource types`);
    return;
  }
  apixLog(result, { language: argv.o as string, type: 'log' });
};
