// Title: Minesweeper
// Author: TalkingFredish & Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=OlcsRopfY-o
// Source: https://sudokupad.app/1ru4mm2uq3?setting-nogrid=1

// Normal 6x6 sudoku rules, standard 2x3 boxes.
//
// Minesweeper: every cell is either a mine or cleared. A cleared cell's
// digit counts the mines among its up to eight king-move neighbours; a
// mine's digit carries no such meaning. No two boxes share the same total
// mine count.
//
// Encoding: one boolean Var per cell (0 = cleared, 1 = mine), widening the
// shape's alphabet to 0-8 so the box mine-count totals (0-6) fit alongside
// the real 1-6 digits. Each cell's clear/digit relation is
// `Or(mine, And(cleared, digit-equals-neighbour-mine-count))` -- there is no
// direct way to make the digit relation conditional on the flag other than a
// disjunction. Two cells are drawn with a lighter "known cleared" highlight
// (R4C2, whose digit 1 is also given, and R5C6, whose digit is not given).

const shape = new Shape('6x6', '0-8');
const graph = cellGraph(shape);
const allCells = graph.cells();
const boxes = graph.boxes();

const flags = new Var('F', 'mine flags', allCells.length);
const flagOverlay = graph.makeOverlay('VF');

const boxCounts = new Var('B', 'box mine counts', boxes.length);

// Known-cleared cells from the art (lighter highlight square).
const knownClear = ['R4C2', 'R5C6'];

return [
  shape,
  new Given('R4C2', 1),

  // Restrict the real grid cells back to playable sudoku digits; the box
  // mine-count Vars are the only cells allowed to use the widened 0-8 range.
  ...allCells.map(cell => new Given(cell, 1, 2, 3, 4, 5, 6)),

  flags,
  ...knownClear.map(cell => new Given(flagOverlay.at(cell), 0)),

  // Per cell: either it's a mine (digit unconstrained by this rule), or it's
  // cleared and its digit equals the number of mine flags among its
  // king-move neighbours.
  ...allCells.map(cell => {
    const flag = flagOverlay.at(cell);
    const neighbourFlags = graph.kingNeighbours(cell).map(n => flagOverlay.at(n));
    return new Or([
      new Given(flag, 1),
      new And([
        new Given(flag, 0),
        new EqualSum([cell], neighbourFlags),
      ]),
    ]);
  }),

  boxCounts,
  ...boxes.map((boxCells, i) => new EqualSum(
    [boxCounts.cell(i + 1)], boxCells.map(cell => flagOverlay.at(cell)))),
  new AllDifferent(...boxCounts.cells()),
];
