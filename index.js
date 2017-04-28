var path = require('path');

var escape = function (str) {
    return str.replace(/[\[\]\/{}()*+?.\\^$|-]/g, '\\$&');
};

var regexp = ['lib', 'test'].map(function (i) {
    return '^' + escape(path.join(__dirname, i) + path.sep);
}).join('|');

require('babel-register')({
    only:   new RegExp('(' + regexp + ')'),
    ignore: false,
    presets: [["es2015", {"loose": true}]]
});
module.exports = require('./lib/entry').default;
