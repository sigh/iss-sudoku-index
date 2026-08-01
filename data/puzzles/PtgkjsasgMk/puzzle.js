// Title: Reliably unreliable
// Author: sujoyku
// Video: https://www.youtube.com/watch?v=PtgkjsasgMk
// Source: https://sudokupad.app/4HQfd437LD

// Rules encoded: irregular 7x7 Sudoku (rows, columns, and the seven drawn
// regions contain 1-7 once); each drawn Rellik Cage has distinct digits and no
// non-empty subset summing to its printed top-left value.
// The region and cage cell lists are transcribed from the drawn SudokuPad data.
return [
  new Shape('7x7'),
  new NoBoxes(),
  new Jigsaw('7x7', 'R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R3C1', 'R3C2'),
  new Jigsaw('7x7', 'R1C4', 'R1C5', 'R2C3', 'R2C4', 'R2C5', 'R3C3', 'R3C4'),
  new Jigsaw('7x7', 'R1C6', 'R1C7', 'R2C6', 'R2C7', 'R3C7', 'R4C6', 'R4C7'),
  new Jigsaw('7x7', 'R3C5', 'R3C6', 'R4C3', 'R4C4', 'R4C5', 'R5C2', 'R5C3'),
  new Jigsaw('7x7', 'R5C4', 'R5C5', 'R6C3', 'R6C4', 'R6C5', 'R7C3', 'R7C4'),
  new Jigsaw('7x7', 'R4C1', 'R4C2', 'R5C1', 'R6C1', 'R6C2', 'R7C1', 'R7C2'),
  new Jigsaw('7x7', 'R5C6', 'R5C7', 'R6C6', 'R6C7', 'R7C5', 'R7C6', 'R7C7'),
  new RellikCage(11, 'R1C1', 'R1C2', 'R1C3', 'R2C1'),
  new RellikCage(6, 'R2C2', 'R3C1', 'R3C2'),
  new RellikCage(8, 'R6C6', 'R7C5', 'R7C6'),
  new RellikCage(9, 'R5C6', 'R5C7', 'R6C7', 'R7C7'),
  new RellikCage(7, 'R4C3', 'R5C2', 'R5C3'),
  new RellikCage(8, 'R3C5', 'R3C6', 'R4C4', 'R4C5'),
  new RellikCage(8, 'R1C4', 'R1C5', 'R2C4', 'R2C5'),
  new RellikCage(10, 'R6C3', 'R6C4', 'R7C3', 'R7C4'),
  new RellikCage(11, 'R4C1', 'R5C1', 'R6C1'),
];
