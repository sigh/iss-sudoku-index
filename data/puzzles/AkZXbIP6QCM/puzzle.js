// Title: Disco floor
// Author: Olof Helleblad Johnson
// Video: https://www.youtube.com/watch?v=AkZXbIP6QCM
// Source: https://sudokupad.app/jeu4qiw80c

// Each line's auxiliary value is its difference plus one. This maps the
// possible differences 0-8 onto the ordinary 1-9 value range.
const lines = [
  ['R8C4', 'R9C4', 'R9C5', 'R8C5', 'R7C6', 'R7C5'],
  ['R8C1', 'R9C1'],
  ['R6C3', 'R7C3'],
  ['R6C1', 'R5C1', 'R4C1'],
  ['R3C2', 'R4C3', 'R5C4'],
  ['R3C5', 'R3C6', 'R3C7', 'R4C7', 'R4C6'],
  ['R5C7', 'R6C8', 'R7C8', 'R8C9'],
  ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'],
  ['R1C2', 'R2C1'],
];

const differences = new Var('D', 'line differences', lines.length);

// For adjacent digits a and b and encoded difference d, one of
// a - b - d = -1 or b - a - d = -1 must hold.
const differenceConstraint = (difference, a, b) => new Or([
  new Sum(-1, a, [b, -1], [difference, -1]),
  new Sum(-1, b, [a, -1], [difference, -1]),
]);

const lineConstraints = lines.flatMap((line, lineIndex) => {
  const difference = differences.cell(lineIndex + 1);
  return line.slice(1).map((cell, i) =>
    differenceConstraint(difference, line[i], cell));
});

return [
  new Shape('9x9'),
  new Given('R2C3', 6),
  differences,
  new AllDifferent(...differences.cells()),
  ...lineConstraints,
];
