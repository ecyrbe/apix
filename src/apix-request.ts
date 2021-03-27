import Yargs from 'yargs';
import { Method, METHODS } from './apix.types';
import axios from 'axios';

export const command = 'request <method> <url>';
export const describe = 'make an http request using curl requests';
export const builder = (yargs: Yargs.Argv) => {
  yargs.positional('method', { describe: 'method', choices: METHODS });
  yargs.positional('url', { describe: 'url to request' });
  yargs.check((argv: Yargs.Arguments) => {
    if (!/^https?:\/\//.test(argv.url as string)) {
      throw new Error(`url ${argv.url} should start with 'http(s)://'`);
    }
    return true;
  });
};
export const handler = async (argv: Yargs.Arguments) => {
  const result = await axios.request({
    method: argv.method as Method,
    url: argv.url as string,
  });
  console.log(result.data);
};
