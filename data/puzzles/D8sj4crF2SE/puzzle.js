// Title: 2021 Sudoku
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=D8sj4crF2SE
// Source: https://app.crackingthecryptic.com/sudoku/mmGrbpj4qD

// Normal sudoku rules apply. Digits increase along each thermometer from the
// bulb to the end. The "0" thermometer has no drawn bulb on either end, so
// its direction is left as a disjunction over both orientations. Each outside
// diagonal arrow gives the sum of the digits along the diagonal it points
// into (little-killer style); digits on that diagonal may repeat.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Thermometers: strictly increasing from the bulb (first cell) to the end.
  new Thermo('R3C1', 'R2C2', 'R3C3', 'R4C2', 'R5C1', 'R5C2', 'R5C3'),
  new Thermo('R6C9', 'R7C9', 'R8C9', 'R9C9'),
  new Thermo('R7C5', 'R6C6', 'R7C7', 'R8C6', 'R9C5', 'R9C6', 'R9C7'),

  // The "0" thermometer: neither end carries a drawn bulb, so which end is
  // the bulb is a deduction, not a decode fact -- encoded as an Or over both
  // possible directions of travel.
  new Or([
    new Thermo('R3C4', 'R2C4', 'R2C5', 'R2C6', 'R3C6', 'R4C6', 'R4C5', 'R4C4'),
    new Thermo('R4C4', 'R4C5', 'R4C6', 'R3C6', 'R2C6', 'R2C5', 'R2C4', 'R3C4'),
  ]),

  // Outside diagonal-sum arrows (little killer). Direction of each ray is
  // read from the drawn arrow stroke past the off-grid badge (down-right,
  // down-left), not assumed from which side of the grid the badge sits on.
  LittleKiller.fromCells(21, graph.ray('R5C1', 1, 1), geometry),
  LittleKiller.fromCells(21, graph.ray('R6C9', 1, -1), geometry),
];
