// Title: Extragalactic
// Author: ZegreS
// Video: https://www.youtube.com/watch?v=RibOCs_eQWo
// Source: https://sudokupad.app/hrQdLRJG82

// Normal sudoku rules apply. A red dot marks the centre of R5C5; it is the
// centre of the "galaxy", an undrawn set of cells that is 180-degree
// rotationally symmetric about that point and orthogonally connected. Within a
// cage, the digits that are not part of the galaxy sum to the cage's total.
//
// The rules text says only where the total is printed ("in the cage's top left
// corner"), which is a drawing detail and not encoded. The rules state no
// no-repeat clause for cages, so the sums below are Sum, not Cage; each cage
// lies within one row, column, or box anyway, so sudoku already makes its
// digits distinct.

const IN = 1;    // the cell is part of the galaxy
const OUT = 2;   // the cell is outside the galaxy

const graph = cellGraph('9x9');
const galaxy = graph.makeOverlay('VG');

// Galaxy membership is a solver choice with exactly two states, so every
// overlay cell is restricted to those two values.
const membership = galaxy.makeReplicate(
  new Given(galaxy.cells()[0], IN, OUT));

// Rotational symmetry about the R5C5 dot: RrCc and R(10-r)C(10-c) are on the
// same side of the galaxy boundary. Rotating the board by 180 degrees reverses
// a reading-order list, so the pairs are the nth overlay cell with the nth from
// the end; the 41st cell is R5C5, its own image.
const overlayCells = galaxy.cells();
const symmetry = overlayCells.slice(0, 40).map(
  (cell, i) => new SameValues(2, cell, overlayCells[80 - i]));

// Cage cells and totals, transcribed from the drawn cage outlines and their
// printed totals.
const cages = [
  [4, ['R5C6', 'R6C6']], [3, ['R4C4', 'R5C4']],
  [5, ['R4C5', 'R4C6']], [6, ['R6C4', 'R6C5']],
  [7, ['R4C8', 'R4C9']], [7, ['R6C8', 'R6C9']],
  [16, ['R7C6', 'R8C6', 'R9C6']], [16, ['R1C4', 'R2C4', 'R3C4']],
  [6, ['R1C6', 'R2C6']], [6, ['R8C4', 'R9C4']],
  [8, ['R4C3', 'R5C2', 'R5C3', 'R6C3']],
  [7, ['R4C7', 'R5C7', 'R5C8', 'R6C7']],
  [17, ['R7C5', 'R8C5', 'R9C5']], [7, ['R1C5', 'R2C5', 'R3C5']],
  [7, ['R4C1', 'R4C2']], [7, ['R6C1', 'R6C2']],
  [7, ['R2C9', 'R3C9']], [6, ['R7C7', 'R7C8', 'R8C8']],
  [8, ['R2C2', 'R3C2', 'R3C3']], [9, ['R7C9', 'R8C9']],
  [3, ['R2C1', 'R3C1']], [14, ['R8C2', 'R9C1', 'R9C2']],
  [7, ['R1C8', 'R1C9', 'R2C8']], [8, ['R7C1', 'R8C1']],
  [0, ['R5C5']],
];

// Which cells of a cage lie outside the galaxy is itself unknown, so a cage is
// the disjunction over the subsets that could be the outside ones: each branch
// pins every cell of the cage IN or OUT and sums the OUT cells. A subset of m
// cells carries m digits from 1-9, so its sum lies in [m, 9m] and subsets
// outside that range for the clue are dropped. The 0 on R5C5 leaves only the
// empty subset, which is the branch putting the centre cell in the galaxy.
const cageRules = cages.map(([total, cells]) => new Or(
  [...Array(1 << cells.length).keys()].flatMap(subset => {
    const outside = cells.filter((_, i) => subset >> i & 1);
    if (total < outside.length || total > 9 * outside.length) return [];
    return [new And([
      ...cells.map((cell, i) => new Given(
        galaxy.at(cell), (subset >> i & 1) ? OUT : IN)),
      ...(outside.length ? [new Sum(total, ...outside)] : []),
    ])];
  })));

return [
  new Shape('9x9'),
  galaxy.toVar('galaxy'),
  membership,
  new ConnectedValues('VG', IN),
  ...symmetry,
  ...cageRules,
];
