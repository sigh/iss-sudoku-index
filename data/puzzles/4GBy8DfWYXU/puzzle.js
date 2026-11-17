// Title: Gold Bar
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=4GBy8DfWYXU
// Source: https://sudokupad.app/c2f1n9ks0w

// Normal sudoku; each straight bar segment and each complete hook obeys
// largest digit = product of the remaining digits.
// Maximal straight strokes of the yellow bar, followed by the two yellow hooks.
const groups = [
  [
    "R8C3",
    "R8C4",
    "R8C5"
  ],
  [
    "R8C5",
    "R7C6",
    "R6C7",
    "R5C8",
    "R4C9"
  ],
  [
    "R4C9",
    "R3C8",
    "R2C7"
  ],
  [
    "R2C7",
    "R2C6",
    "R2C5"
  ],
  [
    "R2C5",
    "R3C4",
    "R4C3",
    "R5C2",
    "R6C1"
  ],
  [
    "R6C1",
    "R7C2",
    "R8C3"
  ],
  [
    "R4C9",
    "R4C8",
    "R4C7"
  ],
  [
    "R4C7",
    "R5C6",
    "R6C5",
    "R7C4",
    "R8C3"
  ],
  [
    "R2C5",
    "R3C6",
    "R4C7"
  ],
  [
    "R3C1",
    "R2C1",
    "R1C2",
    "R1C3"
  ],
  [
    "R7C9",
    "R8C9",
    "R9C8",
    "R9C7"
  ]
];
// Enumerate the finite language: multiplying all digits gives largest squared.
// This also permits repeated digits where ordinary sudoku permits them.
function pattern(length) {
  const words = [];
  function visit(digits, product, largest) {
    if (digits.length === length) {
      if (product === largest * largest) words.push(digits.join(''));
      return;
    }
    for (let value = 1; value <= 9; value++) {
      if (product * value <= 81) visit([...digits, value], product * value, Math.max(largest, value));
    }
  }
  visit([], 1, 0);
  return '(' + words.join('|') + ')';
}
const languages = [3, 4, 5].map(length => [length, pattern(length)]);
const patterns = new Map(languages);
const productGroups = groups.map(cells => new Regex(patterns.get(cells.length), ...cells));
return [
  new Shape('9x9'),
  // The three printed givens.
  new Given('R1C6', 7), new Given('R3C8', 9), new Given('R7C9', 8),
  ...productGroups,
];
