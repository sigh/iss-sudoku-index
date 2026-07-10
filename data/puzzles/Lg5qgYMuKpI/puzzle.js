// Title: 10X+Y
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=Lg5qgYMuKpI
// Source: https://sudokupad.app/9mthkftlh5

// Normal 6x6 sudoku rules are supplied by Shape('6x6'): rows, columns, 2x3 boxes,
// and digits 1-6. Each PillArrow starts with the two pill cells followed by the
// cells along the arrow body.
return [
  new Shape('6x6'),

  new PillArrow(2, 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6'),
  new PillArrow(2, 'R2C1', 'R2C2', 'R2C3', 'R3C3', 'R3C2', 'R3C1', 'R4C1', 'R4C2', 'R4C3'),
  new PillArrow(2, 'R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R6C6', 'R6C5', 'R6C4', 'R6C3', 'R6C2', 'R6C1'),
  new PillArrow(2, 'R4C4', 'R4C5', 'R5C6', 'R4C6', 'R3C6'),
  new PillArrow(2, 'R2C5', 'R2C6', 'R2C4', 'R3C4', 'R3C5'),
];

