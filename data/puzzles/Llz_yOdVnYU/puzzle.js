// Title: Multi-Rule QAS
// Author: Daniel Grimes
// Video: https://www.youtube.com/watch?v=Llz_yOdVnYU
// Source: https://app.crackingthecryptic.com/sudoku/gjrqn4bQHm
//
// Normal sudoku rules apply (standard 3x3 boxes; Shape('9x9') gives the
// default row/col/box all-different groups, matching the puzzle's drawn
// regions).
// Along thermometers, digits increase from the bulb -> Thermo(bulb, ...tip).
// Digits along an arrow sum to the number in the circle -> Arrow(bulb, ...arm).
// Digits on the purple line are consecutive digits in any order -> Renban.
// A white dot joins two consecutive digits -> WhiteDot.
// A black dot joins digits with a 1:2 ratio -> BlackDot.
// An X joins two digits that sum to 10 -> X.
// Cages show their totals -> Cage (distinct + sum); each of the three cages
// here also lies wholly inside one row or column, so its AllDifferent
// clause is redundant with the base sudoku rule, but Cage still faithfully
// states the drawn clue.
// A clue outside the grid shows the sum of the indicated diagonal ->
// LittleKiller.fromCells, which derives the class's own canonical corner
// cell from the drawn cells rather than trusting the off-grid badge
// position (the badge sits beside R8C9, but ISS's canonical start for this
// short corner diagonal is the other end, R9C8).
// "Not all markings are given" is the standard disclaimer that undrawn
// dots/X marks carry no negative information; no global negative is added.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const thermos = [
  ['R1C3', 'R2C3', 'R3C3', 'R4C3'],
  ['R6C5', 'R5C5'],
];

// Bulb first, then arm cells, per the drawn wayPoints/overlay circles.
// R1C7 and R4C9 each anchor two independent arrows.
const arrows = [
  ['R1C7', 'R1C8', 'R1C9'],
  ['R1C7', 'R2C8', 'R2C9', 'R3C8'],
  ['R1C1', 'R2C1', 'R3C1'],
  ['R6C3', 'R7C3', 'R8C3'],
  ['R7C1', 'R6C2'],
  ['R9C3', 'R9C2', 'R9C1'],
  ['R7C7', 'R6C8'],
  ['R4C9', 'R4C8', 'R4C7'],
  ['R4C9', 'R5C9', 'R6C9'],
];

// [total, ...cells], from the payload's `cages` array.
const cages = [
  [15, 'R4C1', 'R4C2'],
  [16, 'R5C7', 'R6C7', 'R7C7'],
  [12, 'R7C9', 'R8C9'],
];

const whiteDots = [
  ['R2C5', 'R3C5'],
  ['R2C2', 'R3C2'],
  ['R7C6', 'R8C6'],
];

return [
  new Shape('9x9'),

  new Given('R1C7', 9),
  new Given('R6C4', 5),

  ...thermos.map(cells => new Thermo(...cells)),
  new Renban('R4C4', 'R4C5', 'R4C6', 'R5C6'),
  ...arrows.map(cells => new Arrow(...cells)),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),

  ...whiteDots.map(cells => new WhiteDot(...cells)),
  new BlackDot('R1C4', 'R2C4'),
  new X('R8C4', 'R8C5'),

  // Outside diagonal-sum clue: value 14, ray starting at R8C9 heading
  // down-left (dRow=+1, dCol=-1), stopping at the grid edge (R9C8).
  LittleKiller.fromCells(14, graph.ray('R8C9', 1, -1), geometry),
];
