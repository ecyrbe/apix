import { get } from 'lodash';
import { ApixKind, ApixObject } from './apix.types';
import { loadResources } from './apix.utils';

// type ApixAttributeRequest = {
//   [key in '$<' | '$>' | '$<=' | '$>=']?: string | number;
// };

type ApixBasicRequest = {
  [key in string]?: string | number | boolean; //| ApixAttributeRequest;
};

type ApixRequest = {
  [key in '$or' | '$and']?: Array<ApixRequest>;
} &
  ApixBasicRequest;

const getFilter = (request: ApixRequest) => (object: ApixObject): boolean => {
  if ('$or' in request) {
    return request.$or.some(req => getFilter(req)(object));
  }
  if ('$and' in request) {
    return request.$and.every(req => getFilter(req)(object));
  }
  return Object.keys(request).every(key => get(object, key) === request[key]);
};

function allKinds<T>(obj: T): string[] {
  const keys = Object.keys(obj);
  const kinds = keys.filter(key => key === 'kind' && typeof obj[key] === 'string').map(key => obj[key] as string);
  const subKinds = keys.filter(key => obj[key] instanceof Object).flatMap(key => allKinds(obj[key]));
  return [...kinds, ...subKinds];
}

export class ApixDb {
  private objects: ApixObject[];

  constructor() {
    this.objects = [];
  }

  async loadFromRequest(request: ApixRequest) {
    const kinds = allKinds(request);
    await this.load(kinds);
  }

  async load(kinds: string[]) {
    if (this.objects.findIndex(object => object.kind === 'Resource') === -1) {
      const resources = await loadResources('Resource');
      this.objects = this.objects.concat(resources);
    }
    for (const kind of kinds) {
      if (this.objects.findIndex(object => object.kind === kind) === -1) {
        const resources = await loadResources(kind as ApixKind);
        this.objects = this.objects.concat(resources);
      }
    }
  }

  async find<T extends ApixObject = ApixObject>(request: ApixRequest) {
    await this.loadFromRequest(request);
    return this.objects.filter(getFilter(request)) as T[];
  }

  async findOne<T extends ApixObject = ApixObject>(request: ApixRequest) {
    return (await this.find<T>(request))[0];
  }
}
