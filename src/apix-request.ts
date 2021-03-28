import Yargs from 'yargs';
import axios from 'axios';
import { Method, METHODS } from './apix.types';
import { apixLog } from './apix.utils';

export const command = 'request <method> <url>';
export const describe = 'make an http request using curl requests';
export const builder = (yargs: Yargs.Argv) => {
  yargs.positional('method', { describe: 'http verb to make the request', choices: METHODS });
  yargs.positional('url', { describe: 'url to request' });
  yargs.check((argv: Yargs.Arguments) => {
    if (!/^https?:\/\//.test(argv.url as string)) {
      throw new Error(`url ${argv.url} should start with 'http(s)://'`);
    }
    return true;
  });
};
export const handler = async (argv: Yargs.Arguments) => {
  const result = (
    await axios.request({
      method: argv.method as Method,
      url: argv.url as string,
    })
  ).data;
  apixLog(result, argv.o as string);
};
