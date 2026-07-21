// Title: XY-Cages
// Author: Philipp Blume, aka glum_hippo
// Video: https://www.youtube.com/watch?v=MNcAigXD2Cc
// Source: https://sudokupad.app/ln1b4nlbu8

// Cages have no repeated digits. A white diamond makes the absolute
// difference of its cage totals equal the row's leftmost digit or the
// column's topmost digit. A black diamond makes their ratio equal that digit.

const cages = [
  ['R3C2', 'R3C3', 'R4C2', 'R4C3'],
  ['R3C4', 'R3C5', 'R4C4', 'R5C3', 'R5C4'],
  ['R4C5', 'R4C6', 'R5C5', 'R5C6'],
  ['R5C1', 'R5C2'],
  ['R6C2', 'R6C3'],
  ['R6C1'],
  ['R7C1', 'R8C1'],
  ['R4C8', 'R5C8'],
  ['R1C5', 'R1C6', 'R1C7'],
  ['R2C5', 'R2C6', 'R2C7'],
  ['R6C6', 'R6C7', 'R6C8', 'R7C6', 'R8C5', 'R8C6'],
  ['R1C2', 'R1C3', 'R2C1', 'R2C2'],
  ['R2C3'],
  ['R8C4', 'R9C4'],
  ['R6C4', 'R6C5', 'R7C3', 'R7C4', 'R7C5'],
  ['R5C9', 'R6C9'],
  ['R7C9'],
];

// Each diamond is [colour, cell on one side, cell on the other side].
const diamonds = [
  ['black', 'R4C4', 'R4C3'],
  ['white', 'R5C2', 'R5C3'],
  ['white', 'R5C6', 'R6C6'],
  ['black', 'R4C5', 'R4C4'],
  ['white', 'R3C5', 'R2C5'],
  ['black', 'R8C5', 'R8C4'],
  ['black', 'R6C2', 'R5C2'],
  ['white', 'R6C5', 'R6C6'],
  ['white', 'R7C1', 'R6C1'],
  ['white', 'R2C6', 'R1C6'],
  ['black', 'R6C8', 'R5C8'],
  ['black', 'R1C3', 'R2C3'],
  ['black', 'R2C2', 'R3C2'],
  ['white', 'R7C9', 'R6C9'],
];

const cageAt = cell => cages.find(cage => cage.includes(cell));

function clueCell(a, b) {
  const first = parseCellId(a);
  const second = parseCellId(b);
  return first.row === second.row
    ? makeCellId(first.row, 1)
    : makeCellId(1, first.col);
}

function linearEquality(left, right) {
  const coefficients = new Map();
  const add = (term, sign) => {
    const [cell, weight] = Array.isArray(term) ? term : [term, 1];
    coefficients.set(cell, (coefficients.get(cell) || 0) + sign * weight);
  };
  left.forEach(term => add(term, 1));
  right.forEach(term => add(term, -1));

  const terms = [...coefficients].filter(([, coefficient]) => coefficient !== 0);
  if (terms.every(([, coefficient]) => Math.abs(coefficient) === 1)) {
    return new EqualSum(
      terms.filter(([, coefficient]) => coefficient === 1).map(([cell]) => cell),
      terms.filter(([, coefficient]) => coefficient === -1).map(([cell]) => cell),
    );
  }
  return new Sum(0, ...terms.map(([cell, coefficient]) => [cell, coefficient]));
}

function differenceConstraint(control, cageA, cageB) {
  return new Or([
    linearEquality(cageA, [...cageB, control]),
    linearEquality(cageB, [...cageA, control]),
  ]);
}

// The ratio's multiplier is itself a grid digit. Enumerate its nine possible
// values, then express each orientation as an exact linear equation.
function ratioConstraint(control, cageA, cageB) {
  const scaled = (cells, factor) => cells.map(cell => [cell, factor]);
  const alternatives = Array.from({ length: 9 }, (_, i) => i + 1)
    .flatMap(factor => {
      const aOverB = new And([
        new Given(control, factor),
        linearEquality(cageA, scaled(cageB, factor)),
      ]);
      if (factor === 1) return [aOverB];
      return [
        aOverB,
        new And([
          new Given(control, factor),
          linearEquality(cageB, scaled(cageA, factor)),
        ]),
      ];
    });
  return new Or(alternatives);
}

const diamondConstraints = diamonds.map(([colour, a, b]) => {
  const control = clueCell(a, b);
  const cageA = cageAt(a);
  const cageB = cageAt(b);
  return colour === 'white'
    ? differenceConstraint(control, cageA, cageB)
    : ratioConstraint(control, cageA, cageB);
});

return [
  new Shape('9x9'),
  new Given('R1C1', 1),
  new Given('R7C8', 8),
  ...cages.filter(cage => cage.length > 1)
    .map(cage => new AllDifferent(...cage)),
  ...diamondConstraints,
];
