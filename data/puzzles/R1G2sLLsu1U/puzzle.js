// Title: Outlier
// Author: Daniel Hanson
// Video: https://www.youtube.com/watch?v=R1G2sLLsu1U
// Source: https://sudokupad.app/ib3ewxrhep

// The black-dot rule is global only for black dots, so unmarked orthogonal
// edges are constrained not to contain a 1:2 ratio.
const palindrome = [
  'R3C9', 'R2C9', 'R1C9', 'R1C8', 'R1C7', 'R2C6', 'R2C5', 'R1C4',
  'R2C3', 'R3C4', 'R4C3', 'R4C4', 'R5C5', 'R6C4', 'R7C5', 'R8C4',
  'R9C3', 'R8C2', 'R8C1', 'R7C1',
];

const arrow = ['R5C3', 'R4C2', 'R3C1', 'R3C2'];

const blackDots = [
  ['R8C6', 'R8C7'],
  ['R4C2', 'R4C3'],
  ['R4C8', 'R4C9'],
  ['R3C8', 'R3C9'],
  ['R7C5', 'R8C5'],
  ['R2C7', 'R3C7'],
  ['R7C7', 'R8C7'],
  ['R8C7', 'R9C7'],
  ['R1C8', 'R2C8'],
  ['R5C9', 'R6C9'],
  ['R5C7', 'R5C8'],
];

function edgeId(a, b) {
  return [a, b].sort().join('/');
}

const blackDotEdges = new Set(blackDots.map(([a, b]) => edgeId(a, b)));
const unmarkedEdges = [];

for (let row = 1; row <= 9; row++) {
  for (let col = 1; col <= 9; col++) {
    const here = makeCellId(row, col);
    for (const [nextRow, nextCol] of [[row, col + 1], [row + 1, col]]) {
      if (nextRow > 9 || nextCol > 9) continue;
      const there = makeCellId(nextRow, nextCol);
      if (!blackDotEdges.has(edgeId(here, there))) {
        unmarkedEdges.push([here, there]);
      }
    }
  }
}

const notBlackDot = Pair.fnToKey((a, b) => a !== 2 * b && b !== 2 * a, 9);

return [
  new Shape('9x9'),
  new Given('R9C9', 3),

  new Palindrome(...palindrome),
  new Arrow(...arrow),

  ...blackDots.map(cells => new BlackDot(...cells)),
  ...unmarkedEdges.map(cells => new Pair(notBlackDot, 'not black dot', ...cells)),
];
