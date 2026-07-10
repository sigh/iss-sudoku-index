// Title: The one and only sum
// Author: Lithium-Ion
// Video: https://www.youtube.com/watch?v=pMu4A-xNuiU
// Source: https://sudokupad.app/jl4sby2gl2

// The equal-sum rule compares the total of all cells belonging to each
// constraint type.
const blueRegionSumLine = [
  'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C4', 'R6C5', 'R6C6', 'R5C7',
];
const greenLine = ['R9C4', 'R9C5', 'R9C6', 'R8C6', 'R8C7'];
const pinkRenbanLine = ['R6C9', 'R7C9', 'R8C9', 'R9C9'];
const peachEntropicLine = ['R8C2', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R8C3'];
const orangeLine = ['R5C1', 'R4C1', 'R3C1', 'R2C2', 'R1C2'];
const grayThermo = ['R2C4', 'R3C5', 'R3C6', 'R4C6', 'R5C6', 'R5C5'];

const blackDots = [
  ['R1C3', 'R2C3'],
  ['R6C7', 'R6C8'],
  ['R4C2', 'R5C2'],
];
const whiteDots = [
  ['R2C7', 'R3C7'],
  ['R1C5', 'R1C6'],
];

return [
  new Shape('9x9'),

  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),

  new RegionSumLine(...blueRegionSumLine),
  new Whisper(5, ...greenLine),
  new Renban(...pinkRenbanLine),
  new Entropic(...peachEntropicLine),
  new Whisper(4, ...orangeLine),
  new Thermo(...grayThermo),

  new EqualSum(
    blackDots.flat(),
    whiteDots.flat(),
    greenLine,
    orangeLine,
    pinkRenbanLine,
    grayThermo,
    peachEntropicLine,
    blueRegionSumLine,
  ),
];
