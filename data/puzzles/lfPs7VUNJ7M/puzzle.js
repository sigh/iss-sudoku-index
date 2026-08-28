// Title: Untitled
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=lfPs7VUNJ7M
// Source: https://cracking-the-cryptic.web.app/sudoku/LpD7RgNPnF

// Normal sudoku rules apply.
//
// Rule text (video description): "For cells with arrows, the first N digits
// in all directions of the arrows must have an equal sum, where N is the
// digit placed in that cell. Digits may repeat in sums with a diagonal
// direction. Not all possible arrows are given."
//
// Read as: each arrow (bulb) cell B holds digit N. For every direction with
// a drawn stub from B, walk outward starting at the cell immediately
// adjacent to B -- B's own digit is not one of the summed digits, matching
// the usual bulb-vs-path convention (a bulb is the reference value, not
// part of what it sums) -- and take the next N cells in a straight line.
// All of B's direction-sums (over however many stubs it carries) must be
// equal. "Digits may repeat in sums with a diagonal direction" describes a
// consequence (row/column all-different already forces distinctness on an
// orthogonal read; nothing forces it on a diagonal one) rather than adding
// a rule, so it needs no separate constraint. "Not all possible arrows are
// given" licenses no inference from an absent direction.
//
// A bulb's own digit range is implicitly bounded by its shortest drawn
// direction: "the first N digits" has no meaning once a direction runs out
// of cells before N is reached, so only N values that fit every one of a
// bulb's directions admit a reading at all -- the Or below omits branches
// past that length on purpose, which is the rule, not an added constraint.

const grid = new Shape('9x9');

// Bulb cell -> drawn direction vectors [dr, dc], read off the short
// direction stubs drawn at each cell (28 stubs over 12 bulb cells).
const bulbs = {
  'R1C1': [[1, 0], [0, 1]],                     // down, right
  'R1C7': [[0, -1], [1, 0]],                    // left, down
  'R3C7': [[-1, 0], [-1, 1], [0, 1]],           // up, up-right, right
  'R3C9': [[-1, 0], [1, -1]],                   // up, down-left
  'R5C9': [[-1, 0], [1, 0]],                    // up, down
  'R6C7': [[-1, 0], [1, 0]],                    // up, down
  'R5C5': [[-1, 1], [0, -1], [1, -1], [1, 1]],  // up-right, left, down-left, down-right
  'R6C5': [[1, -1], [1, 1]],                    // down-left, down-right
  'R8C2': [[-1, 1], [0, 1]],                    // up-right, right
  'R9C1': [[-1, 0], [0, 1]],                    // up, right
  'R5C1': [[-1, 0], [0, 1], [1, 0]],            // up, right, down
  'R4C3': [[0, 1], [1, 0]],                     // right, down
};

// Cells running from a bulb outward in one direction, stopping at the grid
// edge -- the longest possible read that direction could ever need.
function pathCells(row, col, dr, dc) {
  const cells = [];
  let r = row + dr, c = col + dc;
  while (r >= 1 && r <= 9 && c >= 1 && c <= 9) {
    cells.push(makeCellId(r, c));
    r += dr;
    c += dc;
  }
  return cells;
}

// For each bulb: branch over every N its shortest direction can support,
// pinning the bulb to N and requiring that N-length prefix of every
// direction to share one sum. Whichever branch matches the bulb's actual
// solved digit is the one that must hold; the others are excluded because
// their own Given contradicts the grid.
const arrowConstraints = Object.entries(bulbs).map(([bulbCell, dirs]) => {
  const { row, col } = parseCellId(bulbCell);
  const paths = dirs.map(([dr, dc]) => pathCells(row, col, dr, dc));
  const maxN = Math.min(...paths.map(p => p.length));
  const branches = [];
  for (let n = 1; n <= maxN; n++) {
    branches.push(new And([
      new Given(bulbCell, n),
      new EqualSum(...paths.map(p => p.slice(0, n))),
    ]));
  }
  return new Or(branches);
});

return [
  grid,
  ...arrowConstraints,
];
