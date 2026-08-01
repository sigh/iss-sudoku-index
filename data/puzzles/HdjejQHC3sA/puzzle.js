// Title: Brain Fog
// Author: Scojo
// Video: https://www.youtube.com/watch?v=HdjejQHC3sA
// Source: https://sudokupad.app/8vzgxh2w8i

// Normal 9x9 Sudoku; grid cells are 1-9, while the cipher letters are a permutation of 0-9.
const grid = cellGraph('9x9');
const digitCells = grid.cells();
const cipherVars = new Var('L', 'cipher digits A-J', 10);
const letters = Object.fromEntries(
  [...'ABCDEFGHIJ'].map((letter, index) => [letter, cipherVars.cell(index + 1)]),
);
const cipher = text => [...text].map(letter => letters[letter]);

// Drawn cipher-labelled killer cages. A one-letter label is its digit; a two-letter label is tens then ones.
function cipherSum(label, cells) {
  if (label.length === 1) return new EqualSum(cells, [letters[label]]);
  const terms = [...cells, [letters[label[0]], -1]];
  terms[terms.length - 1] = [letters[label[0]], -10];
  terms.push([letters[label[1]], -1]);
  return new Sum(0, ...terms);
}
function cipherCage(label, ...cells) {
  return [new AllDifferent(...cells), cipherSum(label, cells)];
}

// Each drawn X-Sum clue: the first in-grid digit selects a prefix, whose sum is the cipher number.
function cipherXSum(label, cells) {
  const sumFor = prefix => label.length === 1
    ? new EqualSum(prefix, [letters[label]])
    : new Sum(0, ...prefix, [letters[label[0]], -10], [letters[label[1]], -1]);
  return new Or(cells.map((_, index) => new And([
    new Given(cells[0], index + 1),
    sumFor(cells.slice(0, index + 1)),
  ])));
}

const cages = [
  ...cipherCage('A', 'R2C2', 'R2C3'),
  ...cipherCage('EF', 'R2C4', 'R3C4', 'R3C5', 'R4C5'),
  ...cipherCage('G', 'R4C3', 'R4C4'),
  ...cipherCage('ED', 'R3C6', 'R3C7'),
  ...cipherCage('EJ', 'R4C6', 'R4C7', 'R4C8'),
  ...cipherCage('BD', 'R5C5', 'R6C5', 'R7C5'),
  ...cipherCage('C', 'R6C6', 'R6C7'),
  ...cipherCage('EC', 'R7C6', 'R7C7', 'R7C8', 'R7C9', 'R8C9'),
  ...cipherCage('J', 'R7C3'),
];

const xSums = [
  cipherXSum('IF', ['R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5']),
  cipherXSum('E', ['R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9']),
  cipherXSum('G', ['R2C9', 'R2C8', 'R2C7', 'R2C6', 'R2C5', 'R2C4', 'R2C3', 'R2C2', 'R2C1']),
  cipherXSum('H', ['R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9']),
  cipherXSum('E', ['R5C9', 'R5C8', 'R5C7', 'R5C6', 'R5C5', 'R5C4', 'R5C3', 'R5C2', 'R5C1']),
  cipherXSum('A', ['R8C1', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R8C9']),
  cipherXSum('A', ['R8C9', 'R8C8', 'R8C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3', 'R8C2', 'R8C1']),
  cipherXSum('C', ['R9C5', 'R8C5', 'R7C5', 'R6C5', 'R5C5', 'R4C5', 'R3C5', 'R2C5', 'R1C5']),
];

return [
  new Shape('9x9', '0-9'),
  grid.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  cipherVars,
  new AllDifferent(...cipher('ABCDEFGHIJ')),
  new Given(letters.I, 1, 2, 3, 4, 5, 6, 7, 8, 9),
  new Given(letters.E, 1, 2, 3, 4, 5, 6, 7, 8, 9),
  new Given(letters.B, 1, 2, 3, 4, 5, 6, 7, 8, 9),
  ...cages,
  ...xSums,
];
