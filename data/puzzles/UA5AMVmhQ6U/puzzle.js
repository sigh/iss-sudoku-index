// Title: Ramify
// Author: dumediat
// Video: https://www.youtube.com/watch?v=UA5AMVmhQ6U
// Source: https://sudokupad.app/272yz2ohf1

// Standard Sudoku, four killer cages, and ten sandwich clues.
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

const killerCages = [
  new Cage(11, 'R3C3', 'R4C3', 'R4C4'),
  new Cage(20, 'R6C6', 'R6C7', 'R7C7'),
  new Cage(22, 'R3C6', 'R3C7', 'R4C6', 'R4C7'),
  new Cage(18, 'R6C4', 'R7C3', 'R7C4'),
];

const sandwichClues = [
  Sandwich.fromCells(6, graph.row(1), geometry),
  Sandwich.fromCells(32, graph.row(2), geometry),
  Sandwich.fromCells(15, graph.row(4), geometry),
  Sandwich.fromCells(14, graph.row(6), geometry),
  Sandwich.fromCells(20, graph.row(8), geometry),
  Sandwich.fromCells(24, graph.row(9), geometry),
  Sandwich.fromCells(33, graph.column(2), geometry),
  Sandwich.fromCells(22, graph.column(3), geometry),
  Sandwich.fromCells(25, graph.column(7), geometry),
  Sandwich.fromCells(31, graph.column(8), geometry),
];

return [
  new Shape('9x9'),
  ...killerCages,
  ...sandwichClues,
];
