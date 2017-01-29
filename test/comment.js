var scss = require('..');
var fs = require('fs');
var path = require('path');
var assert = require('chai').assert;

var fixture = function(name) {
    return fs.readFileSync(
        path.join(__dirname, 'fixture', name)
    );
}

describe('Comment', function() {
    it('should tokenize a simple comment', function() {
        assert.deepEqual(
            [
                ['startComment', '/*', 1, 2],
                ['space', ' '],
                ['word', 'my', 1, 4, 1, 5],
                ['space', ' '],
                ['word', 'comment', 1, 7, 1, 13],
                ['space', ' '],
                ['endComment', '*/', 1, 16],
            ],
            scss.tokenize(fixture('simple-comment.scss'))
        );
    });

    it('should tokenize a multiline comment', function() {
        assert.deepEqual(
            [
                ['startComment', '/*', 1, 2],
                ['newline', '\n', 2, 0],
                ['word', 'my', 2, 1, 2, 2],
                ['space', ' '],
                ['word', 'comment', 2, 4, 2, 10],
                ['newline', '\n', 3, 0],
                ['endComment', '*/', 3, 2],
            ],
            scss.tokenize(fixture('multiline-comment.scss'))
        );
    });

    it('should tokenize a docblock comment', function() {
        assert.deepEqual(
            [
                ['startComment', '/*', 1, 2],
                ['word', '*', 1, 3, 1, 3],
                ['newline', '\n', 2, 0],
                ['space', ' '],
                ['word', '*', 2, 2, 2, 2],
                ['space', ' '],
                ['word', 'line', 2, 4, 2, 7],
                ['space', ' '],
                ['word', '1', 2, 9, 2, 9],
                ['newline', '\n', 3, 0],
                ['space', ' '],
                ['word', '*', 3, 2, 3, 2],
                ['newline', '\n', 4, 0],
                ['space', ' '],
                ['word', '*', 4, 2, 4, 2],
                ['space', ' '],
                ['word', 'line', 4, 4, 4, 7],
                ['space', ' '],
                ['word', '2', 4, 9, 4, 9],
                ['newline', '\n', 5, 0],
                ['space', ' '],
                ['endComment', '*/', 5, 3],
            ],
            scss.tokenize(fixture('docblock-comment.scss'))
        );
    });

    it('should tokenize a comment that does not have a space before the end', function() {
        assert.deepEqual(
            [
                ['startComment', '/*', 1, 2],
                ['word', 'my', 1, 3, 1, 4],
                ['space', ' '],
                ['word', 'comment', 1, 6, 1, 12],
                ['endComment', '*/', 1, 14],
            ],
            scss.tokenize(fixture('comment-with-trailing-space.scss'))
        );
    });
});
