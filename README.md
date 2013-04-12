# argh!

`argh` is a extremely light weight options or `process.argv` parser for node.js.
It only includes the bare minimal to parse options. It's not a full blown cli
library, but it can be used as dependency of a cli library to do all the heavy
lifting.

`argh` was born out of rage, every cli library that we've found did more then
they advertised and added unneeded bloat to what we were trying to achieve.. and
that was argument parsing. Tiny modules should only focus on one thing and do
that one thing really well.

### Installation

```
npm install argh --save
```

### Usage

`argh` has two functions:

1. A simple parser interface for custom option parsing using `argh(..)`
2. A lazy loaded parsed results for the `process.argv` using `argh.argv`

```js
var argh = require('argh');

// You can directly access the parsed arguments of the node process through
console.log(argh.argv);

// This the same result as running
console.log(argh(process.argv));
```

#### So what is supported?

- `--arg` or `-a` Is transformed to a boolean (true)
- `--no-arg`, `--disable-arg` or `-no-a` Is transformed to a boolean (false)
- `--foo bar`, `--foo="bar"`, `--foo='bar'` or `--foo=bar` Is all transformed
  to key / value pairs. Where `foo` is the key and `bar` the value
- `--port 1111` Is automatically transforms the string 1111 in a number
- `--beer true` As you might have guessed it, it's transformed in to a boolean
- `--` Can be used as an indicator to stop parsing arguments.

### Examples

Everybody likes examples, lets assume that following code is stored as `parse.js`:

```js
var argv = require('argh').argv;

console.log(argv);
```

Parsing a single argument:

```
$ node parse.js --foo

{ foo: true }
```

Parsing multiple arguments:

```
$ node parse.js --foo bar --bar='baz'

{ foo: 'bar', bar: 'baz' }
```

Parsing multiple boolean arguments:

```
$ node parse.js --foo --no-bar -s --no-f

{ foo: true,
  bar: false,
  s: true,
  f: false }
```

Parsing different values:

```
$ node parse.js --awesome true --port 1111

{ awesome: true, port: 1111 }
```

Handling rest arguments:

```
$ node parse.js --argh --is --awesome -- 1111 --pewpew aaarrgghh

{ argh: true,
  is: true,
  awesome: true,
  argv: [ '1111', '--pewpew', 'aaarrgghh' ] }
```

All unknown arguments are also directly pushed in to the `argv` property:

```
$ node parse.js --foo 111 bar unkown --hello world BUUURRRRRNN

{ foo: 111,
  argv: [ 'bar', 'unkown', 'BUUURRRRRNN' ],
  hello: 'world' }
```

## License MIT
