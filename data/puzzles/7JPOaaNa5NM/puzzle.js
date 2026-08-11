// Title: Reunion
// Author: Playmaker6174
// Video: https://www.youtube.com/watch?v=7JPOaaNa5NM
// Source: https://app.crackingthecryptic.com/sudoku/8Rbb27h2pb

// Normal sudoku rules apply (default 9x9 grid, 3x3 boxes, digits 1-9).
// Digits along an arrow must sum to the digit in that arrow's circle:
// Arrow(circleCell, ...armCells) per ISS semantics (first cell is the sum
// target, the rest are summed). Every drawn circle lands on an arrow's
// first (bulb) cell.
// Digits along a purple line cannot repeat and form a consecutive set in
// any order: Renban(...cells) per ISS semantics, matching verbatim.

const arrows = [
  new Arrow('R3C4', 'R2C3', 'R1C3'),
  new Arrow('R6C4', 'R5C3', 'R4C3', 'R3C3'),
  new Arrow('R5C2', 'R6C2', 'R7C1'),
  new Arrow('R7C4', 'R6C3'),
  new Arrow('R8C4', 'R7C3'),
  new Arrow('R6C6', 'R5C7', 'R4C7'),
  new Arrow('R9C6', 'R8C7', 'R7C7', 'R6C7'),
  new Arrow('R9C7', 'R8C6', 'R7C6'),
];

const renbans = [
  new Renban('R1C2', 'R1C1', 'R2C1'),
  new Renban('R1C4', 'R2C5'),
  new Renban('R2C6', 'R1C7'),
  new Renban('R3C6', 'R2C7'),
  new Renban('R4C6', 'R3C7'),
  new Renban('R1C8', 'R2C9'),
  new Renban('R3C8', 'R4C9'),
  new Renban('R8C9', 'R9C9', 'R9C8'),
  new Renban('R8C1', 'R7C2', 'R6C1'),
  new Renban('R8C3', 'R9C4'),
];

return [
  new Shape('9x9'),
  ...arrows,
  ...renbans,
];
