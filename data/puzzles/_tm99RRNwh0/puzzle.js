// Title: ...What?
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=_tm99RRNwh0
// Source: https://sudokupad.app/yiaonocy5d

// Rules:
// - Normal 6x6 sudoku rules apply.
// - Each digit in a circle indicates how many times that digit appears in a
//   circle in the puzzle.
// - Digits strictly never appear more than once in a cage.
// - Cells separated by an X sum to 10. Not all possible Xs are given.
// - Grey lines are palindromes, i.e. digits equidistant from a grey line's
//   centre are always the same.
// - Those are all the rules. Do not forget any of them.
//
// The closing sentence closes the list, so no drawn shape carries a meaning
// beyond the four clue types named above. Three drawn things therefore get the
// plain reading rather than the variant their shape suggests:
//   * the "16" printed at the cage's top-left corner is not a cage total --
//     the cage rule states only the no-repeat clause, and no rule mentions
//     cage sums, so the cage is all-different and nothing more;
//   * "each digit in a circle" is unqualified, so it covers every drawn
//     circle, including the ones whose placement would elsewhere read as a
//     quadruple (shared corner of R2C3/R2C4/R3C3/R3C4), a Kropki-style edge
//     dot (R5C6/R6C6 edge), and a thermometer bulb (R4C5);
//   * "not all possible Xs are given" removes the usual negative constraint,
//     so no unmarked pair is barred from summing to 10.
// All five stated rules are encoded. The "16" is the one drawn mark no stated
// rule reaches, so it carries nothing here.

// Circles that sit over a cell: the four white cell circles, plus the grey
// disc filling R4C5.
const circleCells = ['R1C2', 'R3C1', 'R4C5', 'R6C4', 'R6C5'];

// Circles that sit on an edge or a corner instead of a cell, so their digits
// are printed rather than solved: 3,4,4,3 inside the corner circle (row-major
// around the shared corner of R2C3/R2C4/R3C3/R3C4) and 4 inside the edge
// circle between R5C6 and R6C6.
const printedDigits = [3, 4, 4, 3, 4];

// CountingCircles counts over cells, so each printed digit needs a cell to
// live in: a fixed Var pinned by a Given, joined to the same circle group.
const printed = new Var('Q', 'printed circle digits', printedDigits.length);
const printedCells = printedDigits.map((_, i) => printed.cell(i + 1));

// Both grey strokes, read off their waypoints. The second path is drawn twice
// (a thin #aaaf stroke over a thick #ccc one) and is encoded once.
const palindromes = [
  ['R6C5', 'R5C5', 'R4C4', 'R4C3', 'R3C2', 'R2C2', 'R1C2'],
  ['R4C5', 'R3C5', 'R2C6', 'R1C6'],
];

return [
  new Shape('6x6'),

  printed,
  ...printedDigits.map((digit, i) => new Given(printedCells[i], digit)),
  new CountingCircles(...circleCells, ...printedCells),

  new AllDifferent('R5C1', 'R5C2', 'R5C3', 'R5C4'),

  ...palindromes.map(cells => new Palindrome(...cells)),

  // The one X, drawn as two crossed grey bars on the R4C3/R4C4 edge.
  new X('R4C3', 'R4C4'),
];
