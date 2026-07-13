// Title: Pinpoint
// Author: RandyDan
// Video: https://www.youtube.com/watch?v=L4BKOaUr1GE
// Source: https://sudokupad.app/6aq1xg9e6g

// German Whispers (green): adjacent digits differ by at least 5.
const germanWhisperLines = [
  ['R8C1', 'R9C1', 'R9C2', 'R8C2', 'R7C3', 'R8C4', 'R9C4', 'R9C5', 'R8C5', 'R7C6'],
  ['R2C1', 'R3C1', 'R3C2', 'R2C2', 'R1C3', 'R2C4', 'R3C4', 'R3C5', 'R2C5'],
];

// Dutch Whispers (orange): adjacent digits differ by at least 4.
const dutchWhisperLines = [
  ['R8C9', 'R7C9', 'R6C8', 'R5C7', 'R4C6', 'R4C5'],
];

// Renban Lines (purple): a non-repeating set of consecutive digits, any order.
const renbanLines = [
  ['R1C9', 'R1C8', 'R1C7', 'R1C6'],
  ['R7C8', 'R7C7', 'R6C6', 'R5C6'],
];

// Kropki dots (not all possible dots are given, so no global negative
// implication). White: consecutive. Black: one double the other.
const whiteDots = [
  ['R5C3', 'R6C3'],
  ['R3C8', 'R4C8'],
];
const blackDots = [
  ['R4C3', 'R5C3'],
  ['R5C2', 'R5C3'],
];

return [
  new Shape('9x9'),

  ...germanWhisperLines.map(cells => new Whisper(5, ...cells)),
  ...dutchWhisperLines.map(cells => new Whisper(4, ...cells)),
  ...renbanLines.map(cells => new Renban(...cells)),

  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
