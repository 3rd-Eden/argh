describe('argh', function () {
  'use strict';

  var assume = require('assume')
    , argh = require('./index.js');

  /**
   * Helper function so we don't have to create arrays for our tests, but we can
   * just supply a shit load of arguments.
   *
   * @returns {Object} The argh result.
   * @api private
   */
  function parse() {
    var args = Array.prototype.slice.call(arguments, 0);
    return argh(args);
  }

  it('transforms `--no-foo`, `--disable-foo` in to false', function () {
    assume(parse('--no-foo').foo).to.equal(false);
    assume(parse('--disable-foo').foo).to.equal(false);
  });

  it('transforms `-no-abc` in to multiple (false) booleans', function () {
    var args = parse('-no-abcdef');

    'abcdef'.split('').forEach(function (char) {
      assume(args[char]).to.equal(false);
    });

    args = parse('-disable-abcdef');

    'abcdef'.split('').forEach(function (char) {
      assume(args[char]).to.equal(false);
    });
  });

  it('transforms `--foo` in to true', function () {
    assume(parse('--foo').foo).to.equal(true);
  });

  it('transforms `--foo="stuff"`, `--foo=\'stuff\'` and `--foo=stuff` in k/v pairs', function () {
    assume(parse('--foo="stuff"').foo).to.equal('stuff');
    assume(parse("--foo='stuff'").foo).to.equal('stuff');
    assume(parse('--foo=stuff').foo).to.equal('stuff');
  });

  it('transforms `--foo="./stuff"`, `--foo=\'./stuff\'` and `--foo=./stuff` in k/v pairs', function () {
    assume(parse('--foo="./stuff"').foo).to.equal('./stuff');
    assume(parse("--foo='./stuff'").foo).to.equal('./stuff');
    assume(parse('--foo=./stuff').foo).to.equal('./stuff');
  });

  it('transforms long key/values', function () {
    assume(parse('--foo', 'bar').foo).to.equal('bar');
  });

  it('transforms short in to booleans', function () {
    assume(parse('-F').F).to.equal(true);
    assume(parse('-f').f).to.equal(true);
  });

  it('explodes a multi char short in to multiple (true) booleans', function () {
    var args = parse('-abcdef');

    'abcdef'.split('').forEach(function (char) {
      assume(args[char]).to.equal(true);
    });
  });

  it('tranforms the values true & false in to booleans', function () {
    assume(parse('--foo', 'true').foo).to.equal(true);
    assume(parse('--foo', 'false').foo).to.equal(false);
    assume(parse('--foo="false"').foo).to.equal(false);
    assume(parse('--foo="true"').foo).to.equal(true);
  });

  it('tranforms numbers in to numbers', function () {
    assume(parse('--foo', '111q').foo).to.be.a('string');
    assume(parse('--foo', '111').foo).to.be.a('number');
    assume(parse('--foo="111"').foo).to.be.a('number');
  });

  it('stops parsing when it encounters a `--`', function () {
    var args = parse('--foo', '--', '--bar', '--baz');

    assume(args.foo).to.equal(true);
    assume(args.argv).to.be.a('Array');
    assume(args.argv).to.deep.equal(['--bar', '--baz']);
  });

  it('adds unknown arguments to `.argv`', function () {
    assume(parse('foo', 'bar').argv).to.deep.equal(['foo', 'bar']);
    assume(parse('--foo', 'bar', 'baz', '--banana').argv).to.deep.equal(['baz']);
    assume(parse('--foo', 'bar', 'baz', '--', '--banana').argv).to.deep.equal(['baz', '--banana']);
  });

  it('correctly parses multiple arguments', function () {
    var args = parse('--foo', 'bar', '--f', 'bar', '--bar', '111', '--bool', '-m', 'false', '--', 'args', 'lol');

    assume(args.foo).to.equal('bar');
    assume(args.f).to.equal('bar');
    assume(args.bar).to.equal(111);
    assume(args.bool).to.equal(true);
    assume(args.m).to.equal(true);
    assume(args.argv).to.deep.equal(['false', 'args', 'lol']);
  });

  it('transforms arguments with a dot notation to a object', function () {
    var args = parse('--foo', '--redis.port', '9999', '--redis.host="foo"');

    assume(args.foo).to.equal(true);
    assume(args.redis).to.be.a('object');
    assume(args.redis.port).to.equal(9999);
    assume(args.redis.host).to.equal('foo');
  });

  it('correctly parses arguments with a + in the value', function () {
    var args = parse('--my="friend+you"', '--me=friend+me', '--your', 'friend+me');

    assume(args.my).to.equal('friend+you');
    assume(args.me).to.equal('friend+me');
    assume(args.your).to.equal('friend+me');
  });

  it('correctly passes arguments in the ascii printable range.', function () {
    for (var i = 32; i <= 126; i++) {
      // Skip over the chars `'` and `"`
      if (i === 34 || i === 29) return;
      var char = String.fromCharCode(i);
      var args = parse('--one="1' + char + '1"', '--two=2' + char + '2', '--three', '3' + char + '3');

      assume(args.one).to.equal('1' + char + '1');
      assume(args.two).to.equal('2' + char + '2');
      assume(args.three).to.equal('3' + char + '3');
    }
  });

  it('correctly parses arguments with filenames', function () {
    var args = parse('--realFilePath=some/path/file.js', 'some/path/file2.js');

    assume(args.realFilePath).to.equal('some/path/file.js');
    assume(args.argv).to.deep.equal(['some/path/file2.js']);
  });

  it('preforms automatic value conversion', function () {
    assume(parse('--a', '0').a).to.equal(0);
    assume(parse('--a', '242424').a).to.equal(242424);
  });

  it('combines duplicate flags into an array of values', function () {
    var args = parse('--require', 'foo', '--require', 'bar');

    assume(args.require).is.a('array');
    assume(args.require).is.length(2);
    assume(args.require[0]).equals('foo');
    assume(args.require[1]).equals('bar');
  });

  it('lazy parses the process args when .argv is accessed', function () {
    var args = argh.argv;

    //
    // Note: These are the parsed mocha arguments. Make sure they match in the
    // `.mocha.opts` file in the test folder.
    //
    assume(args.reporter).to.equal('spec');
    assume(args.ui).to.equal('bdd');
    assume(args.argv).to.deep.equal(['test.js']);
  });
});
