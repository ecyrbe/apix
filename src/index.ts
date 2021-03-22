import axios, { Method } from 'axios';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import * as init from './apix-init';

const argv = yargs(hideBin(process.argv));

argv.command(init.command, init.describe, init.builder, init.handler).help().argv;
