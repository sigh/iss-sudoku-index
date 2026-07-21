// Title: Zodiac Recap: Orion's Belt
// Author: VikingPrime?
// Video: https://www.youtube.com/watch?v=q32NxasOR3Y
// Source: https://sudokupad.app/yw2eg7nhwz

// Standard 6x6 Sudoku. The six stars contain different digits, and the drawn
// Kropki dots apply without a negative constraint on unmarked pairs.
const stars = [
  'R1C5', 'R2C3', 'R3C4', 'R4C3', 'R5C2', 'R5C6',
];

const blackDots = [
  new BlackDot('R5C2', 'R5C3'),
  new BlackDot('R4C3', 'R5C3'),
  new BlackDot('R3C5', 'R3C6'),
];

const whiteDots = [
  new WhiteDot('R1C2', 'R2C2'),
  new WhiteDot('R2C5', 'R2C6'),
  new WhiteDot('R2C4', 'R2C5'),
  new WhiteDot('R6C5', 'R6C6'),
];

return [
  new Shape('6x6'),
  new AllDifferent(...stars),
  ...blackDots,
  ...whiteDots,
];
