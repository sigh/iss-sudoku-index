// Title: Nonconsecutive Killer Sudoku
// Author: spxtr
// Video: https://www.youtube.com/watch?v=wO1G7GkIrWE
// Source: https://app.crackingthecryptic.com/sudoku/j3m76TrmfD

// Normal Sudoku rules apply (standard 3x3 boxes; the payload's regions array
// is the ordinary partition). Nine irregular cages carry no printed total, so
// each is all-different only. AntiConsecutive is a global rule: no two
// orthogonally adjacent cells may hold consecutive digits.

const cages = [
  // Cage A
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R3C1', 'R3C2', 'R4C1', 'R4C2'],
  // Cage B
  ['R2C3', 'R3C3', 'R4C3', 'R5C1', 'R5C2', 'R5C3', 'R6C1', 'R6C3', 'R6C4'],
  // Cage C
  ['R1C4', 'R1C5', 'R1C6', 'R2C4', 'R2C6', 'R3C4', 'R4C4', 'R5C4', 'R5C5'],
  // Cage D
  ['R2C5', 'R3C5', 'R4C5', 'R4C6', 'R5C6', 'R5C7'],
  // Cage E
  ['R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C9', 'R3C6', 'R3C7', 'R4C7'],
  // Cage F
  ['R2C8', 'R3C8', 'R3C9', 'R4C9', 'R5C9', 'R6C9'],
  // Cage G
  ['R5C8', 'R6C8', 'R7C8', 'R7C9', 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9'],
  // Cage H
  ['R6C5', 'R6C7', 'R7C5', 'R7C6', 'R7C7', 'R8C5', 'R8C7', 'R9C4', 'R9C5'],
  // Cage I (contains the given R7C4=2)
  ['R7C1', 'R7C2', 'R7C3', 'R7C4', 'R8C1', 'R8C3', 'R9C1', 'R9C3'],
];

return [
  new Shape('9x9'),
  new Given('R7C4', 2),
  new AntiConsecutive(),
  ...cages.map((cells) => new AllDifferent(...cells)),
];
