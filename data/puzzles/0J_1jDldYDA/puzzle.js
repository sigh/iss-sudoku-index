// Title: Crackers
// Author: Freegerator
// Video: https://www.youtube.com/watch?v=0J_1jDldYDA
// Source: https://sudokupad.app/iireaeltuf

// Blue lines have equal sums in every segment separated by a box border.
const regionSumLines = [
  ['R9C2', 'R8C2', 'R7C2', 'R6C1', 'R5C1', 'R4C1', 'R3C2', 'R2C2', 'R1C2'],
  ['R1C3', 'R2C3', 'R3C3', 'R4C4', 'R5C4', 'R6C4', 'R7C3', 'R8C3', 'R9C3'],
  ['R5C5', 'R6C5', 'R7C5'],
  ['R4C5', 'R3C5', 'R2C5'],
].map(cells => new RegionSumLine(...cells));

// The right-hand cracker is a branched line, so its connected box-segments
// are represented directly rather than forcing them into an ordered path.
const rightCracker = new EqualSum(
  ['R1C7', 'R2C7', 'R3C7'],
  ['R4C6', 'R5C6', 'R6C6'],
  ['R4C8', 'R5C8', 'R6C8'],
  ['R7C7', 'R8C7', 'R9C7'],
);

const whiteDots = [
  ['R5C2', 'R6C2'], ['R4C7', 'R5C7'], ['R1C7', 'R2C7'],
  ['R5C6', 'R6C6'], ['R2C3', 'R3C3'], ['R8C2', 'R9C2'],
  ['R4C1', 'R5C1'], ['R1C1', 'R1C2'], ['R4C8', 'R5C8'],
  ['R7C9', 'R8C9'], ['R8C8', 'R9C8'], ['R1C7', 'R1C8'],
  ['R8C5', 'R8C6'], ['R1C1', 'R2C1'], ['R5C8', 'R5C9'],
].map(cells => new WhiteDot(...cells));

const blackDots = [
  ['R4C2', 'R5C2'],
  ['R5C7', 'R6C7'],
  ['R5C4', 'R6C4'],
].map(cells => new BlackDot(...cells));

const cages = [
  new Cage(14, 'R4C5', 'R5C5', 'R6C5'),
  new Cage(16, 'R4C9', 'R5C9', 'R6C9'),
];

return [
  new Shape('9x9'),
  ...regionSumLines,
  rightCracker,
  ...whiteDots,
  ...blackDots,
  ...cages,
];
