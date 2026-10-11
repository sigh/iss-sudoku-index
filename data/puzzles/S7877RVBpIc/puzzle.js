// Title: Wedding Day
// Author: Jack Isaac Bryan
// Video: https://www.youtube.com/watch?v=S7877RVBpIc
// Source: https://sudokupad.app/q6e8matn0v

// Normal Sudoku, cage totals, green and orange whispers, the white dot,
// and the Bride's digit repeated opposite Jack at the altar.
// The pews flank column 5; J is R2C6, so opposite J across that aisle is R2C4.
// The A marker at R8C5 supplies the digit for that reflected position.
// Drawn green pew and altar lines.
const greenLines = [
  ['R1C8', 'R1C9'],
  ['R5C6', 'R5C7', 'R5C8', 'R5C9'],
  ['R7C6', 'R7C7', 'R7C8', 'R7C9'],
  ['R6C4', 'R6C3', 'R6C2', 'R6C1'],
  ['R8C2', 'R8C3'],
  ['R4C4', 'R4C3', 'R4C2', 'R4C1'],
];
// Drawn orange pew and altar lines.
const orangeLines = [
  ['R4C6', 'R4C7', 'R4C8', 'R4C9'],
  ['R6C6', 'R6C7', 'R6C8', 'R6C9'],
  ['R8C7', 'R8C8'],
  ['R7C4', 'R7C3', 'R7C2', 'R7C1'],
  ['R5C4', 'R5C3', 'R5C2', 'R5C1'],
  ['R1C1', 'R1C2'],
];
return [
  new Shape('9x9'),
  // The two printed 10 cages in row 1.
  new Cage(10, 'R1C3', 'R1C4', 'R1C5'),
  new Cage(10, 'R1C6', 'R1C7'),
  ...greenLines.map(cells => new Whisper(5, ...cells)),
  ...orangeLines.map(cells => new Whisper(4, ...cells)),
  // The white dot between rows 4 and 5 in column 2.
  new WhiteDot('R4C2', 'R5C2'),
  new SameValues(2, 'R8C5', 'R2C4'),
];
