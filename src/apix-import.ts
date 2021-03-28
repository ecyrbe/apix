import { readFile } from 'fs/promises';
import Yargs, { showCompletionScript } from 'yargs';
import YAML from 'yaml';
import { OpenAPIV3 } from 'openapi-types';
import { get } from 'lodash';
import { ApixApi, ApixRequest, ApixObject } from './apix.types';
import { getConfig, hasConfig, storeResources } from './apix.utils';
import { join } from 'path';
import { Method, METHODS } from './apix.types';

const isMethod = (method: string): method is Method => METHODS.includes(method as Method);
const isRef = <T>(object: T | OpenAPIV3.ReferenceObject): object is OpenAPIV3.ReferenceObject => '$ref' in object;
const clean = <T>(object: T) => {
  Object.keys(object).forEach(key => object[key] === undefined && delete object[key]);
  return object;
};

const getObject = <T>(obj: T | OpenAPIV3.ReferenceObject, doc: OpenAPIV3.Document): T | undefined => {
  if (!obj) {
    return undefined;
  }
  if (isRef(obj)) {
    return get(doc, obj.$ref.replace('#/', '').replace(/\//g, '.'));
  }
  return obj;
};

const getSchema = (
  obj: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
  doc: OpenAPIV3.Document
): OpenAPIV3.SchemaObject => {
  const schema = getObject(obj, doc);
  if (schema && schema.properties) {
    Object.keys(schema.properties).forEach(property => {
      if (schema.properties[property]) schema.properties[property] = getSchema(schema.properties[property], doc);
    });
  }
  return schema;
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
        let parameters: {
          name: string;
          required: boolean;
          description?: string;
          schema?: OpenAPIV3.SchemaObject;
        }[] = [];
        let headersTemplate: Record<string, string>;
        let bodyTemplate: string | Record<string, unknown>;
        [...mainParams, ...(operation.parameters ?? [])].forEach(parameter => {
          const param = getObject(parameter, doc);
          if (param.in === 'header') {
            if (!headersTemplate) headersTemplate = {};
            headersTemplate[param.name] = `{{${param.name}}}`;
          }
          parameters.push(
            clean({
              name: param.name,
              description: param.description,
              required: param.required ?? false,
              schema: getSchema(param.schema ?? param.content?.['application/json'].schema, doc),
            })
          );
        });
        if (operation.requestBody) {
          const bodyParam = getObject(operation.requestBody, doc);
          const schema = bodyParam.content?.['application/json']?.schema;
          if (schema) {
            bodyTemplate = `{{body}}`;
            parameters.push({
              name: 'body',
              description: bodyParam.description,
              required: true,
              schema: getSchema(schema, doc),
            });
          }
        }
        const url = path.replace(/\{/g, '{{').replace(/\}/g, '}}');

        const endpoint: ApixRequest = {
          apiVersion: 'apix/v1',
          kind: 'Request',
          metadata: {
            name:
              operation.operationId.replace(/[/]/g, '.') ??
              `${url.replace(/^\//, '').replace(/\{\{/g, 'by-').replace(/[/]/g, '.').replace(/[{}]/g, '')}.${method}`,
            labels: {
              app: 'apix',
              api: api.metadata.name,
            },
          },
          spec: {
            parameters,
            template: clean({
              method,
              url,
              headers: headersTemplate,
              boby: bodyTemplate,
            }),
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
    console.error('No project created yet, execute "apix init" first');
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
