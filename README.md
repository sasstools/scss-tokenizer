# scss-tokenizer
A tokenzier for Sass' SCSS syntax

# Install

```
npm install scss-tokenizer
```

# Usage

```
scss.tokenize(css)
```

# API

### `tokenize`

Tokenizes source `css` and returns an ordered array of tokens with positional 
data.

```js
var tokenize = require('scss-tokenizer');
var tokens = tokenize.tokenize(css);
```

Arguments:

* `css (string|#toString)`: String with input CSS or any object
  with `toString()` method, like file stream.
* `opts (object) optional`: options:
  * `from`: the path to the source CSS file. You should always set `from`,
    because it is used in map generation and in syntax error messages.
    
# Test

```
npm test
```

## Attribution

This project started as a fork of the [PostCSS](https://github.com/postcss/postcss) tokenizer.
