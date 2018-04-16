var scss = require('..');
var fs = require('fs');
var path = require('path');

var fixture = function(name) {
    return fs.readFileSync(
        path.join(__dirname, 'fixture', name)
    );
}

describe('Comment', function() {
    it('should tokenize a simple comment', function() {
        const tree = scss.tokenize(fixture('simple-comment.scss'));
        expect(tree).toMatchSnapshot();
    });

    it('should tokenize a multiline comment', function() {
        const tree = scss.tokenize(fixture('multiline-comment.scss'));
        expect(tree).toMatchSnapshot();
    });

    it('should tokenize a docblock comment', function() {
        const tree = scss.tokenize(fixture('docblock-comment.scss'));
        expect(tree).toMatchSnapshot();
    });

    it('should tokenize a comment that does not have a space before the end', function() {
        const tree = scss.tokenize(fixture('comment-with-trailing-space.scss'));
        expect(tree).toMatchSnapshot();
    });
});
