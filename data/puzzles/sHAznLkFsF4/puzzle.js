// Title: Untitled
// Author: Unknown
// Video: https://www.youtube.com/watch?v=sHAznLkFsF4
// Source: https://cracking-the-cryptic.web.app/sudoku/g8LQ4RnndN

// Normal sudoku (rows, columns, boxes) plus eleven cages. Each cage is a
// one-cell-wide connected line whose printed number is the sum of the
// digits sandwiched, along the cage's own path, between its smallest digit
// and its largest digit -- encoded with Lunchbox. Digits cannot repeat in a
// cage -- an explicit AllDifferent per cage, since Lunchbox's own
// distinctness is not the constraint being cited here.

// Cage cell lists are transcribed in path order from the drawn cages.
// Path order matters for Lunchbox: "sandwiched" is read along this
// sequence. Each cage's
// consecutive cells are orthogonally adjacent, matching "each cage forms a
// line". Two cages (value 0) have their smallest and largest digits
// path-adjacent, so nothing is sandwiched between them.
const cages = [
  { value: 11, cells: ['R1C2', 'R1C1', 'R2C1', 'R3C1', 'R4C1'] },
  { value: 7, cells: ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'] },
  { value: 4, cells: ['R1C9', 'R2C9', 'R2C8', 'R3C8', 'R4C8'] },
  { value: 8, cells: ['R2C7', 'R2C6', 'R3C6', 'R4C6', 'R5C6'] },
  { value: 2, cells: ['R5C7', 'R5C8', 'R5C9'] },
  { value: 7, cells: ['R6C8', 'R6C7', 'R7C7', 'R7C6', 'R7C5', 'R8C5', 'R9C5', 'R9C6'] },
  { value: 17, cells: ['R3C5', 'R4C5', 'R5C5', 'R6C5', 'R6C6'] },
  { value: 0, cells: ['R8C4', 'R8C3', 'R9C3'] },
  { value: 0, cells: ['R8C2', 'R7C2', 'R7C1', 'R6C1'] },
  { value: 14, cells: ['R6C2', 'R6C3', 'R6C4', 'R5C4'] },
  { value: 23, cells: ['R5C2', 'R4C2', 'R3C2', 'R3C3', 'R2C3', 'R2C4'] },
];

const cageConstraints = cages.flatMap(
  ({ value, cells }) => [
    new AllDifferent(...cells),
    new Lunchbox(value, ...cells),
  ]);

return [
  new Shape('9x9'),
  ...cageConstraints,
];
