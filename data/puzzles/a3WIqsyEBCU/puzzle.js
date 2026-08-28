// Title: Shooting Blanks
// Author: Freddie Hand
// Video: https://www.youtube.com/watch?v=a3WIqsyEBCU
// Source: https://cracking-the-cryptic.web.app/sudoku/DqHP7Bm7bH

// Rules encoded:
// - Each row and column contains the digits 1-5 once each, plus exactly two
//   blank cells (7 cells per row/column: 5 digits + 2 blanks).
// - Each clue printed inside the grid, at the shared corner of four cells,
//   is the sum of those four cells' digits (a blank contributes 0).
// - Each clue printed outside the grid, beside a row or column, is the sum
//   of the digits strictly between that lane's two blank cells -- not the
//   digits before the first blank or after the second.
//
// Model: value range 0-6 on a Raw grid, 0 standing for "blank" (no boxes:
// the rules never mention them, and only 5 distinct digits fill a 7-cell
// lane). ContainExact on every row/column states the digit-permutation +
// two-blanks rule in one constraint, and (since it covers every cell twice
// with an exact 7-value list) also restricts every cell to 0-5, so no
// separate domain Given is needed for the unused value 6. Interior corner
// sums are cage-free Sum constraints (repeats/blanks allowed, unlike Cage).
// Each outside clue is a small NFA that scans its lane once: ignore cells
// before the first 0, sum cells between the first and second 0 (clamped at
// target+1, since only equality at the end matters), ignore cells after the
// second 0.

const SHAPE = new Shape('7x7', '0-6', 'Raw');
const graph = cellGraph(SHAPE);

// Row/column rule: two blanks (0) and one each of 1-5.
const rowColValueStr = [0, 0, 1, 2, 3, 4, 5].join('_');
const rowColRules = [...graph.rows(), ...graph.columns()]
  .map(cells => new ContainExact(rowColValueStr, ...cells));

// Interior corner-sum clues: value at the shared corner of R{a}C{b},
// R{a}C{b+1}, R{a+1}C{b}, R{a+1}C{b+1}. Transcribed from the puzzle's corner
// markers, each centered on a grid intersection.
const cornerSums = [
  [8, 'R1C1', 'R1C2', 'R2C1', 'R2C2'],
  [9, 'R2C2', 'R2C3', 'R3C2', 'R3C3'],
  [2, 'R5C2', 'R5C3', 'R6C2', 'R6C3'],
  [10, 'R6C1', 'R6C2', 'R7C1', 'R7C2'],
  [5, 'R6C6', 'R6C7', 'R7C6', 'R7C7'],
  [4, 'R5C5', 'R5C6', 'R6C5', 'R6C6'],
  [10, 'R2C5', 'R2C6', 'R3C5', 'R3C6'],
  [9, 'R1C6', 'R1C7', 'R2C6', 'R2C7'],
].map(([sum, ...cells]) => new Sum(sum, ...cells));

// Outside "between the blanks" clues: one NFA per clued lane, built fresh
// per target value so the accept condition can compare against it directly.
// Scan direction never matters here -- the segment strictly between the two
// blanks is the same set of cells read either way -- so the natural row/
// column order is used as-is.
function betweenBlanksNFA(target) {
  const spec = {
    startState: { phase: 0, sum: 0 },
    transition: ({ phase, sum }, value) => {
      if (phase === 0) {
        // Before the first blank: not part of the sum.
        return value === 0 ? { phase: 1, sum: 0 } : { phase: 0, sum: 0 };
      }
      if (phase === 1) {
        // Between the two blanks: accumulate, clamped once it can only fail.
        if (value === 0) return { phase: 2, sum };
        return { phase: 1, sum: Math.min(sum + value, target + 1) };
      }
      // After the second blank: rest of the lane is unread.
      return { phase: 2, sum };
    },
    accept: ({ phase, sum }) => phase === 2 && sum === target,
  };
  return NFA.encodeSpec(spec, SHAPE);
}

// Clued lanes only, transcribed from the puzzle's outside-clue markers:
// left of row 2, and top of columns 1, 4 and 7. Every other row/column has
// no outside clue printed, so no constraint.
const outsideClues = [
  [7, graph.rows()[1]],       // left of R2
  [4, graph.columns()[0]],    // top of C1
  [6, graph.columns()[3]],    // top of C4
  [9, graph.columns()[6]],    // top of C7
].map(([target, cells], i) =>
  new NFA(betweenBlanksNFA(target), `between-blanks-${i}`, ...cells));

return [
  SHAPE,
  ...rowColRules,
  ...cornerSums,
  ...outsideClues,
];
