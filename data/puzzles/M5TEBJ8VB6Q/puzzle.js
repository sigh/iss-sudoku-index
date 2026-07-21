// Title: BAD Values Snooker
// Author: Zombie Hunter
// Video: https://www.youtube.com/watch?v=M5TEBJ8VB6Q
// Source: https://sudokupad.app/czep30o6o9

// Symbols 1, 4, and 7 stand for B(ox), A(cross), and D(own). Their clue
// values are respectively the cell's box, row, and column number.
const clueValue = (cell, symbol) => {
  const {row, col} = parseCellId(cell);
  if (symbol === 1) return 3 * Math.floor((row - 1) / 3) + Math.floor((col - 1) / 3) + 1;
  if (symbol === 4) return row;
  if (symbol === 7) return col;
  return symbol;
};

const difference = (amount, a, b, label) => new Pair(
  Pair.fnToKey(
    (symbolA, symbolB) =>
      Math.abs(clueValue(a, symbolA) - clueValue(b, symbolB)) === amount,
    9,
  ),
  label,
  a,
  b,
);

const minimumDifference = (amount, a, b, label) => new Pair(
  Pair.fnToKey(
    (symbolA, symbolB) =>
      Math.abs(clueValue(a, symbolA) - clueValue(b, symbolB)) >= amount,
    9,
  ),
  label,
  a,
  b,
);

const greenLines = [
  [
    'R2C8', 'R1C7', 'R1C6', 'R1C5', 'R1C4', 'R1C3', 'R2C2',
    'R3C2', 'R4C2', 'R5C3', 'R6C2', 'R7C2', 'R8C2', 'R9C3',
  ],
  [
    'R2C8', 'R3C8', 'R4C8', 'R5C7', 'R6C8', 'R7C8', 'R8C8',
    'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3',
  ],
];

const greenDifferences = greenLines.flatMap(line =>
  line.slice(1).map((cell, index) =>
    minimumDifference(5, line[index], cell, 'Green line: values differ by at least 5')),
);

const symbols = Array.from({length: 9}, (_, index) => index + 1);
const parityClues = [
  ...['R1C2', 'R1C8', 'R9C2', 'R9C8'].map(cell =>
    new Given(cell, ...symbols.filter(symbol => clueValue(cell, symbol) % 2 === 1))),
  ...['R5C2', 'R5C8'].map(cell =>
    new Given(cell, ...symbols.filter(symbol => clueValue(cell, symbol) % 2 === 0))),
];

const snookerBalls = [
  [7, 'R1C3', 'R2C3'],
  [6, 'R2C3', 'R2C4'],
  [5, 'R2C6', 'R2C7'],
  [4, 'R3C4', 'R4C4'],
  [3, 'R3C6', 'R4C6'],
  [2, 'R5C6', 'R5C7'],
  [1, 'R6C3', 'R7C3'],
  [1, 'R8C4', 'R8C5'],
  [1, 'R6C6', 'R7C6'],
  [1, 'R7C5', 'R7C6'],
  [1, 'R5C5', 'R6C5'],
];

const ballDifferences = snookerBalls.map(([amount, a, b]) =>
  difference(amount, a, b, `Snooker ball ${amount}`),
);

return [
  new Shape('9x9'),
  ...greenDifferences,
  ...parityClues,
  ...ballDifferences,
];
