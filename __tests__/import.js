var scss = require('..');
var fs = require('fs');
var path = require('path');

var fixture = function(name) {
    return fs.readFileSync(
        path.join(__dirname, 'fixture', name)
    );
}

describe('@import', function() {
    it('should tokenize a @import with double quotes', function() {
        const tree = scss.tokenize(fixture('double-quoted-import.scss'));
        expect(tree).toMatchSnapshot();
    });

    it('should tokenize a @import with single quotes', function() {
        const tree = scss.tokenize(fixture('single-quoted-import.scss'));
        expect(tree).toMatchSnapshot();
    });

    it('should tokenize a @import without quotes', function() {
        const tree = scss.tokenize(fixture('unquoted-import.scss'));
        expect(tree).toMatchSnapshot();
    });

    it('should tokenize a @import with double quotes and slash', function() {
        const tree = scss.tokenize(fixture('double-quoted-import-path.scss'));
        expect(tree).toMatchSnapshot();
    });

    it('should tokenize a @import with single quotes and slash', function() {
        const tree = scss.tokenize(fixture('single-quoted-import-path.scss'));
        expect(tree).toMatchSnapshot();
    });

    it('should tokenize a @import without quotes and slash', function() {
        const tree = scss.tokenize(fixture('unquoted-import-path.scss'));
        expect(tree).toMatchSnapshot();
    });
});
