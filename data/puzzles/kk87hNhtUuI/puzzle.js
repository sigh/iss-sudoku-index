// Title: A brilli-ANT sudoku
// Author: Matt Iverson
// Video: https://www.youtube.com/watch?v=kk87hNhtUuI
// Source: https://cracking-the-cryptic.web.app/sudoku/LMGnn2bR49

// Normal sudoku rules apply (default boxes). Three grey lines are drawn as
// branching "ant" figures: a spine with a bulb at one end plus legs sticking
// out sideways at each spine cell after the bulb. As with a normal
// thermometer, values increase strictly moving away from the bulb -- here
// along every branch of the tree, not just one chain -- so each leg pair is
// encoded as two 2-cell Thermos off the shared spine cell rather than folding
// the leg into one 3-cell Thermo (which would wrongly force an order between
// the leg's own two ends). Outside clues on the alternating rows/columns are
// Sandwich sums (digits strictly between the 1 and the 9).
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const sandwiches = [
  Sandwich.fromCells(24, graph.row(1), geometry),
  Sandwich.fromCells(3, graph.row(3), geometry),
  Sandwich.fromCells(15, graph.row(5), geometry),
  Sandwich.fromCells(29, graph.row(7), geometry),
  Sandwich.fromCells(15, graph.row(9), geometry),
  Sandwich.fromCells(0, graph.column(1), geometry),
  Sandwich.fromCells(0, graph.column(3), geometry),
  Sandwich.fromCells(25, graph.column(5), geometry),
  Sandwich.fromCells(8, graph.column(7), geometry),
  Sandwich.fromCells(14, graph.column(9), geometry),
];

return [
  new Shape('9x9'),
  new Given('R1C9', 5),
  new Given('R5C2', 2),
  new Given('R9C1', 6),
  new Given('R9C8', 5),
  ...sandwiches,
  // Ant 1: bulb R1C3, spine down to R4C3, legs at R2C3/R3C3/R4C3.
  new Thermo('R1C3', 'R2C3', 'R3C3', 'R4C3'),
  new Thermo('R2C3', 'R2C2'),
  new Thermo('R2C3', 'R2C4'),
  new Thermo('R3C3', 'R3C2'),
  new Thermo('R3C3', 'R3C4'),
  new Thermo('R4C3', 'R4C2'),
  new Thermo('R4C3', 'R4C4'),
  // Ant 2: bulb R4C7, spine down to R7C7, legs at R5C7/R6C7/R7C7.
  new Thermo('R4C7', 'R5C7', 'R6C7', 'R7C7'),
  new Thermo('R5C7', 'R5C6'),
  new Thermo('R5C7', 'R5C8'),
  new Thermo('R6C7', 'R6C6'),
  new Thermo('R6C7', 'R6C8'),
  new Thermo('R7C7', 'R7C6'),
  new Thermo('R7C7', 'R7C8'),
  // Ant 3: bulb R7C3, spine down to R9C3, legs at R8C3/R9C3.
  new Thermo('R7C3', 'R8C3', 'R9C3'),
  new Thermo('R8C3', 'R8C2'),
  new Thermo('R8C3', 'R8C4'),
  new Thermo('R9C3', 'R9C2'),
  new Thermo('R9C3', 'R9C4'),
];
