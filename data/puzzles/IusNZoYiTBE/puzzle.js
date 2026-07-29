// Title: Chain Link
// Author: Kira
// Video: https://www.youtube.com/watch?v=IusNZoYiTBE
// Source: https://app.crackingthecryptic.com/P77PNPt74P

// Rules encoded: normal 9x9 Sudoku; grey palindromes sharing either low
// (1-4) or high (6-9) polarity; the yellow area having the opposite polarity
// plus 5 and a prime total below 135; arrows; black/white Kropki dots; and
// the two 14-sum cages. The paths, marks, and yellow cells are drawn data.

const palindromes = [
  ['R4C7', 'R3C7', 'R2C6', 'R1C5', 'R1C4', 'R2C3', 'R3C2', 'R4C2', 'R5C3', 'R6C4', 'R6C5'],
  ['R4C5', 'R4C6', 'R5C7', 'R6C8', 'R7C8', 'R8C7', 'R9C6', 'R9C5', 'R8C4', 'R7C3', 'R6C3'],
];

const yellow = [
  'R2C4', 'R2C5', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R4C3', 'R4C4',
  'R5C4', 'R5C5', 'R5C6', 'R6C6', 'R6C7', 'R7C4', 'R7C5', 'R7C6',
  'R7C7', 'R8C5', 'R8C6',
];
const grey = palindromes.flat();

// The two branches preserve the rule's shared polarity: both grey lines are
// low while yellow is high-or-5, or vice versa.
const polarity = new Or([
  new And([
    ...grey.map(cell => new Given(cell, 1, 2, 3, 4)),
    ...yellow.map(cell => new Given(cell, 5, 6, 7, 8, 9)),
  ]),
  new And([
    ...grey.map(cell => new Given(cell, 6, 7, 8, 9)),
    ...yellow.map(cell => new Given(cell, 1, 2, 3, 4, 5)),
  ]),
]);

// Each listed sum is prime and less than 135; Sum permits repeated digits.
const yellowPrimeTotal = new Or([
  19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
  73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131,
].map(total => new Sum(total, ...yellow)));

return [
  new Shape('9x9'),
  ...palindromes.map(cells => new Palindrome(...cells)),
  polarity,
  yellowPrimeTotal,
  new Arrow('R6C2', 'R5C1', 'R4C1'),
  new Arrow('R4C8', 'R5C9', 'R6C9'),
  new Arrow('R4C9', 'R3C8', 'R2C7'),
  new BlackDot('R1C3', 'R1C4'),
  new WhiteDot('R7C4', 'R7C5'),
  new WhiteDot('R7C5', 'R7C6'),
  new Cage(14, 'R1C1', 'R1C2', 'R2C2', 'R2C1'),
  new Cage(14, 'R8C8', 'R8C9', 'R9C9', 'R9C8'),
];
