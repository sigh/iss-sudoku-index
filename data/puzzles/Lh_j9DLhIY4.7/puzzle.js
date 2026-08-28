// Title: April 2, 2022: Opheodrys
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=Lh_j9DLhIY4
// Source: https://tinyurl.com/4wsut7nd
//
// Normal sudoku rules apply. Digits in cells directly connected by a green
// line must differ by at least 5, i.e. each line is a Whisper(5) path.
// Each of the six lines is an open 7-edge path over 8 of a box's 9 cells,
// drawn as shown below. None of the six lines repeats its first cell at
// the end, so each is a genuinely open path -- no wrap-around edge closes
// it back to its start. Boxes 1, 7, 9 have no line.

const lineCells = [
  // box 2 (R1-3,C4-6): skips R1C6
  ['R1C5', 'R2C5', 'R2C6', 'R3C6', 'R3C5', 'R3C4', 'R2C4', 'R1C4'],
  // box 3 (R1-3,C7-9): skips R3C9
  ['R3C7', 'R3C8', 'R2C8', 'R2C7', 'R1C7', 'R1C8', 'R1C9', 'R2C9'],
  // box 4 (R4-6,C1-3): skips R6C3
  ['R5C2', 'R6C2', 'R6C1', 'R5C1', 'R4C1', 'R4C2', 'R4C3', 'R5C3'],
  // box 5 (R4-6,C4-6): skips R5C5 (the box centre)
  ['R4C4', 'R5C4', 'R6C4', 'R6C5', 'R6C6', 'R5C6', 'R4C6', 'R4C5'],
  // box 6 (R4-6,C7-9): skips R4C7
  ['R6C9', 'R5C9', 'R4C9', 'R4C8', 'R5C8', 'R5C7', 'R6C7', 'R6C8'],
  // box 8 (R7-9,C4-6): skips R9C4
  ['R9C6', 'R9C5', 'R8C5', 'R8C4', 'R7C4', 'R7C5', 'R7C6', 'R8C6'],
];

const whispers = lineCells.map((cells) => new Whisper(5, ...cells));

return [
  new Shape('9x9'),
  new Given('R9C1', 6),
  ...whispers,
];
