// Title: March 28, 2022: Outside
// Author: clover!
// Video: https://www.youtube.com/watch?v=rZ-4REgffY8
// Source: https://tinyurl.com/4rbbh3h6

// Normal sudoku rules. Each outside clue names digits that must appear
// somewhere in the three cells of its row/column nearest the clue (the
// worked example in the rules text: row 2, columns 7-9 contains a 4 and a
// 5). Encoded with one ContainAtLeast per clue over its three nearest cells.

// [side, lane, values, cells-nearest-the-clue]
const clues = [
  ['left', 1, '1_2', ['R1C1', 'R1C2', 'R1C3']],
  ['top', 9, '1_2', ['R1C9', 'R2C9', 'R3C9']],
  ['right', 9, '1_2', ['R9C7', 'R9C8', 'R9C9']],
  ['bottom', 1, '1_2', ['R7C1', 'R8C1', 'R9C1']],
  ['top', 2, '3_4', ['R1C2', 'R2C2', 'R3C2']],
  ['right', 2, '4_5', ['R2C7', 'R2C8', 'R2C9']],
  ['bottom', 8, '5_6', ['R7C8', 'R8C8', 'R9C8']],
  ['left', 8, '6_7', ['R8C1', 'R8C2', 'R8C3']],
  ['left', 3, '5_6', ['R3C1', 'R3C2', 'R3C3']],
  ['top', 7, '6_7', ['R1C7', 'R2C7', 'R3C7']],
  ['right', 7, '7_8', ['R7C7', 'R7C8', 'R7C9']],
  ['bottom', 3, '4_5', ['R7C3', 'R8C3', 'R9C3']],
  ['top', 4, '1_3', ['R1C4', 'R2C4', 'R3C4']],
  ['left', 6, '4_5', ['R6C1', 'R6C2', 'R6C3']],
  ['right', 4, '1_7', ['R4C7', 'R4C8', 'R4C9']],
  ['bottom', 6, '2_3', ['R7C6', 'R8C6', 'R9C6']],
];

return [
  new Shape('9x9'),

  new Given('R1C5', 9),
  new Given('R5C1', 8),
  new Given('R5C9', 3),
  new Given('R9C5', 4),

  ...clues.map(([, , values, cells]) => new ContainAtLeast(values, ...cells)),
];
