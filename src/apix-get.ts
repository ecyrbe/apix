import Yargs from 'yargs';
import { isEmpty } from 'lodash';
import { apixLog } from './apix.utils';

import { ApixDb } from './apix.db';

export const command = 'get <resource>';
export const describe = 'get all resources of a given type';
export const builder = (yargs: Yargs.Argv) => {
  return yargs.positional('resource', { describe: 'name an apix resource type' });
};
export const handler = async (argv: Yargs.Arguments) => {
  const result = await new ApixDb().find({ kind: argv.resource as string });
  if (isEmpty(result)) {
    console.error(`No resource named '${argv.resource}' found.`);
    return;
  }
  apixLog(result, argv.o as string);
};
