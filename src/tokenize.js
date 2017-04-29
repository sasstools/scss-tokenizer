import Input from './input';
import tokenizeString from './tokenize-string';
import tokenizeComment from './tokenize-comment';
import tokenizeInterpolant from './tokenize-interpolant';

let singleQuote  = "'".charCodeAt(0),
    doubleQuote  = '"'.charCodeAt(0),
    dollar       = '$'.charCodeAt(0),
    hash         = '#'.charCodeAt(0),
    backslash    = '\\'.charCodeAt(0),
    slash        = '/'.charCodeAt(0),
    newline      = '\n'.charCodeAt(0),
    space        = ' '.charCodeAt(0),
    feed         = '\f'.charCodeAt(0),
    tab          = '\t'.charCodeAt(0),
    cr           = '\r'.charCodeAt(0),
    openBracket  = '('.charCodeAt(0),
    closeBracket = ')'.charCodeAt(0),
    openCurly    = '{'.charCodeAt(0),
    closeCurly   = '}'.charCodeAt(0),
    semicolon    = ';'.charCodeAt(0),
    asterisk     = '*'.charCodeAt(0),
    colon        = ':'.charCodeAt(0),
    at           = '@'.charCodeAt(0),
    comma        = ','.charCodeAt(0),
    plus         = '+'.charCodeAt(0),
    minus        = '-'.charCodeAt(0),
    decComb      = '>'.charCodeAt(0),
    adjComb      = '~'.charCodeAt(0),
    number       = /[+-]?(\d+(\.\d+)?|\.\d+)|(e[+-]\d+)/gi,
    sQuoteEnd    = /(.*?)[^\\](?=((#{)|'))/gm,
    dQuoteEnd    = /(.*?)[^\\](?=((#{)|"))/gm,
    wordEnd      = /[ \n\t\r\(\)\{\},:;@!'"\\]|\/(?=\*)|#(?={)/g,
    ident        = /-?([a-z_]|\\[^\\])([a-z-_0-9]|\\[^\\])*/gi;

export default function tokenize(input, l, p) {
    let tokens = [];
    let css    = input.css.valueOf();

    let code, next, quote, lines, last, content, escape,
        nextLine, nextOffset, escaped, escapePos,
        inInterpolant, inComment, inString;

    let length = css.length;
    let offset = -1;
    let line   =  l || 1;
    let pos    =  p || 0;

    while ( pos < length ) {
        code = css.charCodeAt(pos);

        if ( code === newline ) {
            offset = pos;
            line  += 1;
        }

        switch ( code ) {
            case space:
            case tab:
            case cr:
            case feed:
                next = pos;
                do {
                    next += 1;
                    code = css.charCodeAt(next);
                    if ( code === newline ) {
                        offset = next;
                        line  += 1;
                    }
                } while ( code === space   ||
                          code === tab     ||
                          code === cr      ||
                          code === feed );

                tokens.push(['space', css.slice(pos, next)]);
                pos = next - 1;
                break;

            case newline:
                tokens.push(['newline', '\n', line, pos - offset]);
                break;

            case plus:
                tokens.push(['+', '+', line, pos - offset]);
                break;

            case minus:
                tokens.push(['-', '-', line, pos - offset]);
                break;

            case decComb:
                tokens.push(['>', '>', line, pos - offset]);
                break;

            case adjComb:
                tokens.push(['~', '~', line, pos - offset]);
                break;

            case openCurly:
                tokens.push(['{', '{', line, pos - offset]);
                break;

            case closeCurly:
                if (inInterpolant) {
                    inInterpolant = false;
                    tokens.push(['endInterpolant', '}', line, pos - offset]);
                } else {
                    tokens.push(['}', '}', line, pos - offset]);
                }
                break;

            case comma:
                tokens.push([',', ',', line, pos - offset]);
                break;

            case dollar:
                tokens.push(['$', '$', line, pos - offset]);
                break;

            case colon:
                tokens.push([':', ':', line, pos - offset]);
                break;

            case semicolon:
                tokens.push([';', ';', line, pos - offset]);
                break;

            case openBracket:
                tokens.push(['(', '(', line, pos - offset]);
                break;

            case closeBracket:
                tokens.push([')', ')', line, pos - offset]);
                break;

            case singleQuote:
            case doubleQuote:
                quote = code === singleQuote ? "'" : '"';
                tokens.push([quote, quote, line, pos - offset]);
                next = pos + 1;

                let { tokens: t, pos: p } = tokenizeString(input, line, next, quote);
                tokens = tokens.concat(t);
                next = p;

                pos = next;
                break;

            case at:
                tokens.push(['@', '@', line, pos - offset]);
                break;

            case backslash:
                next   = pos;
                escape = true;
                while ( css.charCodeAt(next + 1) === backslash ) {
                    next  += 1;
                    escape = !escape;
                }
                code = css.charCodeAt(next + 1);
                if ( escape && (code !== space   &&
                                code !== newline &&
                                code !== tab     &&
                                code !== cr      &&
                                code !== feed ) ) {
                    next += 1;
                }
                tokens.push(['word', css.slice(pos, next + 1),
                    line, pos  - offset,
                    line, next - offset
                ]);
                pos = next;
                break;

            default:
                ident.lastIndex = pos;
                number.lastIndex = pos;
                wordEnd.lastIndex = pos;

                if ( code === slash && css.charCodeAt(pos + 1) === asterisk ) {
                    inComment = true;
                    tokens.push(['startComment', '/*', line, pos + 1 - offset]);
                    next = pos + 1;

                    let { tokens: t, line: l, pos: p, offset: o } = tokenizeComment(input, line, next + 1);
                    tokens = tokens.concat(t);
                    next = p;
                    line = l;
                    offset = o;

                    pos = next;
                    break;
                }

                if ( code === asterisk && css.charCodeAt(pos + 1) !== slash) {
                    tokens.push(['*', '*', line, pos - offset]);
                    break;
                }

                if ( inComment && code === asterisk && css.charCodeAt(pos + 1) === slash ) {
                    inComment = false;
                    tokens.push(['endComment', '*/', line, pos + 1 - offset]);
                    pos += 2;
                    break;
                }

                if ( code === slash && css.charCodeAt(pos + 1) !== slash ) {
                    tokens.push(['/', '/', line, pos - offset]);
                    break;
                }

                if ( code === hash && css.charCodeAt(pos + 1) === openCurly ) {
                    inInterpolant = true;
                    tokens.push(['startInterpolant', '#{', line, pos + 1 - offset]);
                    next = pos + 1;

                    let { tokens: t, pos: p } = tokenizeInterpolant(input, line, next + 1);
                    tokens = tokens.concat(t);
                    next = p;

                    pos = next;
                    break;
                }

                if ( code === slash && css.charCodeAt(pos + 1) === slash ) {
                    next = css.indexOf('\n', pos + 2);
                    next = (next > 0 ? next : css.length) - 1;

                    tokens.push(['scssComment', css.slice(pos, next + 1),
                        line, pos  - offset,
                        line, next - offset
                    ]);

                    pos = next;
                    break;
                }

                if ( ident.test(css) && ( ident.lastIndex = pos || 1 ) && ident.exec(css).index === pos ) {
                    next = ident.lastIndex - 1;

                    tokens.push(['ident', css.slice(pos, next + 1),
                        line, pos  - offset,
                        line, next - offset
                    ]);

                    pos = next;
                    break;
                }

                if ( number.test(css) && ( number.lastIndex = pos || 1 ) && number.exec(css).index === pos ) {
                    next = number.lastIndex - 1;

                    tokens.push(['number', css.slice(pos, next + 1),
                        line, pos  - offset,
                        line, next - offset
                    ]);

                    pos = next;
                    break;
                }

                wordEnd.lastIndex = pos + 1;
                wordEnd.test(css);
                if ( wordEnd.lastIndex === 0 ) {
                    next = css.length - 1;
                } else {
                    next = wordEnd.lastIndex - 2;
                }

                tokens.push(['word', css.slice(pos, next + 1),
                    line, pos  - offset,
                    line, next - offset
                ]);

                pos = next;

                break;
        }

        pos++;
    }

    return tokens;
}
