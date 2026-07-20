// Title: Golden Palindromes
// Author: MathGuy_12
// Video: https://www.youtube.com/watch?v=vwA_VIz_tfk
// Source: https://sudokupad.app/20prr0i65d

// Normal sudoku rules apply.
// Outside clues give diagonal sums, with repeats allowed.
// Killer cages are distinct and sum to their clues.
// Golden lines are palindromes; each circled center also equals both endpoints.
const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

const palindromeLines = [
  ['R1C4', 'R2C4', 'R1C3', 'R2C3', 'R3C2', 'R4C1', 'R4C2', 'R3C3', 'R4C3'],
  ['R6C1', 'R6C2', 'R7C1', 'R7C2', 'R8C3', 'R9C4', 'R8C4', 'R7C3', 'R7C4'],
  ['R9C6', 'R8C6', 'R9C7', 'R8C7', 'R7C8', 'R6C9', 'R6C8', 'R7C7', 'R6C7'],
  ['R4C9', 'R4C8', 'R3C9', 'R3C8', 'R2C7', 'R1C6', 'R2C6', 'R3C7', 'R3C6'],
];

return [
  new Shape('9x9'),

  // Little Killer diagonal sums.
  LittleKiller.fromCells(22, graph.ray('R1C4', 1, -1), geometry),
  LittleKiller.fromCells(22, graph.ray('R6C1', 1, 1), geometry),
  LittleKiller.fromCells(22, graph.ray('R9C6', -1, 1), geometry),
  LittleKiller.fromCells(22, graph.ray('R4C9', -1, -1), geometry),
  LittleKiller.fromCells(11, graph.ray('R1C2', 1, -1), geometry),
  LittleKiller.fromCells(11, graph.ray('R8C1', 1, 1), geometry),
  LittleKiller.fromCells(11, graph.ray('R9C8', -1, 1), geometry),
  LittleKiller.fromCells(11, graph.ray('R2C9', -1, -1), geometry),

  // Killer cages.
  new Cage(22, 'R1C1', 'R1C2', 'R2C1', 'R2C2'),
  new Cage(22, 'R1C8', 'R1C9', 'R2C8', 'R2C9'),
  new Cage(22, 'R8C1', 'R8C2', 'R9C1', 'R9C2'),
  new Cage(22, 'R8C8', 'R8C9', 'R9C8', 'R9C9'),
  new Cage(19, 'R7C5', 'R7C6', 'R7C7'),
  new Cage(20, 'R3C7', 'R4C7', 'R5C7'),
  new Cage(18, 'R3C3', 'R3C4', 'R3C5'),
  new Cage(17, 'R5C3', 'R6C3', 'R7C3'),

  // Palindromes and the additional center-equals-ends rule.
  ...palindromeLines.map(cells => new Palindrome(...cells)),
  ...palindromeLines.map(cells => new SameValues(3, cells[0], cells[4], cells[8])),
];
