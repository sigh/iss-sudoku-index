// Title: Antidiagonal Thermo
// Author: Jordyn Hyde
// Video: https://www.youtube.com/watch?v=3RnIKOR7G2o
// Source: https://tinyurl.com/3cb67de8

// Normal sudoku rules apply. Along each thermometer, digits strictly
// increase from the bulb. Along each marked diagonal -- the two colored
// `line` overlays in the payload, which are exactly the full main diagonal
// and the full antidiagonal -- only three distinct digits are used among
// its nine cells.

const thermos = [
  ['R2C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R4C6'],
  ['R7C3', 'R6C4', 'R6C5', 'R6C6', 'R7C7'],
  ['R5C4', 'R5C5'],
  ['R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1'],
  ['R9C1', 'R8C2'],
  ['R7C9', 'R6C9', 'R5C9', 'R4C8', 'R3C9'],
  ['R1C9', 'R2C8'],
].map(cells => new Thermo(...cells));

const diagonals = [
  ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'],
  ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1'],
];

// One control Var per diagonal. CountDistinct ties the control cell's value
// to the number of distinct digits among the given cells; pinning the
// control to 3 caps each diagonal at three distinct digits.
const diagLimit = new Var('D', 'diagDistinctCount', 2);
const diagonalConstraints = diagonals.flatMap((cells, i) => {
  const control = diagLimit.cell(i + 1);
  return [
    new Given(control, 3),
    new CountDistinct(control, ...cells),
  ];
});

return [
  new Shape('9x9'),
  ...thermos,
  diagLimit,
  ...diagonalConstraints,
];
