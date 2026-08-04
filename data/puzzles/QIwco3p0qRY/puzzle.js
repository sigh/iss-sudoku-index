// Title: Bismuth
// Author: bellsita
// Video: https://www.youtube.com/watch?v=QIwco3p0qRY
// Source: https://app.crackingthecryptic.com/sudoku/m7HmnD8T8p

// Normal sudoku rules apply (default row/column/box all-different from
// Shape).
//
// Black dot: joined cells hold digits in a 1:2 ratio (BlackDot).
// White dot: joined cells hold consecutive digits (WhiteDot).
// Not all dots are given -- no negative constraint on undotted pairs.
// Grey squares contain even digits (candidate-restricting Given).
// Blue lines: digits sum to the same value in each 3x3 box the line passes
// through, independently per line (RegionSumLine).

// Grey squares, from the payload's `underlays` (#CFCFCF fill, no rules-text
// coordinates given -- read from the drawn geometry).
const greySquares = ['R9C1', 'R1C9'];

// Blue (deepskyblue) region sum lines, from `lines`. L1-L3 are the three
// three-segment band lines (L1 is the rules' own worked example); L4-L5 are
// short lines crossing a single box border, each giving one 1-cell segment
// and one 2-cell segment.
const regionSumLines = [
  ['R2C1', 'R2C2', 'R2C3', 'R1C4', 'R2C5', 'R1C6', 'R2C7', 'R2C8', 'R2C9'],
  ['R5C1', 'R5C2', 'R5C3', 'R4C4', 'R5C5', 'R4C6', 'R5C7', 'R5C8', 'R5C9'],
  ['R8C1', 'R8C2', 'R8C3', 'R7C4', 'R8C5', 'R7C6', 'R8C7', 'R8C8', 'R8C9'],
  ['R3C3', 'R4C3', 'R4C2'],
  ['R7C7', 'R6C7', 'R6C8'],
];

// White dot edges, from `overlays` (white fill, 0.3x0.3 rounded marks
// centred on cell edges).
const whiteDots = [
  ['R2C4', 'R2C5'],
  ['R2C5', 'R2C6'],
  ['R4C5', 'R5C5'],
  ['R5C5', 'R6C5'],
  ['R8C4', 'R8C5'],
  ['R8C5', 'R8C6'],
  ['R1C2', 'R1C3'],
  ['R9C7', 'R9C8'],
  ['R6C3', 'R6C4'],
  ['R4C6', 'R4C7'],
];

// Black dot edges, from `overlays` (black fill, 0.3x0.3 rounded marks
// centred on cell edges).
const blackDots = [
  ['R6C2', 'R7C2'],
  ['R3C8', 'R4C8'],
];

return [
  new Shape('9x9'),
  new Given('R1C1', 1),
  new Given('R4C9', 3),
  new Given('R6C1', 9),
  new Given('R9C9', 7),
  ...greySquares.map(cell => new Given(cell, 2, 4, 6, 8)),
  ...regionSumLines.map(cells => new RegionSumLine(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
