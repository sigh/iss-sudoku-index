// Title: Outside the Box
// Author: Jrosas
// Video: https://www.youtube.com/watch?v=2ideCV0Ot_Q
// Source: https://app.crackingthecryptic.com/y6ivkzi761

// Rules encoded:
// - Normal 9x9 Sudoku with standard 3x3 boxes.
// - Digits increase from each thermometer bulb.
// - A circle's digit equals the number of circles containing that digit.
// - Each bold 3x3 box center equals the sum of circled digits in the
//   one-cell exterior ring touching that box, including diagonally.

// Thermometer paths, from the source-drawn bulbs to their tips.
const thermometers = [
  ['R2C6', 'R2C5', 'R1C5'],
  ['R3C9', 'R3C8', 'R3C7', 'R2C7', 'R1C7'],
  ['R9C8', 'R9C9', 'R8C9'],
  ['R9C2', 'R8C2', 'R7C2', 'R7C3'],
  ['R1C2', 'R1C3', 'R2C3', 'R3C3', 'R3C2'],
  ['R9C6', 'R8C6', 'R7C6'],
];

// Circle cells, from the source-drawn circle clues.
const circles = [
  'R2C1', 'R1C4', 'R3C6', 'R4C7', 'R4C9',
  'R5C6', 'R5C4', 'R4C1', 'R5C2', 'R7C4',
  'R8C5', 'R8C7', 'R6C7', 'R6C8', 'R9C9',
];

// Centers of the nine source-drawn bold 3x3 boxes.
const boxCenters = [
  'R2C2', 'R2C5', 'R2C8',
  'R5C2', 'R5C5', 'R5C8',
  'R8C2', 'R8C5', 'R8C8',
];

const exteriorCircleSum = (center) => {
  const { row: centerRow, col: centerCol } = parseCellId(center);
  const exteriorCircles = circles.filter((cell) => {
    const { row, col } = parseCellId(cell);
    const rowDistance = Math.abs(row - centerRow);
    const colDistance = Math.abs(col - centerCol);
    return Math.max(rowDistance, colDistance) === 2;
  });
  return new EqualSum(exteriorCircles, [center]);
};

return [
  new Shape('9x9'),
  ...thermometers.map(cells => new Thermo(...cells)),
  new CountingCircles(...circles),
  ...boxCenters.map(exteriorCircleSum),
];
