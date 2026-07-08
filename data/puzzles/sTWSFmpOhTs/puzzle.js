// Title: Slow Arrows
// Author: billybeth
// Video: https://www.youtube.com/watch?v=sTWSFmpOhTs
// Source: https://sudokupad.app/5542oxal82

// Normal Sudoku rules apply.
// Each line is a "slow thermometer arrow": in one direction the digits are
// non-decreasing (increase or stay the same) from end to end, and in the other
// direction the first digit equals the sum of the remaining digits on the line.
// The line is undirected, so which end is the sum tip is not marked -- the two
// properties are tied (the sum tip is the maximum, so the non-decreasing
// direction points at it). Each line is therefore an Or over the two
// orientations: Arrow(tip = sum of arm) AND a non-decreasing chain toward tip.

const cid = (r, c) => makeCellId(r + 1, c + 1);

// Lines as ordered 0-indexed [row, col], one endpoint to the other, including
// the intermediate cells crossed by diagonal segments.
const lines = [
  [[8, 5], [7, 6], [6, 7], [7, 8]],
  [[7, 3], [7, 4], [8, 4]],
  [[7, 2], [6, 3], [5, 4], [6, 5]],
  [[5, 0], [4, 1], [5, 2]],
  [[2, 0], [1, 1], [0, 2], [1, 3]],
  [[3, 0], [2, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
  [[4, 2], [3, 3], [4, 4], [5, 5], [6, 6]],
  [[3, 5], [2, 6], [3, 7], [4, 8]],
  [[2, 5], [1, 6], [2, 7]],
  [[1, 5], [0, 6], [1, 7]],
  [[5, 1], [6, 2], [7, 1]],
];

// Non-decreasing / non-increasing chains along consecutive cells (a "slow"
// thermometer allows equal neighbours, so Thermo's strict < is wrong).
const leKey = Pair.fnToKey((a, b) => a <= b, 9); // cells[i] <= cells[i+1]
const geKey = Pair.fnToKey((a, b) => a >= b, 9); // cells[i] >= cells[i+1]

const constraints = [new Shape('9x9')];

for (const line of lines) {
  const cells = line.map(([r, c]) => cid(r, c));
  const first = cells[0];
  const last = cells[cells.length - 1];

  // Orientation A: last cell is the tip (sum of the rest); non-decreasing
  // first -> last.
  const tipLast = new And([
    new Arrow(last, ...cells.slice(0, -1)),
    new Pair(leKey, 'slow', ...cells),
  ]);

  // Orientation B: first cell is the tip; non-decreasing last -> first.
  const tipFirst = new And([
    new Arrow(first, ...cells.slice(1)),
    new Pair(geKey, 'slow', ...cells),
  ]);

  constraints.push(new Or([tipLast, tipFirst]));
}

return constraints;
