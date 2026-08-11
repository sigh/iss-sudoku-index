// Title: The Time Has Come To Be A Minesweeper
// Author: Thorsby
// Video: https://www.youtube.com/watch?v=Nalti0d4Q58
// Source: https://app.crackingthecryptic.com/sudoku/jDNqJNjtdG

// Normal sudoku, standard 3x3 boxes, no givens. A digit in a circled cell
// equals the count of its up-to-eight king-move neighbours holding an odd
// digit (not counting the circled cell itself). All 22 circles are white
// plain underlays (transcribed below from `underlays`, in payload order).
//
// Encoding: the grid is widened to alphabet 0-9 so a per-cell "is this
// digit odd" flag (0/1) can live alongside the real 1-9 digits; every real
// grid cell is then pinned back to 1-9 with one Replicate template stamping
// the domain over the whole grid. For each cell that is a neighbour of some
// circle, its flag is tied to its own digit's parity by
// Or(digit odd & flag=1, digit even & flag=0) -- the disjunction alone
// restricts the flag to {0,1}, no separate range constraint is needed. Each
// circled cell's rule is then EqualSum([circle], neighbourFlags): the
// circle's own digit value equals the total of its neighbours' odd-flags,
// i.e. the count of odd neighbours.

const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const allCells = graph.cells();

// Circled cells, transcribed from the drawn white-fill/black-border circles.
const circles = [
  'R1C1', 'R1C2', 'R2C3', 'R4C3', 'R5C1', 'R6C1', 'R6C2', 'R6C3', 'R7C2',
  'R8C1', 'R9C1', 'R8C3', 'R2C6', 'R3C7', 'R4C6', 'R5C7', 'R6C5', 'R7C6',
  'R7C8', 'R2C9', 'R4C9', 'R8C4',
];

// Every cell that is a king-move neighbour of at least one circle needs a
// parity flag; other cells never appear in a minesweeper sum.
const neighboursByCircle = circles.map(cell => graph.kingNeighbours(cell));
const flagCells = [...new Set(neighboursByCircle.flat())];
const flags = graph.makeOverlay('VP', flagCells);

return [
  shape,

  // Restrict the real grid back to playable sudoku digits; the widened 0-9
  // alphabet is otherwise only used by the parity-flag overlay below.
  new Replicate(
    [new Given(allCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)],
    Replicate.encodeTargetCells(allCells, allCells[0], graph),
    allCells[0],
  ),

  flags.toVar('OddFlag'),
  ...flagCells.map(cell => new Or([
    new And([new Given(cell, 1, 3, 5, 7, 9), new Given(flags.at(cell), 1)]),
    new And([new Given(cell, 2, 4, 6, 8), new Given(flags.at(cell), 0)]),
  ])),

  ...circles.map((cell, i) => new EqualSum([cell], flags.at(neighboursByCircle[i]))),
];
