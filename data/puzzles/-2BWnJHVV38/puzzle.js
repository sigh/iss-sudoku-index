// Title: Lobster Dinner
// Author: Awedish
// Video: https://www.youtube.com/watch?v=-2BWnJHVV38
// Source: https://sudokupad.app/o7ukhot5zh

// Normal sudoku, no givens. Adjacent digits along each green line differ by
// at least 5. Digits on each orange line sum to a multiple of 3. Black dots
// mark 1:2 ratio pairs (not all dots given). Orange loops repeat their first
// cell in the raw data; the closing repeat is dropped before encoding.

const whispers = [
  ['R1C5', 'R2C4'],
  ['R2C6', 'R3C5'],
  ['R5C1', 'R4C2'],
  ['R6C2', 'R5C3'],
  ['R2C5', 'R3C4'],
  ['R5C2', 'R4C3'],
  ['R6C3', 'R5C4'],
  ['R3C6', 'R4C5'],
  ['R6C5', 'R6C6', 'R7C7', 'R7C6', 'R7C5', 'R8C6', 'R9C7', 'R9C6', 'R9C5', 'R8C4', 'R7C4'],
  ['R3C7', 'R3C8', 'R4C9', 'R5C9', 'R6C8', 'R5C8', 'R4C8', 'R5C7', 'R4C7'],
];

const orangeLines = [
  ['R2C4', 'R3C3', 'R4C2', 'R3C2', 'R3C1', 'R2C1', 'R2C2', 'R1C2', 'R1C3', 'R2C3', 'R2C4'],
  ['R7C8', 'R7C9', 'R8C9', 'R7C8'],
  ['R8C7', 'R8C8', 'R9C8', 'R8C7'],
  ['R3C5', 'R4C4', 'R5C3', 'R4C3', 'R3C4', 'R3C5'],
  ['R4C6', 'R5C5', 'R6C4', 'R5C4', 'R4C5', 'R4C6'],
];

const withoutClosingRepeat = (line) => (
  line.length > 1 && line[0] === line[line.length - 1] ? line.slice(0, -1) : line
);

const sumDivisibleBy3 = NFA.encodeSpec({
  startState: 0,
  transition: (sum, value) => (sum + value) % 3,
  accept: (sum) => sum === 0,
}, 9);

return [
  ...whispers.map(cells => new Whisper(...cells)),
  ...orangeLines.map(cells => new NFA(sumDivisibleBy3, 'sum mod 3', ...withoutClosingRepeat(cells))),
  new BlackDot('R6C6', 'R5C6'),
  new BlackDot('R5C7', 'R5C6'),
];
