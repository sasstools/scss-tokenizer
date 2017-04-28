import Input from './input';
import tokenizeString from './tokenize-string';
import tokenizeInterpolant from './tokenize-interpolant';

let newline    = '\n'.charCodeAt(0),
    space      = ' '.charCodeAt(0),
    feed       = '\f'.charCodeAt(0),
    tab        = '\t'.charCodeAt(0),
    cr         = '\r'.charCodeAt(0),
    hash       = '#'.charCodeAt(0),
    backslash  = '\\'.charCodeAt(0),
    slash      = '/'.charCodeAt(0),
    openCurly  = '{'.charCodeAt(0),
    closeCurly = '}'.charCodeAt(0),
    asterisk   = '*'.charCodeAt(0),
    wordEnd    = /[ \n\t\r\(\)\{\},:;@!'"\\]|\*(?=\/)|#(?={)/g;

export default function tokenize(input, l, p) {
    let tokens = [];
    let css    = input.css.valueOf();

    let code, next, lines, last, content, escape,
        nextLine, nextOffset, escaped, escapePos,
        inInterpolant, inComment, inString;

    let length = css.length;
    let offset = -1;
    let line   =  l || 1;
    let pos    =  p || 0;

    loop:
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

            case closeCurly:
                tokens.push(['endInterpolant', '}', line, pos - offset]);
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

                if ( code === asterisk && css.charCodeAt(pos + 1) === slash ) {
                    next = pos;
                    pos = next - 1;
                    break loop;
                }

                if ( code === hash && css.charCodeAt(pos + 1) === openCurly ) {
                    tokens.push(['startInterpolant', '#{', line, pos + 1 - offset]);
                    next = pos + 1;

                    let { tokens: t, pos: p } = tokenizeInterpolant(input, line, next + 1);
                    tokens = tokens.concat(t);
                    next = p;

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

    return { tokens, line, pos, offset };
}
