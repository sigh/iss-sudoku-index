// Title: Call 999
// Author: billybeth
// Video: https://www.youtube.com/watch?v=wF0O1xJBPO4
// Source: https://sudokupad.app/7si4uhm696

// Rules encoded, in full:
//   Normal Sudoku rules apply.
//   The small number in the corner of each cage is the sum of all the digits in
//   that cage including those in the small number itself. All the small numbers
//   are different.
//   Black dots separate cells in the ratio of 1:2. The rules do not say the dots
//   are exhaustive, so undotted edges are left unconstrained.
// Nothing is omitted.
//
// The corner numbers are not drawn; the rules make them quantities to be found.
// Write S for a cage's corner number and D for the sum of its cell digits. The
// rule is S = D + digitsum(S), and cage digits are distinct (each cage lies
// inside one row, column or box):
//   - 1-digit S gives D = 0, impossible for a cage of two or more cells;
//   - 2-digit S = 10a+b gives 10a+b = D+a+b, so D = 9a and b is free, i.e. a
//     cage summing to 9a may carry any of the ten corner numbers 10a..10a+9;
//   - 3-digit S = 100a+10b+c gives D = 99a+9b >= 99, over the 30 maximum of a
//     4-cell cage of distinct digits, and longer S only grows.
// Cage size then bounds D: a 2-cell cage sums to at most 17 so D = 9; a 3-cell
// cage sums to at most 24 so D is 9 or 18; the 4-cell cage sums to at least 10
// so D is 18 or 27. "All the small numbers are different" settles the rest by
// counting. There are ten 2-cell cages, all with D = 9, and only ten corner
// numbers 10..19 to share, so they use every one; no 3-cell cage can then take
// D = 9, so all ten take D = 18 and likewise use up 20..29; the single 4-cell
// cage is left with D = 27. That is the only assignment consistent with the
// rules, and distinct corner numbers do exist for it, so the sums below carry
// exactly the content of the two cage sentences.

// The 21 cage outlines as drawn, in source order.
const cages = [
  ['R7C4', 'R8C4', 'R9C4'],
  ['R7C6', 'R8C6', 'R9C6'],
  ['R5C6', 'R6C6'],
  ['R5C4', 'R6C4'],
  ['R6C1', 'R6C2', 'R6C3'],
  ['R3C4', 'R4C4'],
  ['R1C4', 'R2C4'],
  ['R6C5', 'R7C5'],
  ['R4C5', 'R4C6'],
  ['R5C1', 'R5C2', 'R5C3'],
  ['R5C7', 'R6C7'],
  ['R3C5', 'R3C6'],
  ['R7C7', 'R8C7', 'R9C7'],
  ['R7C8', 'R8C8', 'R9C8'],
  ['R2C7', 'R3C7'],
  ['R1C3', 'R2C3', 'R3C3'],
  ['R2C8', 'R2C9', 'R3C8', 'R3C9'],
  ['R1C2', 'R2C2'],
  ['R7C1', 'R8C1', 'R9C1'],
  ['R4C9', 'R5C8', 'R5C9'],
  ['R8C3', 'R9C2', 'R9C3'],
];

// Cage total by cage size, per the derivation above.
const cageSum = { 2: 9, 3: 18, 4: 27 };

return [
  new Shape('9x9'),

  ...cages.map((cells) => new Cage(cageSum[cells.length], ...cells)),

  // The five black edge marks.
  new BlackDot('R8C6', 'R9C6'),
  new BlackDot('R3C4', 'R4C4'),
  new BlackDot('R1C3', 'R2C3'),
  new BlackDot('R9C7', 'R9C8'),
  new BlackDot('R5C3', 'R6C3'),
];
