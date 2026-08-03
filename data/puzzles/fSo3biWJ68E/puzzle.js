// Title: Target Practice
// Author: oxjphs
// Video: https://www.youtube.com/watch?v=fSo3biWJ68E
// Source: https://app.crackingthecryptic.com/sudoku/h7pPQ9TtJd

// Normal sudoku rules apply (default 3x3 boxes). No given digits.
// Green line: adjacent digits along it differ by at least 5 (Whisper(5)).
// Black dots: adjacent cells are in a 2:1 ratio (BlackDot). No "not all dots
// given" wording, so unmarked edges get no ratio constraint.
// Filled circle: cell is odd. Filled square: cell is even. There is no
// Odd/Even class; both are encoded as candidate-restricting Givens.

// The payload draws the green line as four overlapping 9-cell strokes (one
// per side of the ring plus its neighbouring corner). Their edge sets union
// to exactly one simple closed 16-edge loop around the ring bordering the
// central 5x5 block, so it is modelled as a single closed Whisper line.
// Sequential-pair classes only bind consecutive pairs in the cell list, so
// the loop repeats its first cell at the end to cover the wrap-around edge.
const greenLineLoop = [
  'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7',
  'R4C7', 'R5C7', 'R6C7', 'R7C7',
  'R7C6', 'R7C5', 'R7C4', 'R7C3',
  'R6C3', 'R5C3', 'R4C3',
  'R3C3',
];

// Black-dot edges (orthogonal cell pairs), from the drawn overlay marks.
const blackDotEdges = [
  ['R4C5', 'R5C5'],
  ['R3C1', 'R3C2'],
  ['R5C8', 'R5C9'],
  ['R1C7', 'R1C8'],
  ['R8C9', 'R9C9'],
  ['R9C4', 'R9C5'],
  ['R8C2', 'R8C3'],
  ['R9C7', 'R9C8'],
  ['R3C2', 'R4C2'],
  ['R8C5', 'R8C6'],
  ['R6C7', 'R6C8'],
];

// Odd-circle cells, from the drawn round grey underlays.
const oddCells = [
  'R2C5', 'R3C5', 'R5C2', 'R5C3', 'R5C7', 'R5C8', 'R7C5', 'R8C5',
];

// Even-square cells, from the drawn square grey underlays.
const evenCells = ['R3C3', 'R3C7', 'R7C3', 'R7C7'];

return [
  new Shape('9x9'),
  new Whisper(5, ...greenLineLoop),
  ...blackDotEdges.map(edge => new BlackDot(...edge)),
  ...oddCells.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
  ...evenCells.map(cell => new Given(cell, 2, 4, 6, 8)),
];
