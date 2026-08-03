// Title: Tower of Babel
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=vLskKmKILDM
// Source: https://app.crackingthecryptic.com/sudoku/TGdG44jt84

// Normal sudoku rules apply (default row/column/box all-different, standard
// boxes). Fourteen arrows: the circled bulb cell equals the sum of the
// digits along its arm.

// Each entry is [bulb, ...arm], the circle cell then the shaft cells,
// transcribed from the payload's arrows/overlays geometry (arrow paths
// paired with a circle overlay at the path's first cell).
const arrows = [
  ['R6C4', 'R5C4', 'R4C4'],
  ['R6C6', 'R5C6', 'R4C6'],
  ['R1C4', 'R2C3', 'R3C3', 'R4C3'],
  ['R1C6', 'R2C7', 'R3C7', 'R4C7'],
  ['R6C3', 'R5C2', 'R5C1'],
  ['R6C7', 'R5C8', 'R5C9'],
  ['R9C6', 'R8C6', 'R8C7', 'R7C7'],
  ['R9C4', 'R8C4', 'R8C3', 'R7C3'],
  ['R6C5', 'R7C6'],
  ['R4C5', 'R3C5', 'R2C5', 'R1C5'],
  ['R2C1', 'R1C2', 'R1C3'],
  ['R2C9', 'R1C8', 'R1C7'],
  ['R9C7', 'R9C8', 'R8C8'],
  ['R9C3', 'R9C2', 'R8C2'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
];
