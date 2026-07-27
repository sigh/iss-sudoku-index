// Title: Squiggles
// Author: Ratfinkz
// Video: https://www.youtube.com/watch?v=75Ht8YUekbE
// Source: https://sudokupad.app/sib54u6n6p

// Normal sudoku, no givens. Consecutive digits along each green line differ
// by at least 5 (German Whisper). Each green stroke is drawn on an 11x11
// canvas whose outer ring is not part of the 9x9 grid; several strokes dip
// into that outer ring and back, mid-path or at an end, to mark a "hit
// points" side clue for the touched row/column. That side clue has no
// printed numeric target anywhere in the source and is not encoded; the
// whisper lists below are each stroke's cells restricted to the 9x9 grid,
// split at every point a stroke leaves it, since only those cells hold a
// sudoku digit.

const whispers = [
  ['R1C3', 'R2C3', 'R3C3', 'R3C2', 'R3C1', 'R2C1', 'R2C2', 'R1C2'],
  ['R2C9', 'R1C9', 'R2C8', 'R1C8', 'R1C7'],
  ['R2C4', 'R1C4', 'R1C5', 'R1C6', 'R2C7', 'R3C8'],
  ['R6C3', 'R5C3', 'R4C3', 'R4C2', 'R4C1'],
  ['R5C1', 'R6C1'],
  ['R5C6', 'R4C7', 'R5C8', 'R6C8'],
  ['R9C1', 'R8C1'],
];

return [
  ...whispers.map(cells => new Whisper(5, ...cells)),
];
