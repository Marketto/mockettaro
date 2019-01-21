#!/usr/bin/env node
const { mockettaroProgram } = require('../lib/mockettaro-program.class');
mockettaroProgram().catch(() => process.exit(1));
