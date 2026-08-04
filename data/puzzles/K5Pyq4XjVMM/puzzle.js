// Title: Ren Ban Sandwich Sudoku
// Author: Rocky Roer
// Video: https://www.youtube.com/watch?v=K5Pyq4XjVMM
// Source: https://app.crackingthecryptic.com/sudoku/m2gNRfdF24

// Standard sudoku: fill every row/column/3x3 box with 1-9 once each.
//
// Ten purple lines are drawn. Two lie entirely inside the grid and are
// encoded below as Renban (consecutive, non-repeating, any order): R3C8-R3C9
// and R4C5-R5C5-R5C4.
//
// The other eight purple lines each also pass through one or more cells on
// the surrounding (undrawn) ring where a row's or column's sandwich sum
// would be printed -- "numbers outside the grid ... are the sums of the
// digits sandwiched between the 1 and the 9 in that row or column" -- and
// their Renban set is over the grid digits together with those deduced,
// unbounded (0-35) sums. Omitted: ISS Vars cap at 16 values, and a sandwich
// sum requires locating the unknown positions of 1 and 9 in a row/column, so
// representing it needs a scanning NFA whose state carries the running
// sum -- and several of these lines pull in more than one such sum at once
// (e.g. one column's sum plus three different rows' sums in a single 13-cell
// set), which multiplies the per-line state space well past a single sum's
// range.
return [
  new Shape('9x9'),
  new Renban('R3C8', 'R3C9'),
  new Renban('R4C5', 'R5C5', 'R5C4'),
];
