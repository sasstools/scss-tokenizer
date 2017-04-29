import Input from './input';
import tokenizeString from './tokenize-string';
import tokenizeInterpolant from './tokenize-interpolant';

let singleQuote    = "'".charCodeAt(0),
    doubleQuote    = '"'.charCodeAt(0),
    newline        = '\n'.charCodeAt(0),
    space          = ' '.charCodeAt(0),
    feed           = '\f'.charCodeAt(0),
    tab            = '\t'.charCodeAt(0),
    cr             = '\r'.charCodeAt(0),
    hash           = '#'.charCodeAt(0),
    backslash      = '\\'.charCodeAt(0),
    slash          = '/'.charCodeAt(0),
    openCurly      = '{'.charCodeAt(0),
    closeCurly     = '}'.charCodeAt(0),
    interpolantEnd = /([.\s]*?)[^\\](?=(}))/gm,
    sQuoteEnd      = /([.\s]*?)[^\\](?=((#{)|'))/gm,
    dQuoteEnd      = /([.\s]*?)[^\\](?=((#{)|"))/gm;

export default function tokenize(input, l, p, quote) {
    let tokens = [];
    let css    = input.css.valueOf();

    let code, next, lines, last, content, escape,
        nextLine, nextOffset, escaped, escapePos,
        inInterpolant, inComment, inString;

    let length = css.length;
    let offset = -1;
    let line   =  l || 1;
    let pos    =  p || 0;

    let quoteEnd = quote === "'" ? sQuoteEnd : dQuoteEnd;
    let quoteChar = quote.charCodeAt(0);

    loop:
    while ( pos < length ) {
        code = css.charCodeAt(pos);

        if ( code === newline ) {
            offset = pos;
            line  += 1;
        }

        switch ( code ) {

            case closeCurly:
                tokens.push(['endInterpolant', '}', line, pos - offset]);
                break;

            case quoteChar:
                tokens.push([quote, quote, line, pos - offset]);
                break loop;

            case backslash:
                next   = pos;
                escape = true;
                while ( css.charCodeAt(next + 1) === backslash ) {
                    next  += 1;
                    escape = !escape;
                }
                code = css.charCodeAt(next + 1);
                if ( escape && (code !== slash   &&
                                code !== space   &&
                                code !== newline &&
                                code !== tab     &&
                                code !== cr      &&
                                code !== feed ) ) {
                    next += 1;
                }
                tokens.push(['string', css.slice(pos, next + 1),
                    line, pos  - offset,
                    line, next - offset
                ]);
                pos = next;
                break;

            default:
                if ( code === hash && css.charCodeAt(pos + 1) === openCurly ) {
                    tokens.push(['startInterpolant', '#{', line, pos + 1 - offset]);
                    next = pos + 1;

                    let { tokens: t, pos: p } = tokenizeInterpolant(input, line, next + 1);
                    tokens = tokens.concat(t);
                    next = p;

                    pos = next;

                } else {
                    quoteEnd.lastIndex = pos;
                    quoteEnd.test(css);

                    if ( quoteEnd.lastIndex === 0 ) {
                        next = css.length - 1;
                    } else {
                        next = quoteEnd.lastIndex - 1;
                    }

                    tokens.push(['string', css.slice(pos, next + 1),
                        line, pos  - offset,
                        line, next - offset
                    ]);

                    pos = next;
                }

                break;
        }

        pos++;
    }

    return { tokens, pos };
}
