import Yargs from 'yargs';
import axios from 'axios';
import { ApixApi, ApixRequest, Method, METHODS } from './apix.types';
import { apixLog } from './apix.utils';
import { ApixDb } from './apix.db';

export const command = 'exec <request> [parameters..]';
export const describe = 'execute a request by name';
export const builder = (yargs: Yargs.Argv) => {
  yargs.positional('request', { describe: 'request to execute' });
  yargs.positional('parameters', { describe: 'optional request parameters' });
};
export const handler = async (argv: Yargs.Arguments) => {
  const db = new ApixDb();
  const request = await db.findOne<ApixRequest>({ kind: 'Request', 'metadata.name': argv.request as string });
  if (!request) {
    console.error(`No request named '${argv.request}' found. use 'apix get request' to list all available requests`);
    return;
  }
  const api = await db.findOne<ApixApi>({ kind: 'Api', 'metadata.name': request.metadata.labels.api });
  const result = (
    await axios.request({
      method: request.spec.template.method as Method,
      url: `${api.spec.url}${request.spec.template.url}`,
    })
  ).data;
  apixLog(result, argv.o as string);
};
