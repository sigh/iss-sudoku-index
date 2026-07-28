// Title: Lightning Strikes over the City
// Author: Gerhard1963
// Video: https://www.youtube.com/watch?v=WnawFZ7JE9E
// Source: https://sudokupad.app/4keyz4eat2

// Standard 9x9 Sudoku. Killer cages are distinct and have their displayed sums.
// Skyscraper clues count visible heights from their indicated grid edge.
// The three-cell pill is read left-to-right; its arrow arm sums to that number.
const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

return [
  new Shape('9x9'),

  // Cage cells and totals transcribed from the drawn cages.
  new Cage(20, 'R1C2', 'R1C3', 'R2C2', 'R2C3'),
  new Cage(21, 'R4C5', 'R4C6', 'R5C5', 'R5C6'),
  new Cage(21, 'R5C8', 'R5C9', 'R6C8', 'R6C9'),
  new Cage(11, 'R7C4', 'R7C5', 'R8C4', 'R8C5'),
  new Cage(15, 'R8C7', 'R8C8', 'R9C7', 'R9C8'),

  Skyscraper.fromCells(6, graph.column('R1C3'), geometry),
  Skyscraper.fromCells(3, graph.row('R1C1').slice().reverse(), geometry),
  Skyscraper.fromCells(3, graph.row('R3C1'), geometry),
  Skyscraper.fromCells(6, graph.row('R4C1'), geometry),
  Skyscraper.fromCells(3, graph.column('R1C3').slice().reverse(), geometry),

  new PillArrow(3,
    'R1C5', 'R1C6', 'R1C7',
    'R2C6', 'R2C5', 'R2C4', 'R3C5', 'R4C6', 'R4C5', 'R4C4', 'R4C3',
    'R5C4', 'R5C3', 'R5C2', 'R6C3', 'R7C4', 'R7C3', 'R7C2', 'R7C1', 'R8C2'),
];
