// Title: Happy MMXXVI
// Author: olima
// Video: https://www.youtube.com/watch?v=xWkPbS7kVhU
// Source: https://sudokupad.app/swe3t7imco

// Normal sudoku rules apply; standard 3x3 boxes.
//
// Green lines are German whispers (adjacent digits differ by at least 5,
// Whisper's default difference). The first green line's drawn path revisits
// R8C7 (R7C7-R8C7-R9C8-R8C9-R7C8-R8C7), giving that cell three whisper
// neighbours; passing the whole drawn sequence to one Whisper call covers
// every drawn edge, including the revisit.
//
// Purple lines are Renban (a set of distinct consecutive digits, any order).
//
// The gray line is a palindrome.
//
// "No two cells sharing an edge contain digits summing to 5 or 10" is a
// global negative rule and no X/V marks are drawn anywhere on the grid, so
// StrictXV (which forbids sum-5/sum-10 on every unmarked adjacent pair)
// faithfully expresses it with zero marked pairs.

const whispers = [
  new Whisper(
    'R5C6', 'R4C5', 'R3C6', 'R4C7', 'R5C7', 'R6C6', 'R7C5', 'R7C6',
    'R7C7', 'R8C7', 'R9C8', 'R8C9', 'R7C8', 'R8C7'),
  new Whisper('R7C7', 'R6C7', 'R5C8', 'R6C9'),
  new Whisper(
    'R6C2', 'R5C1', 'R4C2', 'R5C3', 'R6C3', 'R7C2', 'R8C1', 'R8C2', 'R8C3'),
  new Whisper('R6C3', 'R7C4'),
];

const renbans = [
  new Renban('R2C7', 'R2C6', 'R2C5', 'R2C4', 'R2C3'),
  new Renban('R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2'),
];

return [
  new Shape('9x9'),
  ...whispers,
  ...renbans,
  new Palindrome('R5C3', 'R4C3', 'R3C4', 'R4C5', 'R5C5', 'R6C5', 'R7C4'),
  new StrictXV(),
];
