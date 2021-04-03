import { isFunction } from 'lodash';
import Yargs from 'yargs';
import { getResource } from './apix-get';

type PositionFunc = () =>
  | Record<string, CompletionTree>
  | string[]
  | Promise<Record<string, CompletionTree>>
  | Promise<string[]>;

type CompletionTree = {
  depth?: 'infinite' | 'one' | 'none';
  positions?: Record<string, CompletionTree> | string[] | PositionFunc;
  options?: string[];
};

const rootCompletions: CompletionTree = {
  positions: {
    init: {
      options: ['f', 'file'],
    },
    get: {
      positions: ['api', 'request', 'resource'],
    },
    import: {},
    exec: {
      positions: async () => {
        const requests = await getResource('request');
        if (requests.length > 0) {
          return requests.map(request => request.metadata.name);
        }
        return [];
      },
    },
    request: {},
    completion: {},
  },
  options: ['o', 'output-format', 'version', 'help'],
};

const isPositional = (arg: string) => arg !== '' && !arg.startsWith('-');
const isOptional = (arg: string) => arg.startsWith('-');
const isLongOptional = (arg: string) => arg.startsWith('--');
const toOptions = (options?: string[]) => options?.map(option => (option.length === 1 ? `-${option}` : `--${option}`));
const toLongOptions = (options?: string[]) => toOptions(options).filter(isLongOptional);

const matchCompletion = async (arg: string, completions: CompletionTree) => {
  let positions = completions.positions;
  if (isFunction(positions)) {
    positions = await positions();
  }
  if (Array.isArray(positions)) {
    return positions.includes(arg);
  }
  return arg in positions;
};

export const complete = async (current: string, argv: Yargs.Arguments) => {
  const args = current.split(' ');
  return autoComplete(args, argv, rootCompletions);
};

const autoComplete = async (args: string[], argv: Yargs.Arguments, completions: CompletionTree): Promise<string[]> => {
  if (args.length > 0) {
    const positionArgs = args.filter(isPositional);
    const first = positionArgs[0];
    if (positionArgs.length > 0 && (await matchCompletion(first, completions))) {
      let positions = completions.positions;

      if (isFunction(positions)) {
        positions = await positions();
      }
      if (Array.isArray(positions)) {
        return positions;
      }
      const lastArg = args[args.length - 1];
      const result = await autoComplete(args.slice(1), argv, positions[first]);
      if (isPositional(lastArg)) {
        return result;
      } else if (isLongOptional(lastArg)) {
        return result.concat(AllRootLongOptions(completions));
      } else if (isOptional(lastArg)) {
        return result.concat(AllRootOptions(completions));
      }
    }
    const lastArg = args[args.length - 1];
    if (isPositional(lastArg)) {
      return allRootPositions(completions);
    } else if (isLongOptional(lastArg)) {
      return AllRootLongOptions(completions);
    } else if (isOptional(lastArg)) {
      return AllRootOptions(completions);
    }
  }
  return allRootCompletions(completions);
};

const allRootPositions = async (completions: CompletionTree) => {
  let positions = completions.positions;
  if (positions) {
    if (isFunction(positions)) {
      positions = await positions();
    }

    if (Array.isArray(positions)) {
      return positions;
    }
    return Object.keys(positions);
  }
  return [];
};

const AllRootOptions = (completions: CompletionTree): string[] => toOptions(completions.options) ?? [];
const AllRootLongOptions = (completions: CompletionTree): string[] => toLongOptions(completions.options) ?? [];

const allRootCompletions = async (completions: CompletionTree) =>
  (await allRootPositions(completions)).concat(AllRootOptions(completions));
