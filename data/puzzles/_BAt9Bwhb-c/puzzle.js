// Title: Bricked In
// Author: Arbitrary
// Video: https://www.youtube.com/watch?v=_BAt9Bwhb-c
// Source: https://app.crackingthecryptic.com/DmdGJNbj22

// Standard Sudoku, the given 5, the one white-dot clue, and each bounded
// orange area: interior sum equals perimeter sum; boundary digits may repeat.
// The area tables are transcribed from the bounded faces of the drawn orange
// line network, with interior cells listed before their perimeter cells.
const areas = [
  [['R4C5', 'R5C6', 'R6C5'], ['R4C4', 'R3C5', 'R4C6', 'R5C7', 'R6C6', 'R7C5', 'R6C4', 'R5C5']],
  [['R5C4'], ['R4C4', 'R5C5', 'R6C4', 'R5C3']],
  [['R2C5', 'R3C4', 'R4C3'], ['R4C4', 'R5C3', 'R4C2', 'R3C3', 'R2C4', 'R1C5', 'R2C6', 'R3C5']],
  [['R7C4'], ['R6C4', 'R7C5', 'R8C4', 'R7C3']],
  [['R6C3'], ['R6C4', 'R7C3', 'R6C2', 'R5C3']],
  [['R3C6'], ['R3C5', 'R2C6', 'R3C7', 'R4C6']],
  [['R3C8', 'R4C7'], ['R4C6', 'R3C7', 'R2C8', 'R3C9', 'R4C8', 'R5C7']],
  [['R5C8', 'R6C7'], ['R5C7', 'R4C8', 'R5C9', 'R6C8', 'R7C7', 'R6C6']],
  [['R7C6'], ['R6C6', 'R7C7', 'R8C6', 'R7C5']],
  [['R2C7'], ['R2C6', 'R1C7', 'R2C8', 'R3C7']],
];

const areaSums = areas.map(([inside, perimeter]) => new EqualSum(inside, perimeter));

return [
  new Shape('9x9'),
  new Given('R5C5', 5),
  new WhiteDot('R9C2', 'R9C3'),
  ...areaSums,
];
