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

  it('transforms `--no-foo`, `--disable-foo`, `-no-foo` in to false', function () {
    expect(parse('--no-foo').foo).to.equal(false);
    expect(parse('-no-foo').foo).to.equal(false);
    expect(parse('--disable-foo').foo).to.equal(false);
    expect(parse('-disable-foo').foo).to.equal(false);
  });

  it('transforms `--foo`, `-foo` in to true', function () {
    expect(parse('--foo').foo).to.equal(true);
    expect(parse('-foo').foo).to.equal(true);
  });

  it('transforms `--foo="stuff"`, `--foo=\'stuff\'` and `--foo=stuff` in k/v pairs', function () {
    expect(parse('--foo="stuff"').foo).to.equal('stuff');
    expect(parse("--foo='stuff'").foo).to.equal('stuff');
    expect(parse('--foo=stuff').foo).to.equal('stuff');
    expect(parse('-foo="stuff"').foo).to.equal('stuff');
    expect(parse("-foo='stuff'").foo).to.equal('stuff');
    expect(parse('-foo=stuff').foo).to.equal('stuff');
  });

  it('transforms long key/values', function () {
    expect(parse('--foo', 'bar').foo).to.equal('bar');
  });

  it('transforms short key/values', function () {
    expect(parse('-F', 'bar').F).to.equal('bar');
  });

  it('tranforms true & false in to booleans', function () {
    expect(parse('--foo', 'true').foo).to.equal(true);
    expect(parse('-f', 'true').f).to.equal(true);
    expect(parse('--foo', 'false').foo).to.equal(false);
    expect(parse('-f', 'false').f).to.equal(false);
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
    var args = parse('--foo', 'bar', '-f', 'bar', '--bar', '111', '--bool', '-m', 'false', '--', 'args', 'lol');

    expect(args.foo).to.equal('bar');
    expect(args.f).to.equal('bar');
    expect(args.bar).to.equal(111);
    expect(args.bool).to.equal(true);
    expect(args.m).to.equal(false);
    expect(args.argv).to.deep.equal(['args', 'lol']);
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
