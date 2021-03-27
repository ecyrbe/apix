import { OpenAPIV3 } from 'openapi-types';
export enum ApixMode {
  operations = 'operations',
  resources = 'resources',
}

export type ApixKind = 'Configuration' | 'Resource' | 'Api' | 'Endpoint';

export interface ApixObject {
  apiVersion: string;
  kind: ApixKind;
  metadata: {
    name: string;
    labels?: Record<string, string>;
    annotations?: Record<string, unknown>;
    [key: string]: unknown;
  };
  spec: unknown;
}

export interface ApixConfig extends ApixObject {
  apiVersion: 'apix/v1';
  kind: 'Configuration';
  spec: {
    projects: Array<{
      name: string;
      path: string;
    }>;
    mode: ApixMode;
    project: string;
    api?: string;
  };
}

export interface ApixResources extends ApixObject {
  apiVersion: 'apix/v1';
  kind: 'Resource';
  spec: {
    description: string;
    kind: string;
    alias?: string;
    apified: boolean;
    operations: Array<'get' | 'create' | 'delete' | 'patch' | 'describe' | 'exec'>;
  };
}

export interface ApixApi extends ApixObject {
  apiVersion: 'apix/v1';
  kind: 'Api';
  spec: {
    url: string;
    version: string;
    description: string;
  };
}

export interface ApixEndpoint extends ApixObject {
  apiVersion: 'apix/v1';
  kind: 'Endpoint';
  spec: {
    parameters?: Array<{
      name: string;
      required: boolean;
      description?: string;
      schema?: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
    }>;
    template: {
      method: string;
      url: string;
      headers: Record<string, string>;
      body: Record<string, string>;
    };
  };
}
