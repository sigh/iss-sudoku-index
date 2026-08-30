// Title: Starry Night Sudoku
// Author: Ryan Oswald
// Video: https://www.youtube.com/watch?v=C8vQGS7Bb6Y
// Source: https://cracking-the-cryptic.web.app/sudoku/d4jdjr9g8f

// Normal sudoku rules apply: each row, column and 3x3 box holds 1-9 once
// each. No digits are given.
//
// Letters: eighteen letter glyphs are drawn in grid cells. A letter is the
// digit of the cell it is drawn in; the same letter is the same digit,
// different letters are different digits. Exactly nine distinct letters are
// drawn -- one per grid digit.
//
// Cages: seven cages hold distinct digits. Five print a total spelled with
// the same letter alphabet, read as an ordinary decimal number (first
// letter = tens digit, second = units digit; a lone letter is the units
// digit with no tens digit printed). Two cages print no total.
//
// The source publishes no rules text (empty ctc-app payload). The decimal
// reading is forced over a plain letter-plus-letter sum by range: the 8-cell
// VN cage can only total 36-44 and the 6-cell GO cage only 21-39, but the
// largest possible sum of two distinct single digits is 17. Five outside
// margin letters, four "=" marks and four coloured cell clusters have no
// recoverable rule (no rules text, no arrowhead/marker to settle a reading)
// and are omitted.

// One representative cell per distinct letter, taken from its first
// occurrence in reading order (source pencilMarks).
const letterCell = {
  V: 'R1C3', I: 'R1C4', N: 'R1C5',
  A: 'R4C5', G: 'R5C8', H: 'R5C9',
  O: 'R6C7', S: 'R8C2', T: 'R8C3',
};

// Every other occurrence of a letter is pinned equal to its representative
// cell, chaining through repeats (N and G each occur three times).
const sameLetter = [
  new SameValues(2, letterCell.V, 'R4C4'),
  new SameValues(2, letterCell.I, 'R9C2'),
  new SameValues(2, letterCell.N, 'R4C6'),
  new SameValues(2, 'R4C6', 'R9C1'),
  new SameValues(2, letterCell.A, 'R8C4'),
  new SameValues(2, letterCell.G, 'R6C6'),
  new SameValues(2, 'R6C6', 'R9C3'),
  new SameValues(2, letterCell.H, 'R9C4'),
  new SameValues(2, letterCell.T, 'R9C5'),
];

// Different letters are different digits: one AllDifferent over the nine
// representative cells is the other half of the letter rule.
const distinctLetters = new AllDifferent(...Object.values(letterCell));

// Cages: killer-style distinctness (Cage with total 0 emits AllDifferent
// only), plus a Sum tying the cage total to its letter total's decimal
// digits where one is printed. `Sum(0, ...cells, [tens, -10], [ones, -1])`
// is `sum(cells) - 10*tens - ones = 0`, i.e. sum(cells) == 10*tens + ones.
const cages = [
  // R2C2-R9C2, total VN.
  new Cage(0, 'R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C2', 'R9C2'),
  new Sum(0, 'R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C2', 'R9C2',
    [letterCell.V, -10], [letterCell.N, -1]),

  // R6C3,R7C3,R8C3,R9C3,R8C4,R9C4, total GO.
  new Cage(0, 'R6C3', 'R7C3', 'R8C3', 'R9C3', 'R8C4', 'R9C4'),
  new Sum(0, 'R6C3', 'R7C3', 'R8C3', 'R9C3', 'R8C4', 'R9C4',
    [letterCell.G, -10], [letterCell.O, -1]),

  // R9C5-R9C9, no total printed: distinct-only.
  new Cage(0, 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'),

  // R8C7,R8C8,R8C9, total OV.
  new Cage(0, 'R8C7', 'R8C8', 'R8C9'),
  new Sum(0, 'R8C7', 'R8C8', 'R8C9', [letterCell.O, -10], [letterCell.V, -1]),

  // R7C8,R7C9, total OO (= 11 * O's digit; both letter positions are the
  // same letter, so one coefficient of -11 on O's cell covers both places).
  new Cage(0, 'R7C8', 'R7C9'),
  new Sum(0, 'R7C8', 'R7C9', [letterCell.O, -11]),

  // R2C8,R3C8,R3C9,R2C9, total OO.
  new Cage(0, 'R2C8', 'R3C8', 'R3C9', 'R2C9'),
  new Sum(0, 'R2C8', 'R3C8', 'R3C9', 'R2C9', [letterCell.O, -11]),

  // R7C6,R8C6, total A (single letter, no tens digit): the cage sum equals
  // A's own digit, i.e. the two-cell segment and the one-cell segment share
  // a sum.
  new Cage(0, 'R7C6', 'R8C6'),
  new EqualSum(['R7C6', 'R8C6'], [letterCell.A]),
];

return [
  new Shape('9x9'),
  ...sameLetter,
  distinctLetters,
  ...cages,
];
