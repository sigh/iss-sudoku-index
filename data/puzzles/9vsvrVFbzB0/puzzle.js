// Title: Bat Emerging from the Mist
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=9vsvrVFbzB0
// Source: https://app.crackingthecryptic.com/sudoku/PR79NF7R4g

// Rules: Normal sudoku. Adjacent digits along the drawn (closed) line differ
// by >= 4. A digit in a gold-background cell must sum to 5 or 10 with at
// least one orthogonally adjacent cell's digit. A digit in a plain
// (white/uncoloured) cell must not sum to 5 or 10 with any orthogonally
// adjacent cell's digit -- this applies regardless of the neighbour's own
// colour.
//
// The rules text's "For example r2c5 and r3c6 cannot be a 3 or an 8. However,
// one or both of r2c7 and r1c6 must be a 3 or an 8." is a worked illustration
// for solvers (its own "For example .../However ..." framing), not a further
// constraint: neither pair is orthogonally adjacent, so it cannot be a direct
// instance of the stated pairwise rule, and it is not encoded separately.

const graph = cellGraph('9x9');

// Gold-background cells, from the puzzle's underlay fill (#F7D038); every
// other cell is plain/white. Transcribed from the underlay geometry.
const goldCells = [
  'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9',
  'R2C1', 'R2C3', 'R2C4', 'R2C6', 'R2C7', 'R2C8', 'R2C9',
  'R3C1', 'R3C3', 'R3C4', 'R3C7', 'R3C8',
  'R4C1', 'R4C6', 'R4C7', 'R4C9',
  'R5C1', 'R5C2', 'R5C3', 'R5C5', 'R5C7', 'R5C8', 'R5C9',
  'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C9',
  'R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C8', 'R7C9',
  'R8C1', 'R8C2', 'R8C3', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R8C9',
  'R9C1', 'R9C2', 'R9C5', 'R9C7', 'R9C9',
];
const goldSet = new Set(goldCells);
const whiteCells = graph.cells().filter(c => !goldSet.has(c));

// Coloured-cell rule: at least one orthogonal neighbour pair sums to 5 or 10.
const colouredRequire = goldCells.map(cell => {
  const options = [];
  for (const n of graph.neighbours(cell)) {
    options.push(new X(cell, n));
    options.push(new V(cell, n));
  }
  return new Or(options);
});

// White-cell rule: no orthogonal neighbour pair may sum to 5 or 10, whatever
// that neighbour's own colour. Applied once per grid edge that touches a
// white cell.
const noFiveOrTenKey = Pair.fnToKey((a, b) => a + b !== 5 && a + b !== 10, 9);
const seenEdges = new Set();
const whiteForbid = [];
for (const cell of whiteCells) {
  for (const n of graph.neighbours(cell)) {
    const edgeKey = [cell, n].sort().join('-');
    if (seenEdges.has(edgeKey)) continue;
    seenEdges.add(edgeKey);
    whiteForbid.push(new Pair(noFiveOrTenKey, 'white-no-5-or-10', cell, n));
  }
}

// The drawn line, closed loop; last entry repeats the first cell for the
// wrap-around edge (per Whisper's consecutive-pair binding).
const lineCells = [
  'R4C8', 'R4C7', 'R3C6', 'R2C6', 'R3C5', 'R3C4', 'R2C4', 'R2C3', 'R2C2',
  'R3C1', 'R3C2', 'R4C2', 'R4C3', 'R5C3', 'R6C3', 'R6C4', 'R7C4', 'R7C5',
  'R7C6', 'R8C6', 'R8C7', 'R9C7', 'R8C8', 'R7C8', 'R6C8', 'R6C7', 'R5C7',
  'R4C8',
];

return [
  new Shape('9x9'),
  new Given('R2C6', 2),
  new Given('R4C8', 6),
  new Whisper(4, ...lineCells),
  ...colouredRequire,
  ...whiteForbid,
];
