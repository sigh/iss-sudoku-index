// Title: I don't like german whisper lines
// Author: Mellie
// Video: https://www.youtube.com/watch?v=oURYwBKgVCM
// Source: https://sudokupad.app/ygwn4o9dps

// Normal sudoku rules apply. German whisper (green line): neighbouring
// digits along a green line have a difference of at least 5. Killer cage:
// digits in a cage may not repeat and sum to the total given. Kropki dots:
// digits in cells joined by a white dot are consecutive. Not all dots are
// given, so absence of a dot is not a negative constraint.

const cages = [
  { sum: 6, cells: ['R1C1', 'R1C2', 'R2C1'] },
  { sum: 6, cells: ['R1C9', 'R2C8', 'R2C9'] },
  { sum: 18, cells: ['R4C1', 'R4C2', 'R4C3'] },
  { sum: 6, cells: ['R7C1', 'R7C2', 'R8C2'] },
  { sum: 6, cells: ['R7C8', 'R8C8', 'R8C9'] },
];

// Whisper line cell paths. Adjacent pairs may be orthogonal or diagonal
// (the drawn line runs through a shared cell corner); Whisper() only cares
// about the sequence of cells, not their geometric relationship.
const whisperLines = [
  ['R2C2', 'R1C3', 'R1C4', 'R2C5'],
  ['R9C2', 'R8C3', 'R8C4', 'R7C5'],
  ['R3C8', 'R3C9', 'R4C9', 'R4C8', 'R4C7', 'R5C6', 'R5C5'],
  ['R6C6', 'R7C7'],
  ['R4C6', 'R4C5', 'R3C5'],
  ['R6C3', 'R6C2', 'R7C2'],
  ['R5C4', 'R4C3', 'R3C2'],
  ['R7C1', 'R8C1'],
  ['R2C6', 'R3C6'],
  ['R1C8', 'R1C9'],
];

const whiteDots = [
  ['R5C1', 'R5C2'],
  ['R7C3', 'R8C3'],
];

return [
  new Shape('9x9'),
  ...cages.map(({ sum, cells }) => new Cage(sum, ...cells)),
  ...whisperLines.map(cells => new Whisper(5, ...cells)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
];
