import Input from './input';
import tokenize from './tokenize';

let scss = {};
scss.tokenize = function(css) {
    let input = new Input(css);
    return tokenize(input);
};

export default scss;
