var scss = require('..');
var fs = require('fs');
var path = require('path');

var fixture = function(name) {
    return fs.readFileSync(
        path.join(__dirname, 'fixture', name)
    );
}

describe('interpolant', function() {
  it('should tokenize interpolant decimal', function() {
    const tree = scss.tokenize(fixture('interpolant/decimal.scss'));
    expect(tree).toMatchSnapshot();
  });

  it('should tokenize interpolant number', function() {
    const tree = scss.tokenize(fixture('interpolant/number.scss'));
    expect(tree).toMatchSnapshot();
  });

  it('should tokenize interpolant quoted-string', function() {
    const tree = scss.tokenize(fixture('interpolant/quoted-string.scss'));
    expect(tree).toMatchSnapshot();
  });

  it('should tokenize interpolant unquoted-string', function() {
    const tree = scss.tokenize(fixture('interpolant/unquoted-string.scss'));
    expect(tree).toMatchSnapshot();
  });
});
