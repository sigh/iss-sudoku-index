// Title: Killer Partridge In A Pear Sandwich
// Author: Phil Preen
// Video: https://www.youtube.com/watch?v=GQ6lUA58uLM
// Source: https://cracking-the-cryptic.web.app/sudoku/m7TgT4GmqF

// Normal sudoku (standard boxes). Killer cages sum to 12 with no repeats
// within a cage. Outside clues give the sandwich sum (digits strictly
// between the 1 and the 9 in that row/column). The 5 gold-ring cells must
// hold 1 or 9.
//
// "Some of the clues have been replaced with letters. Each letter
// represents a different digit." Exactly 9 distinct letters appear anywhere
// in the puzzle -- 4 in outside-clue totals (E, G, P, S) and 8 pencilled
// into grid cells, spelling PARTRIDGE on the main diagonal, TREE on the
// diagonal below it, and PEAR along row 4 (a Christmas-themed nod to the
// title). Those two letter sets overlap and their union is exactly the
// puzzle's 9-letter alphabet (A, D, E, G, I, P, R, S, T) -- the same set
// listed, alphabetically, in a fenced-off legend strip beside the grid
// (payload cols 10-11; not part of row/column/box logic and not encoded).
// That the pencilled letters are the same alphabet as the clue letters, and
// that the legend needs all 9 of them, is the ground for reading every
// pencilled letter as a real (coded) given alongside the clue letters,
// under the one stated rule -- not merely flavour text repeating a fixed
// digit, which "pencilMarks" (vs. a real `value`) would otherwise suggest.
//
// Each letter gets an auxiliary Var (domain 1-9); the 9 letters are
// pairwise different, i.e. a permutation of 1-9 (AllDifferent). A pencilled
// grid cell equals its letter's Var (SameValues). An outside clue whose
// printed value is a letter has "sandwich total == that letter's Var",
// expressed as Or over the 9 possible digits, each branch pinning the Var
// and the Sandwich total to the same value.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const cages = [
  [12, 'R1C3', 'R2C3', 'R2C4'],
  [12, 'R2C5', 'R3C5'],
  [12, 'R2C6', 'R3C6', 'R2C8', 'R2C7'],
  [12, 'R6C4', 'R6C5', 'R7C5'],
  [12, 'R8C5', 'R9C5'],
  [12, 'R8C2', 'R9C2', 'R9C1'],
  [12, 'R5C9', 'R6C9', 'R7C9'],
];

// Gold-ring "crust" cells: drawn circle overlays at R1C8, R2C9, R6C7, R7C4,
// R5C3 -- each must hold the digit 1 or 9.
const crustCells = ['R1C8', 'R2C9', 'R6C7', 'R7C4', 'R5C3'];

// Numeric sandwich clues: [whole row/column cell list, total].
const numericSandwiches = [
  [graph.column(1), 6],
  [graph.column(2), 0],
  [graph.row(4), 0],
  [graph.row(7), 0],
];

// One auxiliary Var per letter of the puzzle's 9-letter alphabet.
const letters = ['A', 'D', 'E', 'G', 'I', 'P', 'R', 'S', 'T'];
const letterVars = Object.fromEntries(
  letters.map(l => [l, new Var('L' + l, `letter ${l} digit`, 1)]));
const letterVar = l => letterVars[l].cell(1);
const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Outside sandwich clues printed as a letter instead of a number.
const letterSandwiches = [
  [graph.column(3), 'G'],
  [graph.column(4), 'E'],
  [graph.column(5), 'E'],
  [graph.column(6), 'S'],
  [graph.column(7), 'E'],
  [graph.row(5), 'P'],
  [graph.row(6), 'P'],
];

// Pencilled grid cells spelling PARTRIDGE (main diagonal), TREE (the
// diagonal below it), and PEAR (row 4, cols 6-9) -- from `pencilMarks`.
const pencilledLetters = {
  R1C1: 'P', R2C2: 'A', R3C3: 'R', R4C4: 'T', R5C5: 'R', R6C6: 'I',
  R7C7: 'D', R8C8: 'G', R9C9: 'E',
  R5C1: 'T', R6C2: 'R', R7C3: 'E', R8C4: 'E',
  R4C6: 'P', R4C7: 'E', R4C8: 'A', R4C9: 'R',
};

return [
  new Shape('9x9'),

  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),

  ...crustCells.map(cell => new Given(cell, 1, 9)),

  ...numericSandwiches.map(([cells, value]) => Sandwich.fromCells(value, cells, geometry)),

  ...Object.values(letterVars),
  new AllDifferent(...letters.map(letterVar)),

  ...letterSandwiches.map(([cells, letter]) => {
    const v = letterVar(letter);
    return new Or(digits.map(d => new And([
      new Given(v, d),
      Sandwich.fromCells(d, cells, geometry),
    ])));
  }),

  ...Object.entries(pencilledLetters).map(
    ([cell, letter]) => new SameValues(2, cell, letterVar(letter))),
];
