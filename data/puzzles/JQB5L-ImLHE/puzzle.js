// Title: Fondue
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=JQB5L-ImLHE
// Source: https://app.crackingthecryptic.com/sudoku/6FTpFmNNhp

// Normal sudoku rules apply (standard rows/columns/boxes from Shape('9x9')).
// In cages, digits sum to the small clue in the cage's top-left cell and
// cannot repeat within the cage -- Cage(sum, ...cells). Cage cells and
// totals from the source's cage clue array.
const cages = [
  new Cage(20, 'R4C4', 'R5C4', 'R6C4', 'R6C5', 'R6C6'),
  new Cage(21, 'R4C5', 'R5C5', 'R5C6'),
];

// Digits along an arrow sum to the digit in that arrow's circle --
// Arrow(bulb, ...arm), circle cell first. Arrow paths and circled bulb
// cells from the source's arrow and circle-underlay data.
const arrows = [
  new Arrow('R5C2', 'R5C3', 'R5C4'),
  new Arrow('R2C5', 'R3C5', 'R4C5'),
  new Arrow('R5C8', 'R5C7', 'R5C6'),
  new Arrow('R8C5', 'R7C5', 'R6C5'),
  new Arrow('R2C8', 'R3C7', 'R4C6'),
  new Arrow('R8C2', 'R7C3', 'R6C4'),
  new Arrow('R8C8', 'R7C7', 'R6C6'),
  new Arrow('R2C2', 'R3C3', 'R4C4'),
];

// White dots join consecutive digits (WhiteDot); the black dot joins
// digits in a 1:2 ratio (BlackDot). Not all possible dots are given, so no
// negative constraint is implied on adjacent cell pairs without a dot.
// Dot placements from the source's edge-overlay data.
const whiteDots = [
  ['R3C8', 'R3C9'],
  ['R1C3', 'R2C3'],
  ['R5C4', 'R6C4'],
  ['R6C4', 'R6C5'],
  ['R6C3', 'R7C3'],
  ['R7C3', 'R7C4'],
  ['R1C7', 'R2C7'],
];
const blackDots = [
  ['R7C8', 'R7C9'],
];

return [
  new Shape('9x9'),
  ...cages,
  ...arrows,
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
];
