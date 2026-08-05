// Title: 11/9: Cage Against the Machine
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=VTJSpH3nGo0
// Source: https://tinyurl.com/wmrfrp8m

// Normal Sudoku rules apply. Each listed killer cage has distinct digits summing
// to its displayed total. Cage cells and totals are transcribed from the drawing.
return [
  new Shape('9x9'),
  new Cage(3, 'R1C2', 'R1C3'),
  new Cage(17, 'R9C7', 'R9C8'),
  new Cage(6, 'R1C4', 'R2C4', 'R3C4'),
  new Cage(24, 'R7C6', 'R8C6', 'R9C6'),
  new Cage(13, 'R8C9', 'R9C9'),
  new Cage(7, 'R1C1', 'R2C1'),
  new Cage(7, 'R6C6', 'R6C7', 'R6C8'),
  new Cage(23, 'R4C2', 'R4C3', 'R4C4'),
  new Cage(6, 'R6C9', 'R7C9'),
  new Cage(14, 'R3C1', 'R4C1'),
  new Cage(16, 'R1C8', 'R1C9'),
  new Cage(4, 'R9C1', 'R9C2'),
  new Cage(14, 'R7C1', 'R8C1'),
  new Cage(6, 'R2C9', 'R3C9'),
  new Cage(5, 'R4C8', 'R4C9'),
  new Cage(15, 'R6C1', 'R6C2'),
  new Cage(7, 'R6C3', 'R7C3'),
  new Cage(13, 'R3C7', 'R4C7'),
  new Cage(14, 'R8C3', 'R9C3'),
  new Cage(6, 'R1C7', 'R2C7'),
];
