import Yargs, { string } from 'yargs';
import axios from 'axios';
import prompts, { PromptType } from 'prompts';
import Ajv from 'ajv';
import YAML from 'yaml';
import ST from 'stjs';

import { ApixApi, ApixRequest, Method } from './apix.types';
import { apixLog, isAxiosError } from './apix.utils';
import { ApixDb } from './apix.db';

const ajv = new Ajv({ allErrors: true });

const render = <T>(template: T, env: Record<string, unknown>): T => ST.select(env).transformWith(template).root();

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
  const questions = request.spec.parameters
    ?.filter(parameter => parameter.required)
    .map(parameter => ({
      type: 'text' as PromptType,
      name: parameter.name,
      message: parameter.name,
      instructions: parameter.description,
      validate: (value: string): true | string => {
        try {
          const object = YAML.parse(value);
          if (!ajv.validate(parameter.schema, object)) return YAML.stringify(ajv.errors);
        } catch {
          return 'could not parse value';
        }
        return true;
      },
    }));
  const env = await prompts(questions);
  const req = render(request.spec.template, env);

  try {
    const result = (
      await axios.request({
        method: req.method as Method,
        url: `${api.spec.url}${req.url}`,
        data: req.body,
      })
    ).data;
    apixLog(result, { language: argv.o as string, type: 'log' });
  } catch (error) {
    if (isAxiosError(error)) {
      console.error(error.message);
      console.error(`status: ${error.response?.status ?? 'UNKNOWN'}`);
      apixLog(error.response.data, { language: argv.o as string, type: 'error' });
    }
  }
};
