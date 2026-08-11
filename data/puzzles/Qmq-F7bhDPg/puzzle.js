// Title: Winter or Spring?
// Author: Spelldaddy & Rockratzero
// Video: https://www.youtube.com/watch?v=Qmq-F7bhDPg
// Source: https://app.crackingthecryptic.com/sudoku/f8mQfj7Png

// Normal sudoku rules apply (default Shape('9x9') regions/rows/cols). Digits
// along an arrow sum to the number in the circle: Arrow's DESCRIPTION is
// "Values along the arrow must sum to the value in the circle", a verbatim
// match, first cell is the circle/bulb, the rest are the arrow cells. Two
// bulb cells (R4C3, R1C9) each anchor several independent arrows fanning out
// in different compass directions -- every arrow from a bulb sums to that
// same bulb cell's own digit (the circle carries no printed number of its
// own). Digits directly joined on a green line must have a difference of at
// least 5: Whisper's DESCRIPTION is "Adjacent values on the line must differ
// by at least the given difference", matching with difference=5.

const shape = new Shape('9x9');

const givens = [
  new Given('R2C6', 2),
  new Given('R6C2', 8),
  new Given('R6C5', 1),
];

// Arrow paths (circle first, then cells along the arrow), read off the
// arrows' drawn wayPoints.
const arrowPaths = [
  // R4C3 bulb: one arrow per compass direction (interior cell, all 8 open).
  ['R4C3', 'R3C3', 'R2C3'],  // up
  ['R4C3', 'R3C4', 'R2C5'],  // up-right
  ['R4C3', 'R4C4', 'R4C5'],  // right
  ['R4C3', 'R5C4'],          // down-right
  ['R4C3', 'R5C3', 'R6C3'],  // down
  ['R4C3', 'R5C2', 'R6C1'],  // down-left
  ['R4C3', 'R4C2', 'R4C1'],  // left
  ['R4C3', 'R3C2'],          // up-left
  // R1C9 bulb: top-right corner cell, only the 3 on-board directions drawn.
  ['R1C9', 'R1C8', 'R1C7'],  // left
  ['R1C9', 'R2C8', 'R3C7'],  // down-left
  ['R1C9', 'R2C9', 'R3C9'],  // down
];
const arrows = arrowPaths.map(cells => new Arrow(...cells));

// Single green whisper line, 15 cells / 14 adjacent pairs, open (no
// wraparound). Cell order taken from the line's drawn wayPoints.
const whisperLine = [
  'R9C1', 'R8C1', 'R9C2', 'R8C2', 'R9C3', 'R9C4', 'R8C4', 'R9C5', 'R8C5',
  'R9C6', 'R8C6', 'R8C7', 'R9C7', 'R9C8', 'R8C9',
];
const whisper = new Whisper(5, ...whisperLine);

return [
  shape,
  ...givens,
  ...arrows,
  whisper,
];
