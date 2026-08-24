// Title: The Holy Trinity
// Author: James Peter
// Video: https://www.youtube.com/watch?v=WUPnU8u1AEY
// Source: https://app.crackingthecryptic.com/sudoku/tt23hgFmr6

// Rules: Normal sudoku rules apply. Cages cannot contain repeated digits, and
// their sum may be given. Clues outside the grid show sums of the indicated
// diagonals, in which digits can repeat. Digits along arrows sum to the
// number in the circle.
//
// Omission: the puzzle is shaded in two colours (a "trinity" motif); the
// video also links a "Colourless version" of the same puzzle, so the shading
// is decorative only and carries no rule.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Four no-total cages (all-different only): drawn as a pinwheel of bent
// 9-cell paths (source: the four undrawn-total cage shapes).
const noTotalCages = [
  ['R1C5', 'R1C4', 'R2C4', 'R3C4', 'R4C4', 'R4C3', 'R4C2', 'R4C1', 'R5C1'],
  ['R5C9', 'R6C9', 'R6C8', 'R6C7', 'R6C6', 'R7C6', 'R8C6', 'R9C6', 'R9C5'],
  ['R2C5', 'R1C6', 'R2C6', 'R3C6', 'R4C6', 'R4C7', 'R4C8', 'R5C8', 'R4C9'],
  ['R5C2', 'R6C1', 'R6C2', 'R6C3', 'R6C4', 'R7C4', 'R8C4', 'R9C4', 'R8C5'],
];

// Two totalled plus-pentomino cages.
const totalledCages = [
  [23, 'R1C2', 'R2C1', 'R2C2', 'R2C3', 'R3C2'],
  [25, 'R7C8', 'R8C7', 'R8C8', 'R8C9', 'R9C8'],
];

// Four outside-diagonal ("Little Killer") clues. Each drawn arrow passes
// through one on-grid corner cell, disambiguating which of the two possible
// diagonals through that corner it reads.
const littleKillers = [
  [19, graph.ray('R5C1', 1, 1)],
  [18, graph.ray('R9C5', -1, 1)],
  [12, graph.ray('R5C9', -1, -1)],
  [21, graph.ray('R1C5', 1, -1)],
];

// Eight arrows: bulb cell first, then arm cells (matched to the blank
// circle overlay drawn at each bulb cell).
const arrows = [
  ['R3C5', 'R2C4', 'R1C5', 'R2C6'],
  ['R5C3', 'R4C2', 'R5C1', 'R6C2'],
  ['R7C5', 'R8C6', 'R9C5', 'R8C4'],
  ['R5C7', 'R6C8', 'R5C9', 'R4C8'],
  ['R4C6', 'R3C7'],
  ['R4C4', 'R3C3'],
  ['R6C4', 'R7C3'],
  ['R6C6', 'R7C7'],
];

return [
  new Shape('9x9'),

  ...noTotalCages.map(cells => new AllDifferent(...cells)),
  ...totalledCages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...littleKillers.map(([sum, cells]) =>
    LittleKiller.fromCells(sum, cells, geometry)),
  ...arrows.map(cells => new Arrow(...cells)),
];
