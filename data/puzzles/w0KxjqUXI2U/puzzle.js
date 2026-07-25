// Title: The Composite Thread
// Author: palpot
// Video: https://www.youtube.com/watch?v=w0KxjqUXI2U
// Source: https://sudokupad.app/15rywuvxz9

// Normal sudoku rules apply on a 9x9 grid with standard rows, columns, and
// 3x3 boxes.
//
// Five blue lines are drawn on the grid (paths below, from the drawn
// geometry). Box borders divide each line into segments; RegionSumLine
// enforces that every segment of the same line sums to the same total
// (e.g. line 0 below is exactly the rules text's own example,
// r2c6+r3c6 = r4c7+r4c8+r4c9).
//
// The total of ALL digits along each line must be unique per line, and the
// five line totals must together form a set of consecutive integers. A line
// total can be as large as ~90, far past the solver's 16-value cap on any
// cell/Var, so it is never materialized directly. Instead an auxiliary
// "rank" Var (VK1..VK5, domain 1-5) is assigned to each line, constrained to
// a bijection onto {1..5}, and each pair of lines adjacent in the array is
// tied by one EqualSum so that (line total) - (its rank) is the same for
// every line: lineTotal[i] + rank[i+1] = lineTotal[i+1] + rank[i]. Since
// equality chains transitively, this holds for every pair, so
// lineTotal[i] = C + rank[i] for a common constant C -- i.e. the five totals
// are exactly {C+1, ..., C+5}, a consecutive set with one total per rank.

// Drawn line paths (deepskyblue), read off the source geometry.
const lines = [
  ['R2C6', 'R3C6', 'R4C7', 'R4C8', 'R4C9'],
  ['R7C8', 'R7C7', 'R7C6', 'R7C5', 'R6C5', 'R6C4', 'R5C3', 'R6C2', 'R6C1', 'R7C1', 'R7C2'],
  ['R9C1', 'R8C2', 'R7C3', 'R8C4', 'R8C5', 'R8C6', 'R9C7', 'R8C8'],
  ['R8C9', 'R7C9', 'R6C9', 'R5C8', 'R5C7', 'R5C6', 'R4C5', 'R3C5', 'R2C5'],
  ['R3C2', 'R2C2', 'R2C3', 'R1C3', 'R2C4', 'R1C5', 'R1C6', 'R2C7', 'R1C8', 'R1C9'],
];

const rank = new Var('K', 'Line total rank', lines.length);

return [
  new Shape('9x9'),

  rank,
  new Given(rank.cell(1), 1, 2, 3, 4, 5),
  new Given(rank.cell(2), 1, 2, 3, 4, 5),
  new Given(rank.cell(3), 1, 2, 3, 4, 5),
  new Given(rank.cell(4), 1, 2, 3, 4, 5),
  new Given(rank.cell(5), 1, 2, 3, 4, 5),
  new AllDifferent(...rank.cells()),

  ...lines.map((cells) => new RegionSumLine(...cells)),

  // lineTotal[i] + rank[i+1] == lineTotal[i+1] + rank[i]
  ...lines.slice(0, -1).map((cells, i) => new EqualSum(
    [...cells, rank.cell(i + 2)],
    [...lines[i + 1], rank.cell(i + 1)],
  )),
];
