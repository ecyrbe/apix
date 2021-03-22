export enum ApixMode {
  operations = 'operations',
  resources = 'resources',
}

export interface ApixObject {
  apiVersion: string;
  kind: string;
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
