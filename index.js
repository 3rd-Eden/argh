'use strict';

/**
 * Argv is a extremely light weight options parser for Node.js it's been built
 * for just one single purpose, parsing arguments. It does nothing more than
 * that.
 *
 * @param {Array} argv The arguments that need to be parsed, defaults to process.argv
 * @returns {Object} Parsed arguments.
 */
function parse(argv) {
  argv = argv || process.argv.slice(2);

  return argv.reduce(function parser(argh, option, index, argv) {
    var next = argv[index + 1]
      , value
      , data;

    //
    // Special case, -- indicates that it should stop parsing the options and
    // store everything in a "special" key.
    //
    if (option === '--') {
      // By splicing the argv array, we also cancel the reduce as there are no
      // more options to parse.
      argh.argv = argh.argv || [];
      argh.argv = argh.argv.concat(argv.splice(index + 1));
      return argh;
    }

    if (data = /^--?(?:no|disable)-(.*)/.exec(option)) {
      //
      // --no-<key> indicates that this is a boolean value.
      //
      argh[data[1]] = false;
    } else if (data = /^--?([^=]+)=\W?([\w\-\.]+)\W?$/.exec(option)) {
      //
      // --foo="bar" and --foo=bar are alternate styles to --foo bar.
      //
      argh[data[1]] = +data[2] || data[2];
    } else if (data = /^--?(.*)/.exec(option)) {
      //
      // Check if this was a bool argument
      //
      if (!next || next.charAt(0) === '-' || (value = /^true|false$/.test(next))) {
        argh[data[1]] = value ? argv.splice(index + 1, 1)[0] === 'true' : true;
      } else {
        value = argv.splice(index + 1, 1)[0];
        argh[data[1]] = +value || value;
      }
    } else {
      //
      // This argument is not prefixed.
      //
      if (!argh.argv) argh.argv = [];
      argh.argv.push(option);
    }

    return argh;
  }, Object.create(null));
}

/**
 * Lazy parse the process arguments when `argh.argv` is accessed. This is the
 * same as simply calling `argh()`.
 *
 * @return {Object} Parsed process arguments.
 */
Object.defineProperty(parse, 'argv', {
  get: function argv() {
    return argv.parsed || (argv.parsed = parse());
  }
});

module.exports = parse;
