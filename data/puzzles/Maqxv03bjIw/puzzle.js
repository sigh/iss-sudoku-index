// Title: Busy Busway
// Author: Neonesque
// Video: https://www.youtube.com/watch?v=Maqxv03bjIw
// Source: https://sudokupad.app/y1u8tow785

// Normal sudoku rules apply.
//
// Tesbus Cages: a cage cannot include every digit from another cage - in
// other words, no cage's set of digits may be a subset of another cage's
// set of digits. Digits within a single cage do not repeat.
//
// Cages carry no shown total, so within a cage the rule is a plain
// AllDifferent. The anti-subset rule is generated for every pair of cages:
// the smaller (or equal-sized) cage of the pair must contain at least one
// cell whose digit does not appear anywhere in the other cage - i.e. that
// cell differs from every cell of the other cage. For same-size cages this
// is checked once per pair, which also rules out the two cages holding an
// identical digit set.

const cages = [
  ['R4C4', 'R5C4', 'R5C5', 'R5C6', 'R6C6'],
  ['R1C5', 'R2C5'],
  ['R8C5', 'R9C5'],
  ['R2C7'],
  ['R8C1'],
  ['R4C2', 'R4C3'],
  ['R4C9', 'R5C9'],
  ['R5C8', 'R6C7', 'R6C8'],
  ['R5C1', 'R5C2', 'R6C1'],
  ['R2C8', 'R2C9'],
  ['R8C2', 'R8C3'],
];

const constraints = [
  new Shape('9x9'),
  new Given('R1C4', 3),
  new Given('R2C2', 2),
  new Given('R2C3', 1),
  new Given('R3C2', 7),
  new Given('R4C1', 3),
  new Given('R4C7', 6),
  new Given('R6C3', 4),
  new Given('R6C9', 7),
  new Given('R7C8', 2),
  new Given('R8C7', 9),
  new Given('R8C8', 8),
  new Given('R9C6', 6),
];

// Digits within a cage do not repeat.
for (const cage of cages) {
  constraints.push(new AllDifferent(...cage));
}

// "small" is not a subset of "other": some cell of "small" differs from
// every cell of "other".
function notSubsetConstraint(small, other) {
  if (small.length === 1) {
    return new AllDifferent(small[0], ...other);
  }
  return new Or(small.map(cell => new AllDifferent(cell, ...other)));
}

for (let i = 0; i < cages.length; i++) {
  for (let j = i + 1; j < cages.length; j++) {
    const a = cages[i];
    const b = cages[j];
    const [small, other] = a.length <= b.length ? [a, b] : [b, a];
    constraints.push(notSubsetConstraint(small, other));
  }
}

return constraints;
