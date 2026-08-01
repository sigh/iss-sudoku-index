// Title: Hypertension
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=3BpWRA6dtug
// Source: https://sudokupad.app/ucrlbqbg94

// Normal Sudoku rules apply. Each silent killer cage is all-different and
// sums to the cell diagonally northwest of its northwest cage cell. Each
// arrowed cell equals the sum of the digits on its indicated diagonal.
const silentKillers = [
  { cage: ['R4C6', 'R5C6'], clue: 'R3C5' },
  { cage: ['R6C3', 'R7C3', 'R7C4'], clue: 'R5C2' },
  { cage: ['R2C3', 'R2C4', 'R3C3'], clue: 'R1C2' },
  { cage: ['R4C4'], clue: 'R3C3' },
  { cage: ['R2C7', 'R3C7'], clue: 'R1C6' },
  { cage: ['R9C7', 'R9C8', 'R9C9'], clue: 'R8C6' },
  { cage: ['R5C8', 'R6C8'], clue: 'R4C7' },
];

// Arrow geometry transcribed from the five drawn arrowheads.
const silentLittleKillers = [
  { clue: 'R4C8', diagonal: ['R3C7', 'R2C6', 'R1C5'] },
  { clue: 'R4C8', diagonal: ['R3C9'] },
  { clue: 'R7C9', diagonal: ['R6C8', 'R5C7', 'R4C6', 'R3C5', 'R2C4', 'R1C3'] },
  { clue: 'R9C4', diagonal: ['R8C3', 'R7C2', 'R6C1'] },
  { clue: 'R4C5', diagonal: ['R5C4', 'R6C3', 'R7C2', 'R8C1'] },
];

return [
  new Shape('9x9'),
  ...silentKillers.flatMap(({ cage, clue }) => [
    new AllDifferent(...cage),
    new EqualSum(cage, [clue]),
  ]),
  ...silentLittleKillers.map(({ clue, diagonal }) =>
    new EqualSum(diagonal, [clue])),
];
