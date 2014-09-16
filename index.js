// Copyright 2014 (c) David Hayes

var fs = require('fs');
var path = require('path');
var htmlparser = require('htmlparser2');
var Q = require('kew');

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

function readFileContents(filename) {
  var defer = Q.defer();
  fs.readFile(filename, {
    encoding: 'utf-8'
  }, defer.makeNodeResolver());
  return defer.promise;
}

function saveToDb(name, type, filename) {
  console.log(name, type, filename);
}

function emitTriple(filename, text, currentId) {
  // Types come from http://kapeli.com/docsets#supportedentrytypes
  var isField = /^\.[a-z]/g;
  var twoFields = /(\.[a-z.]+),\W(\.[a-z.]+)/gi;
  var hasParens = /[\(|\)]/g;
  var hasConstant = /^ig\.\w+/g;
  var result = {};
  if (text.match(twoFields)) {
    var matches = text.match(twoFields);
    matches.forEach(function(match) {
      result[match] = 'Field';
    });
  } else if (text.match(isField) && !text.match(hasParens)) {
    result[text] = 'Field';
  } else if (text.match(isField) && text.match(hasParens)) {
    result[text] = 'Method';
  } else if (text.indexOf('new ') === 0) {
    result[text] = 'Constructor';
  } else if (text.match(hasConstant)) {
    result[text] = 'Constant';
  } else {
    result[text] = 'Entry';
  }

  for (name in result) {
    if (result.hasOwnProperty(name)) {
      saveToDb(name, result[name], filename + '#' + currentId);
    }
  }
}

function parseContents(filename) {
  return function(contents) {
    var defer = Q.defer();
    var inTagWeCareAbout = false;
    var currentId = null;
    var parser = new htmlparser.Parser({
      onopentag: function(name, attrs) {
        name = name.toLowerCase().trim();
        if (name[0] !== 'h' || name.length !== 2) {
          return;
        }
        if (!attrs.id) {
          return;
        }
        currentId = attrs.id;
        inTagWeCareAbout = true;
      },
      ontext: function(text) {
        if (inTagWeCareAbout) {
          emitTriple(filename, text, currentId);
        }
      },
      onclosetag: function(name) {
        name = name.toLowerCase().trim();
        if (name[0] !== 'h' || name.length !== 2) {
          return;
        }
        inTagWeCareAbout = false;
      },
      onend: function() {
        defer.resolve();
      }
    });
    parser.write(contents);
    return defer.promise;
  };
}

// Build up list of files we want to scan.
var glob = require('glob');
var classReferenceGlob = path.join(docsPath, 'documentation-class-reference-*.html');
glob(classReferenceGlob, function(err, filenames) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  filenames.forEach(function(filename) {
    readFileContents(filename)
      .then(parseContents(path.basename(filename)));
  });
});
