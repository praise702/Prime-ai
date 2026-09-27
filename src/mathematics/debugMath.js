const parser =
require("./mathParser");


const math =
require("./mathEngine");



let text =
"what is 68545 multiply by 5628";



console.log(
"INPUT:",
text
);



console.log(
"PARSER:",
parser.parse(text)
);



console.log(
"ANSWER:",
math.calculate(text)
);