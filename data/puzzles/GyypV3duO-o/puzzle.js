// Title: Music Sudoku: Joy To The World
// Author: Paul Marx
// Video: https://www.youtube.com/watch?v=GyypV3duO-o
// Source: https://sudokupad.app/grtlxdmkas

// Normal sudoku rules apply (default row/column/box all-different; no digits
// are given). Three arrows: digits on the arm sum to the digit in the
// circle. Two magic squares (box 1 and box 6): each 3x3 box's three rows,
// three columns, and two diagonals all share the same total (the box's
// own all-different, from default sudoku, then forces that total to 15 --
// 45 / 3 -- without needing to state it).
//
// Music line (pink): the rules map digits 1-9 to the white piano keys c
// (1) up to d' (9) -- i.e. tonic sol-fa do=1 .. do'(an octave up)=8,
// re'=9 -- and require the line's 14 cells to hold, in order, the 14 notes
// of the first four bars of "Joy to the World" (tune Antioch). The rules
// state the line's direction is not given ("must be concluded"), so both
// traversal orders are encoded and left to solving to pick.
//
// The tune's first four bars are its first two hymn lines, "Joy to the
// world, the Lord is come; / Let earth receive her King" -- 8 + 6 = 14
// notes, matching the line's cell count. In tonic sol-fa (independently
// corroborated across transcriptions) that reads:
//   d' t l s f m r d | s l l t t d'
// i.e. scale degrees 8 7 6 5 4 3 2 1 5 6 6 7 7 8.

const musicLine = [
  'R1C6', 'R2C6', 'R3C6', 'R4C6', 'R5C6', 'R6C6', 'R7C6', 'R8C6',
  'R9C5', 'R9C4', 'R8C3', 'R7C3', 'R6C4', 'R7C5',
];
const melodyForward = [8, 7, 6, 5, 4, 3, 2, 1, 5, 6, 6, 7, 7, 8];
const melodyReverse = [...melodyForward].reverse();

const musicLineOrder = (sequence) => new And(
  musicLine.map((cell, i) => new Given(cell, sequence[i]))
);

return [
  new Shape('9x9'),

  // Arrows: bulb cell first, then arm cells (drawn as `cells`/`lines` in
  // the source arrow entries).
  new Arrow('R1C7', 'R2C8', 'R3C9', 'R4C9'),
  new Arrow('R7C9', 'R7C8', 'R7C7'),
  new Arrow('R7C1', 'R8C1', 'R9C1'),

  // Magic squares (green boxes 1 and 6, per drawn shading).
  new EqualSum(
    ['R1C1', 'R1C2', 'R1C3'], ['R2C1', 'R2C2', 'R2C3'], ['R3C1', 'R3C2', 'R3C3'],
    ['R1C1', 'R2C1', 'R3C1'], ['R1C2', 'R2C2', 'R3C2'], ['R1C3', 'R2C3', 'R3C3'],
    ['R1C1', 'R2C2', 'R3C3'], ['R1C3', 'R2C2', 'R3C1'],
  ),
  new EqualSum(
    ['R4C7', 'R4C8', 'R4C9'], ['R5C7', 'R5C8', 'R5C9'], ['R6C7', 'R6C8', 'R6C9'],
    ['R4C7', 'R5C7', 'R6C7'], ['R4C8', 'R5C8', 'R6C8'], ['R4C9', 'R5C9', 'R6C9'],
    ['R4C7', 'R5C8', 'R6C9'], ['R4C9', 'R5C8', 'R6C7'],
  ),

  // Music line: direction not given by the rules or the drawn stroke, so
  // either traversal is allowed.
  new Or([
    musicLineOrder(melodyForward),
    musicLineOrder(melodyReverse),
  ]),
];
