// Title: Even Bishops
// Author: Morphy
// Video: https://www.youtube.com/watch?v=4rCcjvzCp_o
// Source: https://sudokupad.app/plojf2h1nk

// Equal even digits may not share a diagonal at any distance.
const graph = cellGraph('9x9');
const evenBishopKey = Pair.fnToKey(
  (a, b) => a !== b || a % 2 !== 0,
  9,
);

// One translated pair of templates for every possible diagonal distance.
const evenBishops = Array.from({ length: 8 }, (_, i) => {
  const distance = i + 1;
  const targets = graph.block('R1C1', 9 - distance, 9 - distance);
  return graph.makeReplicate([
    new Pair(
      evenBishopKey,
      'even bishops',
      'R1C1',
      makeCellId(1 + distance, 1 + distance),
    ),
    new Pair(
      evenBishopKey,
      'even bishops',
      makeCellId(1, 1 + distance),
      makeCellId(1 + distance, 1),
    ),
  ], targets);
});

const palindromeLines = [
  ['R9C7', 'R9C8', 'R8C9', 'R7C8', 'R7C7', 'R7C6', 'R7C5', 'R6C5', 'R6C4',
    'R5C3', 'R6C3', 'R6C2', 'R5C1', 'R6C1', 'R7C1', 'R7C2', 'R8C1'],
  ['R1C2', 'R2C3', 'R3C3', 'R4C3', 'R3C4', 'R3C5', 'R4C5', 'R5C6', 'R5C7',
    'R4C7', 'R4C8', 'R5C9', 'R6C8', 'R6C7', 'R5C8'],
  ['R1C7', 'R2C8', 'R3C8', 'R3C7', 'R2C6', 'R1C5', 'R2C5', 'R1C4', 'R2C4'],
];

// On a palindrome, all-different over one half including the centre is exactly
// the additional rule that no digit may occur more than twice on the full line.
const palindromes = palindromeLines.map(cells => new Palindrome(...cells));
const palindromeMultiplicity = palindromeLines.map(cells =>
  new AllDifferent(...cells.slice(0, Math.ceil(cells.length / 2))));

const evenCells = ['R2C8', 'R3C5', 'R5C3']
  .map(cell => new Given(cell, 2, 4, 6, 8));

const cages = [
  new Cage(20, 'R5C8', 'R5C9', 'R6C8', 'R6C9'),
  new Cage(18, 'R7C4', 'R8C4', 'R8C5', 'R9C4'),
  new Cage(16, 'R4C1', 'R4C2', 'R5C1', 'R5C2'),
  new Cage(16, 'R1C6', 'R2C5', 'R2C6', 'R3C6'),
  new Cage(16, 'R1C2', 'R1C3', 'R2C3', 'R3C3'),
  new Cage(24, 'R7C1', 'R7C2', 'R7C3', 'R8C1'),
  new Cage(10, 'R2C2', 'R3C2'),
  new Cage(5, 'R9C1', 'R9C2'),
  new Cage(21, 'R8C7', 'R9C7', 'R9C8', 'R9C9'),
];

return [
  new Shape('9x9'),
  ...evenCells,
  ...evenBishops,
  ...palindromes,
  ...palindromeMultiplicity,
  ...cages,
];
