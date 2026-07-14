// Title: Simple as AB
// Author: Nicolas Duhail
// Video: https://www.youtube.com/watch?v=nsAmm8e6CfY
// Source: https://sudokupad.app/7aatbjdjz8

// Normal sudoku rules apply.
// Clues outside the grid indicate the sum of the first X digits, where X is
// the first seen digit (reading into the grid from that clue). Every clue
// marked A shares one common, solver-determined total; every clue marked B
// shares another common, solver-determined total.
// Any three adjacent digits along a teal modular line have different
// residues modulo 3 (one digit from {1,4,7}, one from {2,5,8}, one from
// {3,6,9}).

// A shared total (A or B) ranges 1-45, wider than the grid's 1-9 and wider
// than the solver's 16-value ceiling, so each total is split into a tens Var
// (domain 1-5, representing digit 0-4) and a ones Var (domain 1-10,
// representing digit 0-9): total = 10*(tens-1) + (ones-1).
const graph = cellGraph('9x9');

// "Sum of the first X cells equals the shared total" (X = the line's own
// first digit) is a variable-length sum, so it is expressed as a 9-way
// branch: for each possible X, one branch forces the first cell to X (the
// branch selector) and requires the first X cells to equal
// 10*(tens-1) + (ones-1), i.e. firstXcells - 10*tens - ones = -11.
const xSumConstraint = (cells, tensCell, onesCell) => new Or(
  [1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => new And([
    new Given(cells[0], x),
    new Sum(-11, ...cells.slice(0, x), [tensCell, -10], [onesCell, -1]),
  ])));

const rev = (cells) => [...cells].reverse();

// Reading order into the grid from each labelled outside clue.
const aLines = [
  graph.row('R5C1'),            // left of row 5, reading right
  rev(graph.row('R5C1')),       // right of row 5, reading left
  graph.column('R1C7'),         // above column 7, reading down
  graph.column('R1C4'),         // above column 4, reading down
  rev(graph.row('R9C1')),       // right of row 9, reading left
  rev(graph.column('R1C2')),    // below column 2, reading up
];

const bLines = [
  rev(graph.column('R1C5')),    // below column 5, reading up
  rev(graph.column('R1C4')),    // below column 4, reading up
  rev(graph.column('R1C8')),    // below column 8, reading up
  graph.row('R2C1'),            // left of row 2, reading right
  rev(graph.row('R2C1')),       // right of row 2, reading left
  rev(graph.row('R4C1')),       // right of row 4, reading left
];

const xSumConstraints = (lines, tensCell, onesCell) =>
  lines.map(cells => xSumConstraint(cells, tensCell, onesCell));

return [
  new Shape('9x9', 10),
  graph.makeReplicate(
    new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),

  new Var('AT', 'A tens', 1),
  new Var('AO', 'A ones', 1),
  new Var('BT', 'B tens', 1),
  new Var('BO', 'B ones', 1),
  new Given('VAT', 1, 2, 3, 4, 5),
  new Given('VBT', 1, 2, 3, 4, 5),
  ...xSumConstraints(aLines, 'VAT', 'VAO'),
  ...xSumConstraints(bLines, 'VBT', 'VBO'),

  new Modular(3, 'R1C4', 'R1C5', 'R1C6', 'R1C7'),
  new Modular(3, 'R2C9', 'R3C9', 'R4C9', 'R5C9'),
  new Modular(3, 'R2C1', 'R3C1', 'R4C1', 'R5C1'),
];
