// Title: It's ABC
// Author: oskode
// Video: https://www.youtube.com/watch?v=kFZa71JIKvo
// Source: https://sudokupad.app/7iiikykquy

// A, B, and C are represented by decimal tens/ones variables because their
// sums may exceed 9. The grid remains restricted to Sudoku digits 1-9.

const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const letters = new Var('L', 'Decimal digits of A, B, C', 6);
const [At, Ao, Bt, Bo, Ct, Co] = letters.cells();
const A = [At, Ao];
const B = [Bt, Bo];
const C = [Ct, Co];

const gridDigitDomain = graph.makeReplicate(
  new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9));

// A variable-total X-sum is a disjunction over the first digit N. Each branch
// fixes N and equates the letter to the sum of the first N cells.
const letterTerms = ([tens, ones]) => [[tens, -10], [ones, -1]];
const variableSum = (letter, cells) =>
  new Sum(0, ...cells, ...letterTerms(letter));
const variableXSum = (letter, cells) => new Or(
  cells.map((_, i) => new And([
    new Given(cells[0], i + 1),
    variableSum(letter, cells.slice(0, i + 1)),
  ])));
const differentLetters = ([xTens, xOnes], [yTens, yOnes]) => new Or([
  new AllDifferent(xTens, yTens),
  new AllDifferent(xOnes, yOnes),
]);

const cageSums = [
  variableSum(A, ['R5C7', 'R5C8', 'R5C9']),
  variableSum(B, ['R5C1', 'R5C2', 'R5C3']),
  variableSum(C, ['R1C5', 'R2C5', 'R3C5']),
];

const redDiagonalSums = [
  variableSum(C, ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9']),
  variableSum(A, ['R1C6', 'R2C7', 'R3C8', 'R4C9']),
  variableSum(B, ['R1C9']),
  variableSum(A, ['R5C9', 'R4C8', 'R3C7', 'R2C6', 'R1C5']),
  variableSum(A, ['R7C1', 'R8C2', 'R9C3']),
];

const blackXSums = [
  variableXSum(C, graph.row(3)),
  variableXSum(C, graph.row(3).reverse()),
  variableXSum(A, graph.column(5).reverse()),
  variableXSum(B, graph.column(1).reverse()),
  variableXSum(B, graph.column(9).reverse()),
];

return [
  shape,
  gridDigitDomain,
  new Given('R1C5', 6),
  letters,
  differentLetters(A, B),
  differentLetters(A, C),
  differentLetters(B, C),
  ...cageSums,
  ...redDiagonalSums,
  ...blackXSums,
];
