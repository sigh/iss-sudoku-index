// Title: Nevermore... Than Four
// Author: Xeonrisq
// Video: https://www.youtube.com/watch?v=YG3ErIMuiuA
// Source: https://app.crackingthecryptic.com/sudoku/mhHB7J4P4p

// Normal sudoku rules (given regions are the standard 3x3 boxes). Each arrow's
// arm sums to the digit in its circle. Each outside clue gives the sum along
// the drawn diagonal (repeats allowed there). Each cage is all-different, and
// all four cages share one (unstated) common total, tied here with EqualSum.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Cages: four 2x2 blocks in the top-right quadrant, transcribed from the
// puzzle's drawn cage outlines.
const cageA = ['R1C6', 'R2C6', 'R1C7', 'R2C7'];
const cageB = ['R1C8', 'R2C8', 'R2C9', 'R1C9'];
const cageC = ['R3C6', 'R3C7', 'R4C6', 'R4C7'];
const cageD = ['R3C8', 'R3C9', 'R4C8', 'R4C9'];

return [
  new Shape('9x9'),
  new Given('R1C1', 6),
  new Given('R9C9', 9),

  // Arrows: circle cell first, then arm cells (catalog convention). The bulb
  // at R6C4 carries two separate arrows (one left along row 6, one down
  // column 4), transcribed from the drawn arrow paths.
  new Arrow('R5C1', 'R5C2', 'R5C3', 'R5C4'),
  new Arrow('R6C4', 'R6C3', 'R6C2', 'R6C1'),
  new Arrow('R6C4', 'R7C4', 'R8C4', 'R9C4'),
  new Arrow('R9C5', 'R8C5', 'R7C5', 'R6C5'),

  // Outside diagonal-sum clues. Each drawn off-grid ray fixes which of the
  // two candidate diagonals for its lane the printed total applies to.
  LittleKiller.fromCells(27, graph.ray('R6C1', 1, 1), geometry),
  LittleKiller.fromCells(20, graph.ray('R1C6', 1, 1), geometry),
  LittleKiller.fromCells(14, graph.ray('R1C8', 1, 1), geometry),
  LittleKiller.fromCells(20, graph.ray('R3C9', 1, -1), geometry),

  // Cages: all-different only (no printed total), plus the shared-total rule
  // tying all four cages to one common (unstated) sum.
  new AllDifferent(...cageA),
  new AllDifferent(...cageB),
  new AllDifferent(...cageC),
  new AllDifferent(...cageD),
  new EqualSum(cageA, cageB, cageC, cageD),
];
