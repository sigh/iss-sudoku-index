// Title: Dominos Vobiscum
// Author: Elgrandpaduro
// Video: https://www.youtube.com/watch?v=tuhnOEDUH5Q
// Source: https://app.crackingthecryptic.com/webapp/pQrr8jfgbH

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes),
// no givens.
//
// The grid is shaded into 36 two-cell dominoes (9 each of 4 colours; every
// domino sits entirely inside one row or one column, so sudoku's own
// row/column all-different already makes its two cells distinct) plus 9
// unshaded "blue" cells, one per box at row 2/5/8, col 2/5/8. Every printed
// number sits on the border between two dominoes and gives the absolute
// difference between their sums; the printed edges biject onto a graph
// whose 36 nodes are the dominoes and where every domino has exactly degree
// 2, transcribed in DOMINO_CELLS / DIFF_EDGES below.
//
// The blue cells form a 3x3 magic square (rows/cols/diagonals of their own
// R2/R5/R8 x C2/C5/C8 arrangement sum to 15, digits 1-9 once each).
//
// One "greater than" sign is drawn, on the border of R4C5 (a domino cell)
// and R5C5 (the magic square's own centre cell), pointing (apex) into R4C5;
// the rules say the sign points from the larger cell to the smaller one, so
// R5C5 > R4C5.

// Domino cells, keyed by colour+index (drawn shading colour groups, split
// into adjacent-cell pairs).
const DOMINO_CELLS = {
  Br1: ['R1C2', 'R1C3'], Br2: ['R1C5', 'R1C6'], Br3: ['R1C8', 'R1C9'],
  Br4: ['R4C2', 'R4C3'], Br5: ['R4C5', 'R4C6'], Br6: ['R4C8', 'R4C9'],
  Br7: ['R7C2', 'R7C3'], Br8: ['R7C5', 'R7C6'], Br9: ['R7C8', 'R7C9'],

  Rd1: ['R3C1', 'R3C2'], Rd2: ['R3C4', 'R3C5'], Rd3: ['R3C7', 'R3C8'],
  Rd4: ['R6C1', 'R6C2'], Rd5: ['R6C4', 'R6C5'], Rd6: ['R6C7', 'R6C8'],
  Rd7: ['R9C1', 'R9C2'], Rd8: ['R9C4', 'R9C5'], Rd9: ['R9C7', 'R9C8'],

  Yg1: ['R1C1', 'R2C1'], Yg2: ['R1C4', 'R2C4'], Yg3: ['R1C7', 'R2C7'],
  Yg4: ['R4C1', 'R5C1'], Yg5: ['R4C4', 'R5C4'], Yg6: ['R4C7', 'R5C7'],
  Yg7: ['R7C1', 'R8C1'], Yg8: ['R7C4', 'R8C4'], Yg9: ['R7C7', 'R8C7'],

  Pu1: ['R2C3', 'R3C3'], Pu2: ['R2C6', 'R3C6'], Pu3: ['R2C9', 'R3C9'],
  Pu4: ['R5C3', 'R6C3'], Pu5: ['R5C6', 'R6C6'], Pu6: ['R5C9', 'R6C9'],
  Pu7: ['R8C3', 'R9C3'], Pu8: ['R8C6', 'R9C6'], Pu9: ['R8C9', 'R9C9'],
};

// [dominoA, dominoB, |sum(A) - sum(B)|], transcribed from the 36 printed
// edge numbers.
const DIFF_EDGES = [
  ['Yg1', 'Rd1', 13], ['Br5', 'Pu5', 10], ['Rd7', 'Pu7', 9], ['Yg5', 'Br5', 9],
  ['Yg9', 'Rd9', 8], ['Br6', 'Pu6', 8], ['Rd2', 'Pu2', 8], ['Yg7', 'Rd7', 8],
  ['Br8', 'Pu8', 7], ['Rd8', 'Pu8', 7], ['Rd6', 'Pu6', 7], ['Rd1', 'Pu1', 6],
  ['Yg1', 'Br1', 5], ['Yg4', 'Rd4', 5], ['Yg8', 'Rd8', 5], ['Rd5', 'Pu5', 5],
  ['Yg2', 'Rd2', 5], ['Yg6', 'Br6', 5], ['Yg9', 'Br9', 5], ['Rd9', 'Pu9', 4],
  ['Yg6', 'Rd6', 4], ['Yg5', 'Rd5', 4], ['Rd4', 'Pu4', 4], ['Yg4', 'Br4', 4],
  ['Br1', 'Pu1', 2], ['Br4', 'Pu4', 5], ['Yg7', 'Br7', 2], ['Yg2', 'Br2', 2],
  ['Yg3', 'Br3', 2], ['Br9', 'Pu9', 1], ['Br3', 'Pu3', 1], ['Rd3', 'Pu3', 1],
  ['Br2', 'Pu2', 1], ['Br7', 'Pu7', 1], ['Yg3', 'Rd3', 0], ['Yg8', 'Br8', 5],
];

// |sum(A) - sum(B)| == diff, as an Or of the two signed linear equations
// (diff == 0 collapses to one equation, since both signs are then the same
// constraint).
function dominoDiff([aKey, bKey, diff]) {
  const a = DOMINO_CELLS[aKey];
  const b = DOMINO_CELLS[bKey];
  const plus = [...a.map(c => [c, 1]), ...b.map(c => [c, -1])];
  const minus = [...a.map(c => [c, -1]), ...b.map(c => [c, 1])];
  if (diff === 0) return new Sum(0, ...plus);
  return new Or([new Sum(diff, ...plus), new Sum(diff, ...minus)]);
}

// The 3x3 magic-square arrangement of the 9 blue cells.
const MAGIC = [
  ['R2C2', 'R2C5', 'R2C8'],
  ['R5C2', 'R5C5', 'R5C8'],
  ['R8C2', 'R8C5', 'R8C8'],
];
const magicLines = [
  ...MAGIC, // rows
  ...[0, 1, 2].map(c => MAGIC.map(row => row[c])), // columns
  [MAGIC[0][0], MAGIC[1][1], MAGIC[2][2]], // diagonal
  [MAGIC[0][2], MAGIC[1][1], MAGIC[2][0]], // anti-diagonal
];

return [
  new Shape('9x9'),
  // Magic square: digits 1-9 once each (Cage with no total is AllDifferent
  // only), each row/column/diagonal sums to 15 as the rules state directly.
  new Cage('', ...MAGIC.flat()),
  ...magicLines.map(cells => new Sum(15, ...cells)),
  // The one drawn greater-than sign.
  new GreaterThan('R5C5', 'R4C5'),
  // The 36 domino-pair difference clues.
  ...DIFF_EDGES.map(dominoDiff),
];
