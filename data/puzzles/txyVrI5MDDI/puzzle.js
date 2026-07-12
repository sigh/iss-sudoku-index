// Title: These Two Equal These Two
// Author: Eric Rathbun
// Video: https://www.youtube.com/watch?v=txyVrI5MDDI
// Source: https://sudokupad.app/yymnj1pfww

// Normal sudoku rules apply (rows, columns, and 3x3 boxes are the solver's
// default baseline; no custom regions are drawn).

// Six 9-cell irregular cages, no sum given: "Normal Killer Cage rules apply"
// still bars repeats within a cage even without a total, so each is an
// AllDifferent overlaid on top of the standard boxes.
const noSumCages = [
  ['R1C1', 'R1C3', 'R1C4', 'R2C1', 'R2C3', 'R2C4', 'R3C1', 'R3C2', 'R3C3'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C6', 'R2C7', 'R2C9', 'R3C6', 'R3C7', 'R3C9'],
  ['R4C1', 'R4C2', 'R4C3', 'R5C1', 'R5C3', 'R5C4', 'R6C1', 'R6C3', 'R6C4'],
  ['R4C6', 'R4C7', 'R4C9', 'R5C6', 'R5C7', 'R5C9', 'R6C7', 'R6C8', 'R6C9'],
  ['R7C7', 'R7C8', 'R7C9', 'R8C6', 'R8C7', 'R8C9', 'R9C6', 'R9C7', 'R9C9'],
  ['R7C1', 'R7C3', 'R7C4', 'R8C1', 'R8C3', 'R8C4', 'R9C1', 'R9C2', 'R9C3'],
];

// Digits separated by a white dot have a difference of one (consecutive).
// "Not all dots are given" - only the marked pairs below are constrained.
const whiteDots = [
  ['R3C1', 'R2C1'],
  ['R3C1', 'R4C1'],
  ['R4C1', 'R5C1'],
  ['R5C9', 'R6C9'],
  ['R6C9', 'R7C9'],
  ['R7C9', 'R8C9'],
  ['R6C8', 'R7C8'],
  ['R4C2', 'R3C2'],
];

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

return [
  new Shape('9x9'),

  // Little killer diagonal sums, built from the diagonal's cells (the
  // drawn corner cell / direction is off-grid, so the cell list is matched
  // against the drawn cell paths rather than typing a canonical arrowId):
  //   drawn corner R7C0, dir UR, cells R6C1..R1C6
  //   drawn corner R0C0, dir DR, cells R1C1..R9C9
  //   drawn corner R1C10, dir DL, cells R2C9..R9C2
  LittleKiller.fromCells(27, graph.ray('R6C1', -1, 1), geometry),
  LittleKiller.fromCells(45, graph.ray('R1C1', 1, 1), geometry),
  LittleKiller.fromCells(37, graph.ray('R9C2', -1, 1), geometry),

  // Killer cages with a given sum.
  new Cage(9, 'R6C6', 'R7C6'),
  new Cage(13, 'R3C4', 'R4C4'),
  new Cage(12, 'R1C5', 'R1C6'),
  new Cage(13, 'R9C4', 'R9C5'),

  // Killer cages with no given sum: distinct-only.
  ...noSumCages.map(cells => new AllDifferent(...cells)),

  // White dots: consecutive digits.
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),

  // Digits a king's move apart cannot repeat.
  new AntiKing(),
];
