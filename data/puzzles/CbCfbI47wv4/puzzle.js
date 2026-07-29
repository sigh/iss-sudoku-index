// Title: Squaring the Squircles
// Author: Patrik Repo
// Video: https://www.youtube.com/watch?v=CbCfbI47wv4
// Source: https://app.crackingthecryptic.com/o7xu0d0pz3

// Normal Sudoku applies. Cage totals are the displayed squared letter expressions;
// A-H are distinct positive integers. Each coloured group totals a perfect square.
const shape = new Shape('9x9', 16);
const graph = cellGraph(shape);
const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const values = Array.from({length: 16}, (_, i) => i + 1);
const letters = new Var('L', 'A-H', 8);
const [A, B, C, D, E, F, G, H] = letters.cells();

const cells = text => text.split(' ');
const squareSum = (letter, group) => new Or(values.map(value => new And([
  new Given(letter, value), new Sum(value * value, ...group)
])));
const perfectSquareSum = group => new Or(values.map(value =>
  new Sum(value * value, ...group)
));
const differenceSquareSum = group => new Or(values.flatMap(b => values.map(g =>
  new And([new Given(B, b), new Given(G, g), new Sum((b - g) ** 2, ...group)])
)));

// Cage cell tables are transcribed from the labelled cage outlines.
const cages = {
  difference: cells('R1C1'),
  A: cells('R1C2'),
  F: cells('R2C1 R3C1 R4C1 R5C1 R6C1 R7C1 R8C1 R9C1 R9C2 R8C2'),
  B1: cells('R1C3 R2C3 R2C2 R3C2 R3C3 R4C3'),
  H: cells('R3C5 R3C4 R4C4 R5C4 R6C4 R7C4 R8C4 R9C4 R9C3 R8C3 R7C3 R6C3 R5C3'),
  C: cells('R1C4 R1C5 R1C6 R2C6 R3C6 R2C5 R2C4 R4C6 R4C5 R5C5 R6C5 R5C6 R6C6 R7C6 R8C6'),
  E: cells('R1C9'),
  D: cells('R1C7 R1C8 R2C8 R2C7 R3C7 R3C8 R4C8 R4C7 R5C7 R5C8 R6C8 R6C7 R7C7 R7C8 R8C8 R8C7 R9C7 R9C8 R9C6 R9C5 R8C5 R7C5'),
  B2: cells('R2C9 R3C9 R4C9 R5C9 R6C9 R7C9 R8C9 R9C9'),
  G: cells('R4C2 R5C2 R6C2 R7C2'),
};
// Colour cell tables are transcribed from the coloured cell backgrounds.
const colours = [
  cells('R1C1 R1C9 R9C9 R9C1 R7C5 R5C3 R3C5 R5C7'),
  cells('R1C2 R1C3 R1C4 R1C5 R1C6 R1C7 R1C8 R2C8 R2C9 R3C9 R4C9 R5C9 R6C9 R7C9 R8C9 R8C8 R9C8 R9C7 R9C6 R9C5 R9C4 R9C3 R9C2 R8C2 R8C1 R7C1 R6C1 R5C1 R4C1 R3C1 R2C1 R2C2'),
  cells('R2C3 R2C7 R3C8 R7C8 R8C7 R8C3 R7C2 R3C2'),
  cells('R2C4 R2C5 R2C6 R3C6 R3C7 R4C7 R4C8 R5C8 R6C8 R6C7 R7C7 R7C6 R8C6 R8C5 R8C4 R7C4 R7C3 R6C3 R6C2 R5C2 R4C2 R4C3 R3C3 R3C4'),
  cells('R4C4 R4C5 R4C6 R5C6 R6C6 R6C5 R6C4 R5C4'),
  cells('R5C5'),
];

return [
  shape,
  graph.makeReplicate(new Given('R1C1', ...digits)),
  letters,
  new AllDifferent(...letters.cells()),
  differenceSquareSum(cages.difference),
  squareSum(A, cages.A), squareSum(F, cages.F), squareSum(B, cages.B1),
  squareSum(H, cages.H), squareSum(C, cages.C), squareSum(E, cages.E),
  squareSum(D, cages.D), squareSum(B, cages.B2), squareSum(G, cages.G),
  ...colours.map(perfectSquareSum),
  new Thermo('R2C8', 'R3C8', 'R4C7', 'R5C8', 'R6C8', 'R7C7'),
  new Thermo('R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'),
  new BlackDot('R8C5', 'R8C6'), new BlackDot('R2C4', 'R2C5'),
  new V('R2C7', 'R2C8'), new V('R9C5', 'R9C6'), new X('R4C5', 'R4C6'),
  new Palindrome('R3C5', 'R4C6', 'R5C7'),
];
