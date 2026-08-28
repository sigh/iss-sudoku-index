// Title: When Allies Collide
// Author: Playmaker6174
// Video: https://www.youtube.com/watch?v=7fCXSRXKFgE
// Source: https://tinyurl.com/4a8ty7vu

// Standard 9x9 sudoku (rows/columns/3x3 boxes). No givens.
// Arrows: arm cells sum to the circle digit (bulb cell listed first).
// One arrow (the R4C5 bulb) is drawn as two separate line entries sharing
// the same bulb cell -- a "Y" arrow with two independent arms, each summing
// to the one bulb.
// Blue lines: RegionSumLine -- digits on the line sum to an equal total N
// within each box the line passes through (N may differ line to line).

const arrows = [
  new Arrow('R1C2', 'R1C3', 'R1C4', 'R2C3'),
  new Arrow('R4C5', 'R3C4', 'R2C4'),
  new Arrow('R4C5', 'R3C6', 'R2C6'),
  new Arrow('R1C8', 'R1C7', 'R1C6', 'R2C7'),
  new Arrow('R6C1', 'R5C2', 'R5C3', 'R4C3'),
  new Arrow('R9C2', 'R9C3', 'R9C4'),
];

const regionSumLines = [
  new RegionSumLine('R6C2', 'R6C3', 'R7C4', 'R8C4', 'R9C4'),
  new RegionSumLine('R6C8', 'R6C7', 'R7C6', 'R8C6'),
  new RegionSumLine('R9C8', 'R9C7', 'R9C6', 'R9C5', 'R8C5', 'R7C5'),
  new RegionSumLine('R5C1', 'R6C1', 'R7C2', 'R7C3'),
  new RegionSumLine('R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9'),
];

return [new Shape('9x9'), ...arrows, ...regionSumLines];
