// Title: Anti-Ratio Astronomy
// Author: Scojo
// Video: https://www.youtube.com/watch?v=pqS8Ghlqn4c
// Source: https://app.crackingthecryptic.com/sudoku/fmDD3m73nh

// Normal Sudoku rules and the twelve given digits are retained. The red-dot
// galaxy partition is not encoded: it requires solver-discovered, variably
// sized regions that are connected, rotationally symmetric about distinct
// cell/edge/corner centres, cover the board, and are all-different internally.
// Every horizontal and vertical domino is anti-ratio: its digits are not 1:2.

const GIVENS = [
  ['R1C4', 1], ['R1C6', 6], ['R2C2', 4], ['R2C8', 1], ['R4C6', 3],
  ['R5C4', 2], ['R5C8', 5], ['R6C9', 4], ['R7C1', 1], ['R7C7', 7],
  ['R8C5', 2], ['R9C1', 7],
];

const grid = cellGraph('9x9');
const antiRatioKey = Pair.fnToKey((a, b) => a !== 2 * b && b !== 2 * a, 9);
const horizontalStarts = grid.cells().filter(cell => grid.step(cell, 0, 1));
const verticalStarts = grid.cells().filter(cell => grid.step(cell, 1, 0));
const antiRatioDominoes = [
  grid.makeReplicate(
    new Pair(antiRatioKey, 'Anti-ratio dominoes', 'R1C1', 'R1C2'), horizontalStarts),
  grid.makeReplicate(
    new Pair(antiRatioKey, 'Anti-ratio dominoes', 'R1C1', 'R2C1'), verticalStarts),
];

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  ...antiRatioDominoes,
];
