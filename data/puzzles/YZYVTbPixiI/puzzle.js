// Title: Penthouse
// Author: Marty Sears & Lorena
// Video: https://www.youtube.com/watch?v=YZYVTbPixiI
// Source: https://sudokupad.app/rpdtjt36r7?setting-nogrid=1&setting-hidebgimage=0&setting-digitoutlines=0

// Normal sudoku.
//
// Eighteen "characters" -- five tetrominoes, twelve pentominoes and Ocho the
// cat (one cell) -- are outlined in thick black on the board and together tile
// the 9x9 exactly, so each character's cell set is drawn data rather than
// something the solver places.  Digits never repeat within a character.  A
// small clue printed inside a character is the total of its digits, and no two
// characters share a total.  Photographs beside the board each show one
// character with one of its digits in the cell it occupies; those are the
// givens below.
//
// The rules' "no two characters are exactly the same shape", "five tetrominoes
// and twelve pentominoes", and "fit all 18 occupants in so that none overlap"
// describe the drawn outlines: they are the twelve free pentominoes, the five
// free tetrominoes and the monomino, disjoint and covering all 81 cells, so
// they constrain no digit.  Fog is solving UI and does not constrain the final
// grid; neither do the drawn eyes, ears and "NOTES" box.

// Cell lists transcribed from the thick black outlines; totals from the small
// number printed inside a character (null where none is printed).
const characters = [
  { total: null, cells: ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1'] },
  { total: 32, cells: ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R2C4'] },
  { total: 10, cells: ['R1C6', 'R1C7', 'R2C7', 'R2C8'] },
  { total: null, cells: ['R1C8', 'R1C9', 'R2C9', 'R3C8', 'R3C9'] },
  { total: null, cells: ['R2C2', 'R3C2', 'R4C2', 'R4C3', 'R4C4'] },
  { total: null, cells: ['R2C3', 'R3C3', 'R3C4', 'R3C5', 'R4C5'] },
  { total: null, cells: ['R2C5', 'R2C6', 'R3C6', 'R3C7', 'R4C7'] },
  { total: 27, cells: ['R4C6', 'R5C6', 'R6C5', 'R6C6', 'R6C7'] },
  { total: 28, cells: ['R4C8', 'R4C9', 'R5C7', 'R5C8', 'R5C9'] },
  { total: 12, cells: ['R5C2', 'R5C3', 'R6C2', 'R7C2'] },
  { total: 11, cells: ['R5C4', 'R6C3', 'R6C4', 'R7C4'] },
  { total: null, cells: ['R5C5'] },
  { total: null, cells: ['R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2'] },
  { total: null, cells: ['R6C8', 'R6C9', 'R7C8', 'R7C9'] },
  { total: 23, cells: ['R7C3', 'R8C2', 'R8C3', 'R8C4', 'R9C3'] },
  { total: null, cells: ['R7C5', 'R8C5', 'R8C6', 'R9C4', 'R9C5'] },
  { total: null, cells: ['R7C6', 'R7C7', 'R8C7', 'R8C8', 'R8C9'] },
  { total: 14, cells: ['R9C6', 'R9C7', 'R9C8', 'R9C9'] },
];

// One digit per photograph, placed in the cell the photograph shows it in once
// the photograph is turned so that its digit is the right way up.
const photoGivens = [
  ['R1C5', 6], ['R1C7', 4], ['R1C8', 9], ['R2C1', 6], ['R4C3', 9],
  ['R4C7', 1], ['R5C2', 6], ['R5C5', 8], ['R6C7', 6], ['R7C9', 9],
  ['R8C4', 1], ['R9C4', 8], ['R9C6', 6],
];

// A character's total runs from 8 (Ocho alone) to 35 (a pentomino of 9..5),
// past the nine values a Var can hold, so each total is carried in base 6
// across two Var layers and rebuilt by a coefficient Sum:
//   total = 6 * VH + VL,  with VH and VL both in 1..6.
// Every value in 7..42 has exactly one such representation, so the pair of Var
// cells is fixed by the character's digits and holds no free state.
const N = characters.length;
const high = new Var('H', 'character total, 6s', N);
const low = new Var('L', 'character total, units', N);
const cellPair = (i) => [high.cell(i + 1), low.cell(i + 1)];

// Two totals are equal exactly when both base-6 digits agree, so "no two
// characters have the same total" is one Or per pair of characters.
const characterPairs = characters.flatMap(
  (_, i) => characters.slice(i + 1).map((_, k) => [i, i + 1 + k]));

return [
  new Shape('9x9'),

  ...photoGivens.map(([cell, digit]) => new Given(cell, digit)),

  // Cage(0, ...) is all-different with no total. Ocho is one cell, where "digits
  // never repeat on a character" says nothing, so no cage is emitted for it.
  ...characters
    .filter(({ cells }) => cells.length > 1)
    .map(({ total, cells }) => new Cage(total ?? 0, ...cells)),

  high,
  low,
  ...characters.flatMap(
    (_, i) => cellPair(i).map((cell) => new Given(cell, 1, 2, 3, 4, 5, 6))),
  ...characters.map(({ cells }, i) => {
    const [h, l] = cellPair(i);
    return new Sum(0, ...cells, [h, -6], [l, -1]);
  }),
  ...characterPairs.map(([i, j]) => new Or([
    new AllDifferent(high.cell(i + 1), high.cell(j + 1)),
    new AllDifferent(low.cell(i + 1), low.cell(j + 1)),
  ])),
];
