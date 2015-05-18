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
    number       = /^[+-]?(\d+(\.\d+)?|\.\d+)|(e[+-]\d+)/gi,
    wordEnd      = /[ \n\t\r\(\)\{\},:;@!'"\\]|\/(?=\*)|#(?={)/g,
    ident        = /^-?([a-z_]|\\[^\\])([a-z_0-9]|\\[^\\])*/gi;

export default function tokenize(input) {
    let tokens = [];
    let css    = input.css.valueOf();

    let code, next, quote, lines, last, content, escape,
        nextLine, nextOffset, escaped, escapePosendInterpolant, inInterpolant, inComment;

    let length = css.length;
    let offset = -1;
    let line   =  1;
    let pos    =  0;

    let unclosed = function (what, end) {
        if ( input.safe ) {
            css += end;
            next = css.length - 1;
        } else {
            throw input.error('Unclosed ' + what, line, pos  - offset);
        }
    };

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

            case asterisk:
                tokens.push(['*', '*', line, pos - offset]);
                break;

            case openCurly:
                tokens.push(['{', '{', line, pos - offset]);
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
                tokens.push(['\'', '\'', line, pos - offset]);
                break;

            case doubleQuote:
                tokens.push(['"', '"', line, pos - offset]);
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
                if ( escape && (code !== slash   &&
                                code !== space   &&
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
                if ( code === slash && css.charCodeAt(pos + 1) === asterisk ) {
                    inComment = true;
                    tokens.push(['startComment', '/*', line, pos + 1 - offset]);
                    pos += 2;

                } else if ( code === slash ) {
                    tokens.push(['/', '/', line, pos - offset]);
                    pos += 2;

                } else if ( inComment && code === asterisk && css.charCodeAt(pos + 1) === slash ) {
                    inComment = false;
                    tokens.push(['endComment', '*/', line, pos + 1 - offset]);
                    pos += 2;

                } else if ( code === slash && css.charCodeAt(pos + 1) === slash ) {
                    tokens.push(['scssComment', '//', line, pos + 1 - offset]);
                    pos += 2;

                } else if ( code === hash && css.charCodeAt(pos + 1) === openCurly ) {
                    inInterpolant = true;
                    tokens.push(['startInterpolant', '#{', line, pos + 1 - offset]);
                    pos += 2;

                } else if ( ident.test(css) ) {
                    next = ident.lastIndex - 1;

                    tokens.push(['ident', css.slice(pos, next + 1),
                        line, pos  - offset,
                        line, next - offset
                    ]);

                    pos = next;

                } else if ( number.test(css) ) {
                    next = number.lastIndex - 1;

                    tokens.push(['number', css.slice(pos, next + 1),
                        line, pos  - offset,
                        line, next - offset
                    ]);

                    pos = next;

                } else {
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
                }

                break;
        }

        ident.lastIndex = pos + 1;
        number.lastIndex = pos + 1;
        wordEnd.lastIndex = pos + 1;

        pos++;
    }

    return tokens;
}
