import PreviousMap from './previous-map';

import path from 'path';

let sequence = 0;

export default class Input {
    constructor(css, opts = { }) {
        this.css = css.toString();

        if ( this.css[0] === '\uFEFF' || this.css[0] === '\uFFFE' ) {
            this.css = this.css.slice(1);
        }

        if ( opts.from ) this.file = path.resolve(opts.from);

        let map = new PreviousMap(this.css, opts, this.id);
        if ( map.text ) {
            this.map = map;
            let file = map.consumer().file;
            if ( !this.file && file ) this.file = this.mapResolve(file);
        }

        if ( this.file ) {
            this.from = this.file;
        } else {
            sequence += 1;
            this.id   = '<input css ' + sequence + '>';
            this.from = this.id;
        }
        if ( this.map ) this.map.file = this.from;
    }

    mapResolve(file) {
        return path.resolve(this.map.consumer().sourceRoot || '.', file);
    }
}
