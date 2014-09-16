// Copyright 2014 (c) David Hayes

var fs = require('fs');
var path = require('path');
var htmlparser = require('htmlparser2');

// Arguments.
var argv = require('yargs')
  .usage('Fill an existing sqlite3 DB with pointers to the ImpactJS HTML documentation.\n\nUsage: $0 -d [path to ImpactJS HTML documentation] -s [path to sqlite3 db]')
  .demand(['d', 's'])
  .alias('d', 'docs')
  .alias('s', 'sqlite')
  .describe('d', 'Path to the ImpactJS HTML documentation')
  .describe('s', 'Path to existing sqlite3 database with searchIndex table already created')
  .argv;

var docsPath = argv.d;
var sqlPath = argv.s;

// Verify they exist.
if (!fs.existsSync(docsPath)) {
  console.error('The path to the ImpactJS HTML documentation doesn\'t exist.');
  process.exit(1);
}

if (!fs.existsSync(sqlPath)) {
  console.error('The sqlite DB must exist.');
  process.exit(1);
}

// Build up list of files we want to scan.
var glob = require('glob');
var classReferenceGlob = path.join(docsPath, 'documentation-class-reference-*.html');
glob(classReferenceGlob, function(err, filenames) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log('Scanning: ', filenames);
  files.forEach(function(filename) {

  });
});
