// Title: Pro-Diagonal
// Author: Justin Vitanza
// Video: https://www.youtube.com/watch?v=A2_zrGbho74
// Source: https://sudokupad.app/c8kz188s7p

// Latin Square: rows/cols all-different, no boxes -- NoBoxes() drops the
// default 3x3 box groups, leaving the row/column groups Shape('9x9') adds.
//
// Parity Parity: the grid is drawn as a checkerboard of yellow/blue cells,
// yellow on (row+col) odd, blue on (row+col) even -- verified against every
// one of the 81 drawn colour underlays. Each digit d must appear exactly d
// times in one of the two colours: for each d, either the yellow cells or
// the blue cells contain exactly d copies of d. `ContainExact` only
// restricts the value(s) it names, so one call per colour per digit states
// this without also constraining any other digit.
//
// Anti-Diagonal (Negative): Diagonal(-1) is ISS's '\' diagonal, R1C1..R9C9
// -- the rules' own "negative diagonal" (top-left to bottom-right).
//
// Anti-Knight: AntiKnight().
//
// Odd Circles: four single-cell grey circles at R1C1, R3C1, R5C1, R7C1 --
// each is a Given restricted to the odd digits.
//
// Hidden diagonal cages: the payload's cage list also carries 12 entries
// drawn with no border (`hidden`) and `unique` (all-different, no total)
// set, running along the diagonals parallel to the negative diagonal, each
// one omitting its own middle cell where that diagonal has odd length. A
// hidden, no-total cage is still a real cage in this payload format, not
// decoration -- so each is encoded as an AllDifferent over its own cells.
const hiddenCages = [
  ['R8C1', 'R9C2'],
  ['R7C1', 'R9C3'],
  ['R6C1', 'R7C2', 'R8C3', 'R9C4'],
  ['R5C1', 'R6C2', 'R8C4', 'R9C5'],
  ['R4C1', 'R5C2', 'R6C3', 'R7C4', 'R8C5', 'R9C6'],
  ['R3C1', 'R4C2', 'R5C3', 'R7C5', 'R8C6', 'R9C7'],
  ['R1C3', 'R2C4', 'R3C5', 'R5C7', 'R6C8', 'R7C9'],
  ['R1C4', 'R2C5', 'R3C6', 'R4C7', 'R5C8', 'R6C9'],
  ['R1C5', 'R2C6', 'R4C8', 'R5C9'],
  ['R1C6', 'R2C7', 'R3C8', 'R4C9'],
  ['R1C7', 'R3C9'],
  ['R1C8', 'R2C9'],
];

const yellowCells = [];
const blueCells = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    ((r + c) % 2 === 1 ? yellowCells : blueCells).push(makeCellId(r, c));
  }
}

const parityConstraints = [];
for (let d = 1; d <= 9; d++) {
  const repeated = Array(d).fill(d).join('_');
  parityConstraints.push(new Or([
    new ContainExact(repeated, ...yellowCells),
    new ContainExact(repeated, ...blueCells),
  ]));
}

return [
  new Shape('9x9'),
  new NoBoxes(),
  new Diagonal(-1),
  new AntiKnight(),
  new Given('R1C1', 1, 3, 5, 7, 9),
  new Given('R3C1', 1, 3, 5, 7, 9),
  new Given('R5C1', 1, 3, 5, 7, 9),
  new Given('R7C1', 1, 3, 5, 7, 9),
  ...parityConstraints,
  ...hiddenCages.map(cells => new AllDifferent(...cells)),
];
