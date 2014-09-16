// Copyright 2014 (c) David Hayes

var argv = require('yargs')
  .usage('Fill an existing sqlite3 DB with pointers to the ImpactJS HTML documentation.\n\nUsage: $0 -d [path to ImpactJS HTML documentation] -s [path to sqlite3 db]')
  .demand(['d', 's'])
  .alias('d', 'docs')
  .alias('s', 'sqlite')
  .describe('d', 'Path to the ImpactJS HTML documentation')
  .describe('s', 'Path to existing sqlite3 database with searchIndex table already created')
  .argv;
