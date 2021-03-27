#!/usr/bin/env node
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import * as init from './apix-init';
import * as get from './apix-get';
import * as imp from './apix-import';

const argv = yargs(hideBin(process.argv));

argv
  .command(init.command, init.describe, init.builder, init.handler)
  .command(get.command, get.describe, get.builder, get.handler)
  .command(imp.command, imp.describe, imp.builder, imp.handler)
  .help().argv;
