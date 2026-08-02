// Title: 9/4/2023: 6x6 Killer
// Author: ???
// Video: https://www.youtube.com/watch?v=Mmz5bSZWA-s
// Source: http://tinyurl.com/e8y2vnw4

// Normal 6x6 Sudoku uses the default 2x3 regions. Each listed killer cage has
// distinct digits summing to its drawn total.
return [
  new Shape('6x6'),
  // Killer cages transcribed from the drawn totals and cells.
  new Cage(4, 'R2C5', 'R3C5'),
  new Cage(11, 'R4C2', 'R5C2'),
  new Cage(10, 'R4C4', 'R5C4'),
  new Cage(3, 'R2C3', 'R3C3'),
  new Cage(5, 'R4C5', 'R4C6'),
  new Cage(9, 'R3C1', 'R3C2'),
];
