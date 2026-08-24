// Title: Mounted Archery #3
// Author: AFrayedKnot
// Video: https://www.youtube.com/watch?v=5D0byP3psnQ
// Source: https://app.crackingthecryptic.com/sudoku/BtHPHf6bLj

// Normal sudoku rules (default rows/cols/boxes). 14 arrows: each circled
// bulb cell's digit equals the sum of the digits on its arm. Anti-knight:
// no repeated digit a knight's move apart. "Bifurcation is not necessary!"
// is a difficulty remark for the player, not a grid constraint, and is
// omitted.

// Arrow bulb (first cell, drawn with a circle underlay) and arm cells,
// transcribed from the drawn `arrows` waypoints and matched one-to-one
// against the 14 circle `underlays`.
const arrows = [
  ['R2C2', 'R3C1', 'R3C2', 'R3C3'],
  ['R2C3', 'R3C4'],
  ['R2C5', 'R3C5', 'R3C6'],
  ['R3C7', 'R4C8'],
  ['R3C9', 'R2C8', 'R2C7'],
  ['R6C1', 'R5C1', 'R5C2'],
  ['R6C3', 'R5C4', 'R5C5', 'R5C6'],
  ['R6C4', 'R5C3'],
  ['R8C1', 'R7C1', 'R7C2'],
  ['R8C2', 'R7C3', 'R7C4'],
  ['R9C3', 'R9C4', 'R8C4'],
  ['R9C6', 'R9C7', 'R9C8'],
  ['R8C6', 'R7C6', 'R7C5'],
  ['R7C8', 'R6C9'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
  new AntiKnight(),
];
