describe('argh', function () {
  'use strict';

  var argh = require('../')
    , chai = require('chai')
    , expect = chai.expect;

  chai.Assertion.includeStack = true;

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
    expect(parse('--no-foo').foo).to.equal(false);
    expect(parse('--disable-foo').foo).to.equal(false);
  });

  it('transforms `-no-abc` in to multiple (false) booleans', function () {
    var args = parse('-no-abcdef');

    'abcdef'.split('').forEach(function (char) {
      expect(args[char]).to.equal(false);
    });

    args = parse('-disable-abcdef');

    'abcdef'.split('').forEach(function (char) {
      expect(args[char]).to.equal(false);
    });
  });

  it('transforms `--foo` in to true', function () {
    expect(parse('--foo').foo).to.equal(true);
  });

  it('transforms `--foo="stuff"`, `--foo=\'stuff\'` and `--foo=stuff` in k/v pairs', function () {
    expect(parse('--foo="stuff"').foo).to.equal('stuff');
    expect(parse("--foo='stuff'").foo).to.equal('stuff');
    expect(parse('--foo=stuff').foo).to.equal('stuff');
  });

  it('transforms long key/values', function () {
    expect(parse('--foo', 'bar').foo).to.equal('bar');
  });

  it('transforms short in to booleans', function () {
    expect(parse('-F').F).to.equal(true);
    expect(parse('-f').f).to.equal(true);
  });

  it('explodes a multi char short in to multiple (true) booleans', function () {
    var args = parse('-abcdef');

    'abcdef'.split('').forEach(function (char) {
      expect(args[char]).to.equal(true);
    });
  });

  it('tranforms the values true & false in to booleans', function () {
    expect(parse('--foo', 'true').foo).to.equal(true);
    expect(parse('--foo', 'false').foo).to.equal(false);
    expect(parse('--foo="false"').foo).to.equal(false);
    expect(parse('--foo="true"').foo).to.equal(true);
  });

  it('tranforms numbers in to numbers', function () {
    expect(parse('--foo', '111q').foo).to.be.a('string');
    expect(parse('--foo', '111').foo).to.be.a('number');
    expect(parse('--foo="111"').foo).to.be.a('number');
  });

  it('stops parsing when it encounters a `--`', function () {
    var args = parse('--foo', '--', '--bar', '--baz');

    expect(args.foo).to.equal(true);
    expect(args.argv).to.be.a('Array');
    expect(args.argv).to.deep.equal(['--bar', '--baz']);
  });

  it('adds unknown arguments to `.argv`', function () {
    expect(parse('foo', 'bar').argv).to.deep.equal(['foo', 'bar']);
    expect(parse('--foo', 'bar', 'baz', '--banana').argv).to.deep.equal(['baz']);
    expect(parse('--foo', 'bar', 'baz', '--', '--banana').argv).to.deep.equal(['baz', '--banana']);
  });

  it('correctly parses multiple arguments', function () {
    var args = parse('--foo', 'bar', '--f', 'bar', '--bar', '111', '--bool', '-m', 'false', '--', 'args', 'lol');

    expect(args.foo).to.equal('bar');
    expect(args.f).to.equal('bar');
    expect(args.bar).to.equal(111);
    expect(args.bool).to.equal(true);
    expect(args.m).to.equal(true);
    expect(args.argv).to.deep.equal(['false', 'args', 'lol']);
  });

  it('transforms arguments with a dot notation to a object', function () {
    var args = parse('--foo', '--redis.port', '9999', '--redis.host="foo"');

    expect(args.foo).to.equal(true);
    expect(args.redis).to.be.a('object');
    expect(args.redis.port).to.equal(9999);
    expect(args.redis.host).to.equal('foo');
  });

  it('correctly parses arguments with filenames', function () {
    var args = parse('--realFilePath=some/path/file.js', 'some/path/file2.js');

    expect(args.realFilePath).to.equal('some/path/file.js');
    expect(args.argv).to.deep.equal(['some/path/file2.js']);
  });

  it('preforms automatic value conversion', function () {
    expect(parse('--a', '0').a).to.equal(0);
    expect(parse('--a', '242424').a).to.equal(242424);
  });

  it('lazy parses the process args when .argv is accessed', function () {
    var args = argh.argv;

    //
    // Note: These are the parsed mocha arguments. Make sure they match in the
    // `.mocha.opts` file in the test folder.
    //
    expect(args.reporter).to.equal('spec');
    expect(args.ui).to.equal('bdd');
    expect(args.argv).to.deep.equal(['test/parse.test.js']);
  });
});
