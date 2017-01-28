// -----------------------------------------------------------------------------
// Asset we're able to tokenize sass-spec.
// We're not asserting correctness here, just if we can tokenize sass-spec
// without crashing or freezing the process.
// -----------------------------------------------------------------------------

var fs = require('fs');
var path = require('path');
var glob = require('glob');
var tripwire = require('tripwire');
var spec = require('sass-spec');
var scss = require('../');

var timeout = 3000;
var contents, file, errorFile, i;
var fails = [];
var files = glob.sync(path.join(spec.dirname, 'spec/**/input.scss'));

// -----------------------------------------------------------------------------
// We use tripwire to detect a long running process. If the process runs too
// long we kill it and exit(1).
// -----------------------------------------------------------------------------

process.on('uncaughtException', function (e) {
    if (undefined !== tripwire.getContext()) {
        console.log('The event loop was blocked for longer than ' + timeout + ' milliseconds');
    }
    process.exit(1);
});

tripwire.resetTripwire(timeout, {});

// -----------------------------------------------------------------------------
// Tokenize sass-spec. The tokenizer have any error conditions.
// If an uncaught exception is thrown we report the failure to the user.
// -----------------------------------------------------------------------------

for(i = 0; i < files.length; i++) {
    file = files[i];
    errorFile = path.join(path.dirname(file), 'error');

    try {
        if (fs.statSync(errorFile)) continue;
    } catch (e) { }

    contents = fs.readFileSync(file, { encoding: 'utf8' });
    scss.tokenize(contents);
}
