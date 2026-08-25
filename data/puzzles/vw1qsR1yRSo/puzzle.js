// Title: The XV Killers
// Author: Stephen Parthimos
// Video: https://www.youtube.com/watch?v=vw1qsR1yRSo
// Source: https://app.crackingthecryptic.com/webapp/Hbjn4TfLph

// Standard 9x9 sudoku. Cages carry no printed total: digits do not repeat
// within a cage (a killer cage with no total is AllDifferent). A drawn V/X
// mark sits on the boundary edge between two cages and fixes the absolute
// difference between the two cages' digit sums to 5 (V) or 10 (X); other
// unmarked cage-pair differences of 5 or 10 are explicitly not implied.

// Cage cell lists, transcribed from the puzzle's drawn cage shapes.
const cages = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R3C1'],
  ['R1C4', 'R2C4', 'R3C4'],
  ['R3C3'],
  ['R4C1', 'R4C2', 'R4C3'],
  ['R6C1'],
  ['R6C2'],
  ['R8C1'],
  ['R7C2', 'R8C2'],
  ['R7C3', 'R8C3', 'R9C3'],
  ['R8C4', 'R9C4'],
  ['R9C5'],
  ['R3C5', 'R4C5', 'R5C5'],
  ['R5C6', 'R6C6'],
  ['R4C6', 'R4C7', 'R3C8', 'R4C8', 'R5C8', 'R4C9'],
  ['R2C7', 'R3C7', 'R2C8'],
  ['R2C6'],
  ['R1C7', 'R1C8', 'R1C9'],
  ['R2C9'],
  ['R6C7', 'R6C8'],
  ['R6C9'],
  ['R7C9'],
  ['R7C8'],
  ['R7C7', 'R8C7', 'R8C8'],
];

// V/X marks, transcribed from the puzzle's drawn edge marks (each a "V" or
// "X" centred on the edge between the two listed cells). Each mark's two
// cells belong to two different cages (looked up below), and the mark
// constrains those two cages' sums, not just the two adjacent cells.
const marks = [
  { text: 'V', cells: ['R6C1', 'R6C2'] },
  { text: 'V', cells: ['R6C9', 'R7C9'] },
  { text: 'V', cells: ['R7C8', 'R7C9'] },
  { text: 'V', cells: ['R9C3', 'R9C4'] },
  { text: 'V', cells: ['R7C2', 'R7C3'] },
  { text: 'V', cells: ['R8C1', 'R8C2'] },
  { text: 'V', cells: ['R3C3', 'R3C4'] },
  { text: 'V', cells: ['R4C6', 'R5C6'] },
  { text: 'V', cells: ['R1C9', 'R2C9'] },
  { text: 'X', cells: ['R7C7', 'R7C8'] },
  { text: 'X', cells: ['R6C6', 'R6C7'] },
  { text: 'X', cells: ['R2C6', 'R2C7'] },
  { text: 'X', cells: ['R3C4', 'R3C5'] },
  { text: 'X', cells: ['R1C3', 'R1C4'] },
  { text: 'X', cells: ['R3C3', 'R4C3'] },
  { text: 'X', cells: ['R9C4', 'R9C5'] },
];

// Derive, rather than hand-list, which cage each mark's two cells belong to.
const cageOfCell = new Map();
cages.forEach((cells, cageIndex) => {
  for (const cell of cells) cageOfCell.set(cell, cageIndex);
});

const cageConstraints = cages
  .filter(cells => cells.length > 1)
  .map(cells => new AllDifferent(...cells));

// |sum(cageA) - sum(cageB)| = diff, as an Or of the two signed equalities.
const cageSumDiffCells = (cellsA, cellsB) => [
  ...cellsA,
  ...cellsB.map(cell => [cell, -1]),
];
const markConstraints = marks.map(({ text, cells: [cellA, cellB] }) => {
  const cageA = cages[cageOfCell.get(cellA)];
  const cageB = cages[cageOfCell.get(cellB)];
  const diff = text === 'V' ? 5 : 10;
  const sumCells = cageSumDiffCells(cageA, cageB);
  return new Or([
    new Sum(diff, ...sumCells),
    new Sum(-diff, ...sumCells),
  ]);
});

return [
  new Shape('9x9'),
  ...cageConstraints,
  ...markConstraints,
];
