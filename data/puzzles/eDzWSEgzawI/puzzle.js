// Title: Kropki Twist
// Author: Greg Dyer
// Video: https://www.youtube.com/watch?v=eDzWSEgzawI
// Source: https://cracking-the-cryptic.web.app/sudoku/98mgtmGrdh
//
// Standard 9x9 sudoku. Numbers 1-9 are replaced throughout by nine letters
// A-J (skipping I); each letter is a different number and every number has a
// letter, so the letter->digit correspondence is an unknown permutation the
// solver must also determine. No cell in the grid is given -- every clue is a
// circle between two orthogonally adjacent cells: a white circle names, by
// its letter's digit, the (absolute) difference between the two cells; a grey
// circle names, by its letter's digit, the ratio between them (one cell's
// digit is that many times the other's). Not every possible white/grey
// circle is drawn -- an unmarked pair carries no constraint.
//
// The main grid is worked in digits 1-9 directly (isomorphic to letters via
// the permutation below); nothing needs its own letter domain.

// One off-grid Var per letter, holding the digit that letter represents.
// AllDifferent over all 9 -- domain 1-9, 9 cells -- forces the correspondence
// to be a full permutation (every letter a different digit, every digit some
// letter), matching "no number is represented by more than one letter" and
// the alphabet covering all of 1-9.
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J'];
const letterValue = new Var('L', 'letter digit', LETTERS.length);
const phi = Object.fromEntries(
  LETTERS.map((letter, i) => [letter, letterValue.cell(i + 1)]));

// Drawn white (difference) circles: [letter, cellA, cellB]. Read off the
// puzzle's white-filled (#ffffff) edge overlays, one per drawn circle.
const DIFFERENCE_CIRCLES = [
  ['B', 'R3C1', 'R4C1'], ['B', 'R6C2', 'R7C2'], ['B', 'R5C8', 'R6C8'],
  ['B', 'R9C7', 'R9C8'], ['A', 'R7C1', 'R7C2'], ['H', 'R7C3', 'R7C4'],
  ['F', 'R7C5', 'R7C6'], ['F', 'R7C8', 'R7C9'], ['F', 'R1C3', 'R2C3'],
  ['A', 'R3C4', 'R3C5'], ['G', 'R6C8', 'R7C8'], ['G', 'R3C9', 'R4C9'],
  ['G', 'R5C2', 'R6C2'], ['E', 'R4C8', 'R5C8'], ['E', 'R4C2', 'R5C2'],
  ['H', 'R3C7', 'R3C8'], ['H', 'R1C6', 'R1C7'],
];

// Drawn grey (ratio) circles: [letter, cellA, cellB]. Read off the puzzle's
// grey-filled (#cfcfcf) edge overlays, one per drawn circle.
const RATIO_CIRCLES = [
  ['C', 'R1C2', 'R2C2'], ['C', 'R7C6', 'R7C7'], ['G', 'R1C4', 'R2C4'],
  ['G', 'R1C5', 'R2C5'], ['D', 'R1C8', 'R2C8'], ['J', 'R3C3', 'R3C4'],
  ['F', 'R4C4', 'R4C5'], ['F', 'R6C5', 'R6C6'], ['H', 'R8C5', 'R9C5'],
  ['H', 'R8C6', 'R9C6'], ['A', 'R8C1', 'R9C1'], ['J', 'R8C9', 'R9C9'],
];

// a = b + phi OR b = a + phi (i.e. |a - b| = phi): linear in phi, so one
// EqualSum per orientation -- {a} sums to {b, phi}, or vice versa.
const differenceConstraints = DIFFERENCE_CIRCLES.flatMap(([letter, a, b]) => {
  const p = phi[letter];
  return new Or([
    new EqualSum([a], [b, p]),
    new EqualSum([b], [a, p]),
  ]);
});

// a = k*b OR b = k*a is bilinear in (cell, phi), so it is case-split over
// phi's candidate digit k: for each k, "phi is k" plus a linear ratio Sum in
// each direction. k=1 (a==b) is skipped -- adjacent cells are already
// sudoku-distinct, so that branch could never contribute a solution.
const ratioConstraints = RATIO_CIRCLES.flatMap(([letter, a, b]) => {
  const p = phi[letter];
  return new Or(Array.from({ length: 8 }, (_, i) => i + 2).map(k =>
    new And([
      new Given(p, k),
      new Or([
        new Sum(0, a, [b, -k]),
        new Sum(0, b, [a, -k]),
      ]),
    ])));
});

return [
  new Shape('9x9'),
  letterValue,
  new AllDifferent(...letterValue.cells()),
  ...differenceConstraints,
  ...ratioConstraints,
];
