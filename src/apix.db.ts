import { homedir } from 'os';
import { join } from 'path';
import { ApixKind, ApixObject } from './apix.types';
import { loadResources } from './apix.utils';

type ApixAttributeRequest = {
  [key in '$<' | '$>' | '$<=' | '$>=']?: string | number;
};

type ApixBasicRequest = {
  [key in string]?: string | number | boolean;
};

type ApixRequest = {
  [key in '$or' | '$and']?: ApixRequest | ApixAttributeRequest | string | number | boolean;
} &
  ApixBasicRequest;

function allKinds<T>(obj: T): string[] {
  const keys = Object.keys(obj);
  const kinds = keys.filter(key => key === 'kind' && typeof obj[key] === 'string').map(key => obj[key] as string);
  const subKinds = keys.filter(key => obj[key] instanceof Object).flatMap(key => allKinds(obj[key]));
  return [...kinds, ...subKinds];
}

export class ApixDb {
  private objects: Record<string, ApixObject>;

  constructor() {
    this.objects = {};
  }

  async load(request: ApixRequest) {
    const kinds = allKinds(request);
    const resources = await Promise.all(kinds.map(kind => loadResources(kind as ApixKind)));
    return resources.flat();
  }

  async find(request: ApixRequest) {
    return this.load(request);
  }
}
