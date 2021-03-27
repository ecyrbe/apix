import { readFile } from 'fs/promises';
import Yargs, { showCompletionScript } from 'yargs';
import YAML from 'yaml';
import { OpenAPIV3 } from 'openapi-types';
import { get } from 'lodash';
import { ApixApi, ApixEndpoint, ApixObject } from './apix.types';
import { getConfig, hasConfig, storeResources } from './apix.utils';
import { join } from 'path';
import { Method, METHODS } from './apix.types';

const isMethod = (method: string): method is Method => METHODS.includes(method as Method);
const isRef = <T>(object: T | OpenAPIV3.ReferenceObject): object is OpenAPIV3.ReferenceObject => '$ref' in object;
const clean = <T>(object: T) => {
  Object.keys(object).forEach(key => object[key] === undefined && delete object[key]);
  return object;
};

const getParameterObject = (
  parameter: OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject,
  doc: OpenAPIV3.Document
): OpenAPIV3.ParameterObject => {
  if (isRef(parameter)) {
    return get(doc, parameter.$ref.replace('#/', '').replace(/\//g, '.'));
  }
  return parameter;
};

function loadOpenApi(doc: OpenAPIV3.Document, name?: string): ApixObject[] {
  const api: ApixApi = {
    apiVersion: 'apix/v1',
    kind: 'Api',
    metadata: {
      name: name ?? doc.info.title,
      labels: {
        app: 'apix',
      },
    },
    spec: {
      description: doc.info.description ?? doc.info.title,
      version: doc.info.version,
      url: doc.servers[0].url,
    },
  };
  const endpoints = Object.keys(doc.paths).flatMap(path =>
    Object.keys(doc.paths[path])
      .filter(isMethod)
      .map(method => {
        const mainParams = doc.paths[path].parameters ?? [];
        const operation = doc.paths[path][method];
        const parameters = [...mainParams, ...(operation.parameters ?? [])];
        const url = path.replace(/\{/g, '{{').replace(/\}/g, '}}');

        const endpoint: ApixEndpoint = {
          apiVersion: 'apix/v1',
          kind: 'Endpoint',
          metadata: {
            name: operation.operationId.replace(/[/]/g, '.') ?? url.replace(/[{}/]/g, ''),
            labels: {
              app: 'apix',
            },
          },
          spec: {
            parameters: parameters
              .map(parameter => getParameterObject(parameter, doc))
              .map(parameter =>
                clean({
                  name: parameter.name,
                  description: parameter.description,
                  required: parameter.required ?? false,
                  schema: parameter.schema,
                })
              ),
            template: {
              method,
              url,
              headers: {},
              body: {},
            },
          },
        };
        return endpoint;
      })
  );
  return [api, ...endpoints];
}

export const command = 'import <name>';

export const describe = "import an openapi api and all it's endpoints";

export const builder = (yargs: Yargs.Argv) => {
  yargs.positional('name', { describe: 'name you want to give to the api to import' });
  yargs
    .options('file', { alias: 'f', describe: 'path to openapi document in json or yaml format' })
    .demandOption('file', 'provide a file to import');
};

export const handler = async (argv: Yargs.Arguments) => {
  if (!hasConfig()) {
    console.log('No project created yet, execute "apix init" first');
    return;
  }
  const document = YAML.parse((await readFile(argv.file as string)).toString());
  const apiName = argv.name as string;
  const objects = loadOpenApi(document, apiName);
  const config = await getConfig();
  storeResources(
    join(config.spec.projects.find(project => project.name === config.spec.project).path, apiName),
    objects
  );
};
