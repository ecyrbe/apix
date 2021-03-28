#!/usr/bin/env node
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import * as init from './apix-init';
import * as get from './apix-get';
import * as imp from './apix-import';
import * as req from './apix-request';

const argv = yargs(hideBin(process.argv));

argv
  .command(init.command, init.describe, init.builder, init.handler)
  .command(get.command, get.describe, get.builder, get.handler)
  .command(imp.command, imp.describe, imp.builder, imp.handler)
  .command(req.command, req.describe, req.builder, req.handler)
  .option('output-format', { describe: 'output format', alias: 'o', choices: ['json', 'yaml'], default: 'json' })
  .demandCommand(1, '')
  .recommendCommands()
  .strict()
  .help().argv;
