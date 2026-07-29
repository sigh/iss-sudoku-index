// Title: Maximus Unique
// Author: Krushed
// Video: https://www.youtube.com/watch?v=uooKw453hIY
// Source: https://sudokupad.app/pojaazbn3z

// Normal 9x9 Sudoku; knight-move cells differ.
// White Kropki dots join consecutive digits.
// Killer cages have distinct digits totaling their drawn labels.
const CAGES = [
  [15, 'R7C2', 'R8C2'],
  [15, 'R7C8', 'R8C8'],
  [15, 'R1C4', 'R2C4'],
  [15, 'R1C6', 'R2C6'],
  [12, 'R1C7', 'R2C7'],
  [13, 'R1C3', 'R2C3'],
  [11, 'R2C1', 'R3C1'],
  [6, 'R2C9', 'R3C9'],
  [37, 'R4C1', 'R5C1', 'R5C2', 'R5C3', 'R5C4', 'R6C4'],
  [32, 'R4C9', 'R5C6', 'R5C7', 'R5C8', 'R5C9', 'R6C6'],
]; // Drawn killer cages and their top-left labels.

const DOTS = [
  ['R9C1', 'R9C2'],
  ['R9C8', 'R9C9'],
  ['R7C5', 'R8C5'],
]; // Drawn white Kropki dots.

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...CAGES.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...DOTS.map((cells) => new WhiteDot(...cells)),
];
