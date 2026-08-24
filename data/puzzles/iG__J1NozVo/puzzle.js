// Title: 777 Sudoku
// Author: JoWovrin
// Video: https://www.youtube.com/watch?v=iG__J1NozVo
// Source: https://app.crackingthecryptic.com/sudoku/BhrRNgL2Bn

// Normal sudoku rules apply (rows, columns, boxes all-different, from the
// default 9x9 Shape). Digits increase along thermometers from the bulb.
// Digits on an arrow sum to the number in the circle. A clue outside the
// grid shows the sum of the indicated diagonal. Two orthogonally
// neighbouring cells can never sum to 7 -- a global negative, so it is
// applied to every orthogonally-adjacent pair in the grid, not only pairs
// near a drawn mark.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Thermometers: bulb cell first (payload's own line-drawing order; each
// line's first waypoint carries the drawn bulb mark).
const thermos = [
  ['R3C2', 'R2C2', 'R2C3', 'R2C4', 'R3C4', 'R4C3', 'R5C2'],
  ['R4C7', 'R3C7', 'R3C8', 'R3C9', 'R4C9', 'R5C8', 'R6C7'],
  ['R7C3', 'R6C3', 'R6C4', 'R6C5', 'R7C5', 'R8C4', 'R9C3'],
].map(cells => new Thermo(...cells));

// Arrow: bulb R7C1 (white-filled circle, distinguishing it from the
// grey thermometer bulbs), arm R7C2-R8C1.
const arrow = new Arrow('R7C1', 'R7C2', 'R8C1');

// Outside diagonal-sum clue: printed "7" beyond the grid's lower-right
// corner, with a ray drawn down-left into the grid, entering at R7C9 and
// running down-left to the grid edge.
const diagonalCells = graph.ray('R7C9', 1, -1);
const littleKiller = LittleKiller.fromCells(7, diagonalCells, geometry);

// Global negative: no orthogonally-adjacent pair sums to 7. Every instance
// is a shifted copy of one of two templates (a horizontal edge, a vertical
// edge), so replicate each template over every grid position it fits.
const notSeven = Pair.fnToKey((a, b) => a + b !== 7, 9);
const horizTargets = graph.cells().filter(cell => graph.step(cell, 0, 1));
const vertTargets = graph.cells().filter(cell => graph.step(cell, 1, 0));
const antiSum7 = [
  graph.makeReplicate(
    [new Pair(notSeven, 'no orthogonal sum 7', 'R1C1', 'R1C2')], horizTargets),
  graph.makeReplicate(
    [new Pair(notSeven, 'no orthogonal sum 7', 'R1C1', 'R2C1')], vertTargets),
];

return [
  new Shape('9x9'),
  new Given('R9C9', 7),
  ...thermos,
  arrow,
  littleKiller,
  ...antiSum7,
];
