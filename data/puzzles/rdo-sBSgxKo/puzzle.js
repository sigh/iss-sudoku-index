// Title: 8/9/1990
// Author: shady moon
// Video: https://www.youtube.com/watch?v=rdo-sBSgxKo
// Source: https://sudokupad.app/e3zml763km

// Box borders split the closed blue loop into six equal-sum segments. The
// starting point is a box boundary, so each cell appears once in path order.
const blueLine = [
  'R7C4', 'R8C5', 'R7C6',
  'R6C7', 'R5C8', 'R4C8',
  'R3C8', 'R2C7',
  'R2C6', 'R3C5', 'R2C4',
  'R2C3', 'R3C2',
  'R4C2', 'R5C2', 'R6C3',
];

const pinkLine = [
  'R7C5', 'R6C6', 'R5C7', 'R4C7', 'R3C7', 'R3C6',
  'R4C5', 'R3C4', 'R3C3', 'R4C3', 'R5C3', 'R6C4',
];

return [
  new Shape('9x9'),
  new Given('R2C9', 3),
  new Given('R4C4', 3),
  new Given('R5C4', 5),
  new Given('R8C9', 5),

  new RegionSumLine(...blueLine),
  new Sum(89, ...blueLine, ...pinkLine),

  new BlackDot('R5C1', 'R6C1'),
  new BlackDot('R1C5', 'R1C6'),
  new BlackDot('R8C2', 'R8C3'),
];
