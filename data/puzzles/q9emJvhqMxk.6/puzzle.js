// Title: 10/25/22: Entropic Cages
// Author: GAS Who?
// Video: https://www.youtube.com/watch?v=q9emJvhqMxk
// Source: https://tinyurl.com/ydnh887s

// Normal 6x6 Sudoku rules apply. Cage digits are distinct; labelled cages sum
// to their displayed total. Every cage contains a low (1/2), medium (3/4), and
// high (5/6) digit. Cage cell lists are transcribed from the drawn cage outlines.
const cages = [
  ['9', ['R1C1', 'R1C2', 'R2C1']],
  ['13', ['R2C3', 'R3C3', 'R4C3', 'R5C3']],
  [null, ['R3C1', 'R3C2', 'R4C2']],
  ['15', ['R2C4', 'R3C4', 'R4C4', 'R5C4']],
  [null, ['R3C5', 'R3C6', 'R4C6']],
  ['12', ['R5C6', 'R6C5', 'R6C6']],
];

const cageConstraints = cages.flatMap(([total, cells]) => [
  total === null ? new AllDifferent(...cells) : new Cage(+total, ...cells),
  // Each category permits either of its two digits.
  new Or([
    new ContainAtLeast('1', ...cells),
    new ContainAtLeast('2', ...cells),
  ]),
  new Or([
    new ContainAtLeast('3', ...cells),
    new ContainAtLeast('4', ...cells),
  ]),
  new Or([
    new ContainAtLeast('5', ...cells),
    new ContainAtLeast('6', ...cells),
  ]),
]);

return [
  new Shape('6x6'),
  new Given('R2C5', 1),
  new Given('R5C2', 6),
  ...cageConstraints,
];
