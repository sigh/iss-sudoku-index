// Title: Coordinated Killers
// Author: Samish
// Video: https://www.youtube.com/watch?v=JqWFV5EdsPE
// Source: https://app.crackingthecryptic.com/sudoku/8H44MjMNTR
//
// Normal sudoku. 17 cages are drawn (top-left clue = the cage's number).
// Digits do not repeat within a cage regardless of reading. Each cage is
// EITHER a killer cage (digits sum to the printed clue) OR a coordinate
// cage (digits sum to the digit found in the cell the clue spells out as
// coordinates, tens digit = row, units digit = column, e.g. a clue of 12
// points at R1C2) -- which reading applies is for the solver to determine,
// so each cage is encoded as a disjunction of the two readings.

// [cells, clue, targetCell] per cage. Cell lists and clue values are
// transcribed from the drawn cages; target cells are the clue value's two
// digits read as (row, column) per the rules' own worked example.
const cages = [
  [['R2C3', 'R3C3'], 17, 'R1C7'],
  [['R1C4', 'R1C5'], 12, 'R1C2'],
  [['R1C6', 'R2C6'], 14, 'R1C4'],
  [['R1C7', 'R1C8'], 16, 'R1C6'],
  [['R3C7', 'R4C7'], 17, 'R1C7'],
  [['R3C5', 'R3C6', 'R4C6'], 21, 'R2C1'],
  [['R4C2', 'R5C2'], 14, 'R1C4'],
  [['R6C1', 'R6C2'], 14, 'R1C4'],
  [['R7C1', 'R8C1', 'R9C1'], 18, 'R1C8'],
  [['R7C2', 'R7C3'], 17, 'R1C7'],
  [['R8C2', 'R8C3', 'R9C2'], 23, 'R2C3'],
  [['R8C4', 'R8C5'], 13, 'R1C3'],
  [['R7C7', 'R7C8', 'R8C8'], 14, 'R1C4'],
  [['R7C9', 'R8C9', 'R9C9'], 12, 'R1C2'],
  [['R8C7', 'R9C7', 'R9C8'], 24, 'R2C4'],
  [['R4C3', 'R4C4', 'R5C4'], 22, 'R2C2'],
  [['R6C6', 'R6C7', 'R7C6'], 22, 'R2C2'],
];

const cageConstraints = cages.map(([cells, clue, target]) => new Or([
  // Killer reading: distinct digits summing to the printed clue.
  new Cage(clue, ...cells),
  // Coordinate reading: distinct digits summing to whatever digit is in
  // the target cell the clue spells out.
  new And([
    new AllDifferent(...cells),
    new EqualSum(cells, [target]),
  ]),
]));

return [
  new Shape('9x9'),
  ...cageConstraints,
];
