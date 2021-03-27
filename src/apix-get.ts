import Yargs from 'yargs';
import YAML from 'yaml';

import { ApixDb } from './apix.db';

export const command = 'get <resource>';
export const describe = 'get all resources of a given type';
export const builder = (yargs: Yargs.Argv) => {
  return yargs.positional('resource', { describe: 'name an apix resource type' });
};
export const handler = async (argv: Yargs.Arguments) => {
  console.log(YAML.stringify(await new ApixDb().find({ kind: argv.resource as string })));
};
