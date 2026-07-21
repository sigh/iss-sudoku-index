// Title: Thundersnow
// Author: Freegerator
// Video: https://www.youtube.com/watch?v=DQRNOwZ5Dig
// Source: https://sudokupad.app/2zpmxlxrge

// Adjacent digits on each gold lightning line differ by at least 6.
const lightningLines = [
  ['R1C3', 'R2C3', 'R3C4', 'R4C5', 'R5C4', 'R6C5', 'R7C5', 'R8C6', 'R9C6'],
  ['R9C3', 'R8C2', 'R7C2', 'R6C2', 'R5C1', 'R4C1'],
  ['R6C8', 'R5C8', 'R4C7', 'R3C7', 'R2C6', 'R1C6'],
].map(cells => new Whisper(6, ...cells));

// Every three adjacent cells on a peach line use one digit from each third.
const entropicLines = [
  ['R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R4C7', 'R3C8', 'R2C9'],
  ['R1C1', 'R2C2', 'R2C3', 'R2C4', 'R1C5'],
  ['R9C4', 'R8C5', 'R7C6', 'R7C7', 'R7C8', 'R6C9'],
  ['R8C9', 'R8C8', 'R8C7', 'R9C6'],
  ['R9C9', 'R9C8', 'R9C7'],
  ['R1C7', 'R1C8', 'R1C9'],
  ['R7C1', 'R7C2', 'R7C3', 'R7C4'],
].map(cells => new Entropic(...cells));

const whiteDots = [
  ['R6C3', 'R6C4'],
  ['R6C6', 'R6C7'],
  ['R1C9', 'R2C9'],
  ['R4C2', 'R5C2'],
  ['R2C8', 'R3C8'],
  ['R2C5', 'R3C5'],
  ['R4C9', 'R5C9'],
  ['R2C6', 'R2C7'],
  ['R9C5', 'R9C6'],
].map(cells => new WhiteDot(...cells));

const blackDots = [
  ['R1C8', 'R1C9'],
  ['R1C2', 'R1C3'],
].map(cells => new BlackDot(...cells));

return [
  new Shape('9x9'),
  ...lightningLines,
  ...entropicLines,
  ...whiteDots,
  ...blackDots,
];
