var scss = require('..');
var fs = require('fs');
var path = require('path');
var assert = require('chai').assert;

var fixture = function(name) {
    return fs.readFileSync(
        path.join(__dirname, 'fixture', name)
    );
}

describe('@import', function() {
    it('should tokenize a @import with double quotes', function() {
        assert.deepEqual(
            [
                ['@', '@', 1, 1],
                ['ident', 'import', 1, 2, 1, 7],
                ['space', ' '],
                ['"', '"', 1, 9],
                ['string', 'foo', 1, 10, 1, 12],
                ['"', '"', 1, 13],
                [';', ';', 1, 14],
                ['newline', '\n', 2, 0],
            ],
            scss.tokenize(fixture('double-quoted-import.scss'))
        );
    });

    it('should tokenize a @import with single quotes', function() {
        assert.deepEqual(
            [
                ['@', '@', 1, 1],
                ['ident', 'import', 1, 2, 1, 7],
                ['space', ' '],
                ['\'', '\'', 1, 9],
                ['string', 'foo', 1, 10, 1, 12],
                ['\'', '\'', 1, 13],
                [';', ';', 1, 14],
                ['newline', '\n', 2, 0],
            ],
            scss.tokenize(fixture('single-quoted-import.scss'))
        );
    });

    it('should tokenize a @import without quotes', function() {
        assert.deepEqual(
            [
                ['@', '@', 1, 1],
                ['ident', 'import', 1, 2, 1, 7],
                ['space', ' '],
                ['ident', 'foo', 1, 9, 1, 11],
                [';', ';', 1, 12],
                ['newline', '\n', 2, 0],
            ],
            scss.tokenize(fixture('unquoted-import.scss'))
        );
    });

    it('should tokenize a @import with double quotes and slash', function() {
        assert.deepEqual(
            [
                ['@', '@', 1, 1],
                ['ident', 'import', 1, 2, 1, 7],
                ['space', ' '],
                ['"', '"', 1, 9],
                ['string', 'foo/bar', 1, 10, 1, 16],
                ['"', '"', 1, 17],
                [';', ';', 1, 18],
                ['newline', '\n', 2, 0],
            ],
            scss.tokenize(fixture('double-quoted-import-path.scss'))
        );
    });

    it('should tokenize a @import with single quotes and slash', function() {
        assert.deepEqual(
            [
                ['@', '@', 1, 1],
                ['ident', 'import', 1, 2, 1, 7],
                ['space', ' '],
                ['\'', '\'', 1, 9],
                ['string', 'foo/bar', 1, 10, 1, 16],
                ['\'', '\'', 1, 17],
                [';', ';', 1, 18],
                ['newline', '\n', 2, 0],
            ],
            scss.tokenize(fixture('single-quoted-import-path.scss'))
        );
    });

    it('should tokenize a @import without quotes and slash', function() {
        assert.deepEqual(
            [
                ['@', '@', 1, 1],
                ['ident', 'import', 1, 2, 1, 7],
                ['space', ' '],
                ['ident', 'foo', 1, 9, 1, 11],
                ['/', '/', 1, 12],
                ['ident', 'bar', 1, 13, 1, 15],
                [';', ';', 1, 16],
                ['newline', '\n', 2, 0],
            ],
            scss.tokenize(fixture('unquoted-import-path.scss'))
        );
    });
});
