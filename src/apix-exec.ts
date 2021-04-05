import Yargs from 'yargs';
import axios from 'axios';
import inquirer from 'inquirer';
import Ajv from 'ajv';
import YAML from 'yaml';
import ST from 'stjs';

import { ApixApi, ApixRequest, Method } from './apix.types';
import { apixLog, isAxiosError } from './apix.utils';
import { ApixDb } from './apix.db';
import { getResource } from './apix-get';

const ajv = new Ajv({ allErrors: true });

const render = <T>(template: T, env: Record<string, unknown>): T => ST.select(env).transformWith(template).root();

export const command = 'exec <request> [parameters..]';
export const describe = 'execute a request by name';
export const builder = (yargs: Yargs.Argv) => {
  yargs.completion('completion', async (current, argv) => {
    const resources = await getResource('request');
    return resources?.map(resource => resource.metadata.name) ?? [];
  });
  yargs.positional('request', { describe: 'request to execute' });
  yargs.positional('parameters', { describe: 'optional request parameters with key:value format', array: true });
  yargs.check((argv: Yargs.Arguments) => {
    const parameters = argv.parameters as string[];
    if (!parameters.every(parameter => parameter.indexOf(':') !== -1)) {
      throw new Error('Exec parameters should be og the form <key:value> ');
    }
    return true;
  });
};
export const handler = async (argv: Yargs.Arguments) => {
  const db = new ApixDb();
  const request = await db.findOne<ApixRequest>({ kind: 'Request', 'metadata.name': argv.request as string });
  if (!request) {
    console.error(`No request named '${argv.request}' found. use 'apix get request' to list all available requests`);
    return;
  }
  const api = await db.findOne<ApixApi>({ kind: 'Api', 'metadata.name': request.metadata.labels.api });
  const parameters = argv.parameters as string[];
  let env: Record<string, unknown> = Object.fromEntries(parameters.map(parameter => parameter.split(':')));
  const questions = request.spec.parameters
    ?.filter(parameter => parameter.required && env[parameter.name] === undefined)
    .map(parameter => ({
      type: ['object', 'array'].includes(parameter.schema.type) ? 'editor' : 'input',
      name: parameter.name,
      message: parameter.name,
      postfix: '.json',
      validate: (value: string): true | string => {
        try {
          const object = YAML.parse(value);
          if (!ajv.validate(parameter.schema, object)) {
            return `${YAML.stringify(ajv.errors)}`;
          }
        } catch (e) {
          return `invalid format`;
        }
        return true;
      },
    }));

  try {
    env = { ...env, ...(await inquirer.prompt(questions)) };
  } catch (error) {
    console.log(error);
  }
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
