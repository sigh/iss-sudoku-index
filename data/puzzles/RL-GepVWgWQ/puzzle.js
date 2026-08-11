// Title: T Time
// Author: Eric Rathbun
// Video: https://www.youtube.com/watch?v=RL-GepVWgWQ
// Source: https://app.crackingthecryptic.com/sudoku/FqLhDdr83m

// Normal sudoku rules (default rows/cols/boxes). One given: R5C5=5.
// Eight arrows: digit in the circle cell = sum of the two arm cells
// (Arrow's first cell is its circle). Four cages: no total given, so only
// their digits-cannot-repeat clause applies (Cage sum 0 = AllDifferent
// only, no sum enforced). Six Kropki dots: white = consecutive, black =
// ratio 1:2, each between one orthogonally adjacent pair only. "Not all
// possible dots are given" means undotted adjacent pairs carry no
// constraint, so no negative dot constraints are added elsewhere.

// Arrow circle (first cell) and its two arm cells, transcribed from the
// drawn `arrows` wayPoints and the matching `underlays` circle at the
// circle cell.
const arrows = [
  ['R1C1', 'R2C2', 'R2C3'],
  ['R1C5', 'R2C6', 'R3C6'],
  ['R1C9', 'R2C8', 'R3C8'],
  ['R5C1', 'R4C2', 'R4C3'],
  ['R5C9', 'R6C8', 'R6C7'],
  ['R9C1', 'R8C2', 'R7C2'],
  ['R9C5', 'R8C4', 'R7C4'],
  ['R9C9', 'R8C8', 'R8C7'],
];

// Cage cells, transcribed from the drawn `cages` array (each has no total).
const cages = [
  ['R3C2', 'R3C3', 'R2C4', 'R3C4', 'R4C4'],
  ['R2C7', 'R3C7', 'R4C7', 'R4C6', 'R4C8'],
  ['R6C2', 'R6C3', 'R6C4', 'R7C3', 'R8C3'],
  ['R6C6', 'R7C6', 'R8C6', 'R7C7', 'R7C8'],
];

// White (consecutive) dot pairs, transcribed from the white-filled edge
// overlays.
const whiteDots = [
  ['R4C3', 'R4C4'],
  ['R1C7', 'R2C7'],
  ['R4C7', 'R4C8'],
  ['R6C7', 'R6C8'],
];

// Black (ratio 1:2) dot pairs, transcribed from the black-filled edge
// overlays.
const blackDots = [
  ['R2C2', 'R3C2'],
  ['R4C3', 'R5C3'],
];

return [
  new Shape('9x9'),
  new Given('R5C5', 5),
  ...arrows.map(cells => new Arrow(...cells)),
  ...cages.map(cells => new Cage(0, ...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
