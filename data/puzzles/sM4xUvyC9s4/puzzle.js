// Title: Caged Clones
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=sM4xUvyC9s4
// Source: https://sudokupad.app/0yr8dzgjd8

// Normal sudoku rules apply. Every cage's digit pattern occurs, translated
// without rotation or reflection, somewhere in box 9. The five x cages have
// one common total. Each gray dot is consecutive or ratio 1:2; dots are not
// negative constraints.

const horizontalCages = [
  ['R6C8', 'R6C9'],
  ['R6C1', 'R6C2'],
  ['R1C4', 'R1C5'],
];

const verticalCages = [
  ['R7C6', 'R8C6'],
  ['R1C6', 'R2C6'],
  ['R4C1', 'R5C1'],
  ['R8C2', 'R9C2'],
];

const lCages = [
  ['R4C4', 'R4C5', 'R5C4'],
  ['R2C2', 'R2C3', 'R3C2'],
];

const horizontalPlacements = [
  ['R7C7', 'R7C8'], ['R7C8', 'R7C9'],
  ['R8C7', 'R8C8'], ['R8C8', 'R8C9'],
  ['R9C7', 'R9C8'], ['R9C8', 'R9C9'],
];

const verticalPlacements = [
  ['R7C7', 'R8C7'], ['R7C8', 'R8C8'], ['R7C9', 'R8C9'],
  ['R8C7', 'R9C7'], ['R8C8', 'R9C8'], ['R8C9', 'R9C9'],
];

const lPlacements = [
  ['R7C7', 'R7C8', 'R8C7'],
  ['R7C8', 'R7C9', 'R8C8'],
  ['R8C7', 'R8C8', 'R9C7'],
  ['R8C8', 'R8C9', 'R9C8'],
];

function cloneSomewhere(cage, placements) {
  return new Or(placements.map(placement => new And(
    cage.map((cell, i) => new SameValues(2, cell, placement[i])))));
}

const cloneRules = [
  ...horizontalCages.map(cage => cloneSomewhere(cage, horizontalPlacements)),
  ...verticalCages.map(cage => cloneSomewhere(cage, verticalPlacements)),
  ...lCages.map(cage => cloneSomewhere(cage, lPlacements)),
];

const xCages = [
  ['R6C8', 'R6C9'],
  ['R6C1', 'R6C2'],
  ['R7C6', 'R8C6'],
  ['R1C6', 'R2C6'],
  ['R2C2', 'R2C3', 'R3C2'],
];

const grayDots = [
  ['R8C3', 'R8C4'],
  ['R4C2', 'R4C3'],
  ['R2C7', 'R3C7'],
];

const dotRules = grayDots.map(([a, b]) => new Or([
  new WhiteDot(a, b),
  new BlackDot(a, b),
]));

return [
  new Shape('9x9'),
  ...cloneRules,
  new EqualSum(...xCages),
  ...dotRules,
];
