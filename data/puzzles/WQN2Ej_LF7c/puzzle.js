// Title: Magical Constellation
// Author: Daniel Hanson
// Video: https://www.youtube.com/watch?v=WQN2Ej_LF7c
// Source: https://sudokupad.app/fc9t0o7etr

// Normal Sudoku; knight-move cells differ. Black dots mark 1:2 pairs, and the
// rules say every possible black dot is drawn. The red outlined 3x3 box is a
// magic square: its rows, columns, and diagonals have equal sums.

// The 13 solid black edge dots transcribed from the drawn dot overlays.
const dots = [
  ['R1C5', 'R2C5'], ['R2C2', 'R3C2'], ['R1C6', 'R2C6'],
  ['R5C4', 'R6C4'], ['R6C3', 'R6C4'], ['R8C6', 'R9C6'],
  ['R9C7', 'R9C8'], ['R7C9', 'R8C9'], ['R5C8', 'R5C9'],
  ['R4C7', 'R5C7'], ['R3C8', 'R3C9'], ['R1C8', 'R2C8'],
  ['R1C8', 'R1C9'],
];
const dotKeys = new Set(dots.map(pair => [...pair].sort().join('|')));
const graph = cellGraph('9x9');
const horizontalStarts = graph.cells().filter(cell => {
  const pair = graph.block(cell, 1, 2);
  return pair && !dotKeys.has([...pair].sort().join('|'));
});
const verticalStarts = graph.cells().filter(cell => {
  const pair = graph.block(cell, 2, 1);
  return pair && !dotKeys.has([...pair].sort().join('|'));
});

// This custom pair predicate makes the stated exhaustive black-dot rule
// checkable: an undotted orthogonal pair may not be in a 1:2 ratio.
const noBlackDot = Pair.fnToKey((a, b) => a !== 2 * b && b !== 2 * a, 9);

// The red rectangular outline encloses these nine cells.
const magicSquare = [
  ['R2C3', 'R2C4', 'R2C5'], ['R3C3', 'R3C4', 'R3C5'], ['R4C3', 'R4C4', 'R4C5'],
  ['R2C3', 'R3C3', 'R4C3'], ['R2C4', 'R3C4', 'R4C4'], ['R2C5', 'R3C5', 'R4C5'],
  ['R2C3', 'R3C4', 'R4C5'], ['R2C5', 'R3C4', 'R4C3'],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...dots.map(pair => new BlackDot(...pair)),
  graph.makeReplicate(
    new Pair(noBlackDot, 'no-undrawn-black-dot', 'R1C1', 'R1C2'), horizontalStarts),
  graph.makeReplicate(
    new Pair(noBlackDot, 'no-undrawn-black-dot', 'R1C1', 'R2C1'), verticalStarts),
  new EqualSum(...magicSquare),
];
