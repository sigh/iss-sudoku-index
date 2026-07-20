// Title: Besties 2
// Author: Jeet Sampat
// Video: https://www.youtube.com/watch?v=ZxElsPvjkqw
// Source: https://sudokupad.app/0lft1u2q32

// Standard Sudoku, anti-knight, killer cages, and a 39 little-killer diagonal.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const cages = [
  new Cage(7, 'R3C3', 'R4C3'),
  new Cage(7, 'R3C4', 'R4C4'),
  new Cage(7, 'R3C6', 'R3C7'),
  new Cage(13, 'R4C6', 'R5C6'),
  new Cage(13, 'R4C7', 'R5C7'),
  new Cage(13, 'R4C5', 'R5C5'),
  new Cage(7, 'R6C6', 'R7C6'),
  new Cage(7, 'R6C7', 'R7C7'),
  new Cage(7, 'R6C3', 'R6C4'),
  new Cage(7, 'R7C3', 'R7C4'),
  new Cage(13, 'R9C4', 'R9C5'),
  new Cage(13, 'R4C9', 'R5C9'),
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...cages,
  LittleKiller.fromCells(39, graph.ray('R1C1', 1, 1), geometry),
];
