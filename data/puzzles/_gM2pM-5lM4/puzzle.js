// Title: KnabneR Lines
// Author: Daniel Grimes
// Video: https://www.youtube.com/watch?v=_gM2pM-5lM4
// Source: https://app.crackingthecryptic.com/sudoku/BmJmhJmFBG

// Normal sudoku rules apply, plus:
// - Anti-knight: identical digits cannot be a chess knight's move apart.
// - Each drawn orange line is a Nabner line: no repeated digit on the line,
//   and no two cells anywhere on the line (not just adjacent ones) hold
//   consecutive digits. (Orange is this puzzle's Nabner colour; "KnabneR" in
//   the title also names the genre.)
// - White dots join orthogonally-adjacent consecutive digits. Not all valid
//   dots are shown, so an undotted adjacent pair carries no information and
//   is left unconstrained.
// - Grey circles are odd digits.

// Drawn orange Nabner lines, transcribed from the source drawing.
const nabnerLines = [
  ['R3C9', 'R2C9', 'R1C9', 'R1C8'],
  ['R3C8', 'R3C7', 'R2C7', 'R2C6'],
  ['R3C6', 'R3C5', 'R2C5', 'R2C4', 'R3C4'],
  ['R1C1', 'R2C1'],
  ['R4C3', 'R5C3'],
  ['R4C2', 'R4C1'],
  ['R5C1', 'R6C1', 'R7C1', 'R7C2', 'R6C2'],
  ['R6C5', 'R7C5', 'R8C5', 'R9C5'],
  ['R6C6', 'R5C6', 'R5C5', 'R4C5', 'R4C6'],
  ['R7C9', 'R8C9', 'R9C9'],
  ['R8C2', 'R8C3'],
];

// "No two digits on the line can be consecutive" applies to every pair on the
// line, not just line-adjacent cells, so PairX (all pairs), not the
// line-adjacency Pair/Whisper style, is the faithful encoding.
const nabnerKey = PairX.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);

// White-dot edges (drawn overlay marks).
const whiteDots = [
  ['R1C7', 'R1C8'],
  ['R3C7', 'R4C7'],
  ['R4C7', 'R4C8'],
  ['R8C8', 'R8C9'],
];

// Grey-circle (odd) cells (drawn underlay marks).
const oddCells = ['R4C7', 'R8C5'];

return [
  new Shape('9x9'),

  new Given('R5C2', 2),

  new AntiKnight(),

  ...nabnerLines.map(cells => new AllDifferent(...cells)),
  ...nabnerLines.map(cells => new PairX(nabnerKey, 'Nabner', ...cells)),

  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),

  ...oddCells.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
];
