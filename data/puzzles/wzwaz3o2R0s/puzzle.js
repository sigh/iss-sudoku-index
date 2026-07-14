// Title: Killer Friends
// Author: Yawnus
// Video: https://www.youtube.com/watch?v=wzwaz3o2R0s
// Source: https://sudokupad.app/c831kufa2c

// Normal sudoku rules apply (default Shape row/col/box groups; the payload's
// drawn regions match the standard boxes).
//
// "Digits cannot repeat within a cage": no cage carries a printed total, so
// each is just AllDifferent over its cells.
//
// "For each cage, there is at least one other cage with the same digit sum":
// for every cage, an Or over every *other* cage of EqualSum(cage, other) --
// EqualSum takes cell segments directly and pins their totals equal. This is
// a direct existential match per the rule text -- it does not fix which
// other cage supplies the match, or force cages to pair up exclusively;
// three or more cages sharing one sum all satisfy each other's
// "at least one" independently.
//
// 16 cells belong to no cage; they carry no cage constraint beyond ordinary
// sudoku.

const cages = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C2', 'R2C3', 'R3C2'],
  ['R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R2C5', 'R2C7', 'R3C7'],
  ['R2C4', 'R2C6', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R4C2', 'R4C3'],
  ['R2C1', 'R3C1'],
  ['R4C1', 'R5C1', 'R5C2', 'R5C3', 'R6C1', 'R6C2', 'R6C3', 'R7C1'],
  ['R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8', 'R4C9'],
  ['R2C8', 'R3C8', 'R3C9'],
  ['R5C5', 'R5C6', 'R6C6'],
  ['R5C7', 'R5C8', 'R5C9', 'R6C7', 'R7C6', 'R7C7'],
  ['R6C8', 'R6C9'],
  ['R7C9', 'R8C7', 'R8C8', 'R8C9'],
  ['R7C5', 'R8C5'],
  ['R7C3', 'R8C3', 'R8C4', 'R9C4', 'R9C5'],
  ['R8C2', 'R9C2'],
];

const friendConstraints = cages.map((cage, i) => new Or(
  cages
    .filter((_, j) => j !== i)
    .map(other => new EqualSum(cage, other))
));

return [
  new Shape('9x9'),
  ...cages.map(cage => new AllDifferent(...cage)),
  ...friendConstraints,
];
