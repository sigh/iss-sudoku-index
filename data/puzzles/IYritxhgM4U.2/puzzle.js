// Title: Fortress
// Author: Unknown
// Video: https://www.youtube.com/watch?v=IYritxhgM4U
// Source: https://cracking-the-cryptic.web.app/sudoku/hHpNFJppL4
//
// Standard 9x9 sudoku (rows, columns, boxes 1-9). Twenty cells are shaded
// grey ("fortress" cells). Fortress rule (from the video description):
// wherever a grey cell and a white cell are orthogonal neighbours, the grey
// cell's digit is larger.

const graph = cellGraph('9x9');

// Grey ("fortress") cells, as shaded on the board.
const greyCells = [
  'R1C3', 'R1C7', 'R2C2', 'R2C8', 'R3C1', 'R3C9',
  'R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C6', 'R6C4', 'R6C5', 'R6C6',
  'R7C1', 'R7C9', 'R8C2', 'R8C8', 'R9C3', 'R9C7',
];
const greySet = new Set(greyCells);

// Every grey/white orthogonal edge, grey side larger. Grey-grey edges (e.g.
// R4C4-R4C5) carry no rule and are excluded.
const fortressPairs = greyCells.flatMap(grey =>
  graph.neighbours(grey)
    .filter(white => !greySet.has(white))
    .map(white => new GreaterThan(grey, white)));

return [
  new Shape('9x9'),

  // Givens, as printed on the board.
  new Given('R1C1', 8),
  new Given('R1C5', 3),
  new Given('R2C3', 3),
  new Given('R2C6', 2),
  new Given('R3C7', 1),
  new Given('R4C2', 7),
  new Given('R5C1', 4),
  new Given('R5C9', 5),
  new Given('R6C8', 8),
  new Given('R7C3', 5),
  new Given('R8C4', 5),
  new Given('R8C7', 3),
  new Given('R9C5', 8),
  new Given('R9C9', 2),

  ...fortressPairs,
];
