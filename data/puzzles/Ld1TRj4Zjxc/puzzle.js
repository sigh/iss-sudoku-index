// Title: Balanced X-Sums
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=Ld1TRj4Zjxc
// Source: https://sudokupad.app/74acwb3vkq

// Balanced X-Sums: for each outside arrow, the first cell gives X. Across the
// first X cells seen from that arrow, odd digits and even digits have equal sums.

const graph = cellGraph('9x9');

const sightline = (row, col, dRow, dCol) => {
  const cells = [];
  for (let i = 0; i < 9; i++) {
    cells.push(makeCellId(row + i * dRow, col + i * dCol));
  }
  return cells;
};

const balancedPrefixNFAs = new Map();
const balancedPrefixNFA = (length) => {
  if (!balancedPrefixNFAs.has(length)) {
    balancedPrefixNFAs.set(length, NFA.encodeSpec({
      startState: { index: 0, diff: 0 },
      transition({ index, diff }, value) {
        if (index >= length) return undefined;
        return {
          index: index + 1,
          diff: diff + (value % 2 === 1 ? value : -value),
        };
      },
      accept: ({ index, diff }) => index === length && diff === 0,
    }, 9));
  }
  return balancedPrefixNFAs.get(length);
};

// The balanced-X-Sum rule for one arrow: given the clue digit x in the
// first cell, the first x cells (this arrow's direction) split evenly by
// parity sum.
const arrowConstraint = (cells) => new Or(
  [1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => new And([
    new Given(cells[0], x),
    new NFA(balancedPrefixNFA(x), `BXS${x}`, ...cells.slice(0, x)),
  ]))
);

// [startRow, startCol, dRow, dCol]. Arrows sharing a direction are literal
// translates of one another along the perpendicular axis (same sightline
// template, just moved to a parallel row/column), so those groups are
// expressed with one Replicate template instead of one Or per arrow.
const arrowSpecs = [
  [4, 1, 0, 1],   // Left of R4, rightward.
  [9, 1, -1, 0],  // Below C1, upward.
  [3, 1, 0, 1],   // Left of R3, rightward.
  [2, 1, 0, 1],   // Left of R2, rightward.
  [1, 1, 1, 0],   // Above C1, downward.
  [1, 9, 0, -1],  // Right of R1, leftward.
  [9, 9, -1, 0],  // Below C9, upward.
  [6, 9, 0, -1],  // Right of R6, leftward.
  [4, 9, 0, -1],  // Right of R4, leftward.
  [3, 9, 0, -1],  // Right of R3, leftward.
  [9, 9, -1, -1], // Bottom-right corner, up-left.
  [9, 1, -1, 1],  // Bottom-left corner, up-right.
  [1, 1, 1, 1],   // Top-left corner, down-right.
  [9, 8, -1, 0],  // Below C8, upward.
  [9, 4, -1, 0],  // Below C4, upward.
];

const groups = new Map();
for (const [row, col, dRow, dCol] of arrowSpecs) {
  const key = `${dRow},${dCol}`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push({ row, col, dRow, dCol });
}

const arrowConstraints = [];
for (const members of groups.values()) {
  const { dRow, dCol } = members[0];
  if (members.length === 1) {
    const { row, col } = members[0];
    arrowConstraints.push(arrowConstraint(sightline(row, col, dRow, dCol)));
    continue;
  }
  // Order along the perpendicular axis so the first member has the
  // smallest cell index (Replicate targets must not precede the origin).
  members.sort((a, b) => (a.row - b.row) || (a.col - b.col));
  const origin = members[0];
  const originCells = sightline(origin.row, origin.col, dRow, dCol);
  const starts = members.map(m => makeCellId(m.row, m.col));
  arrowConstraints.push(new Replicate(
    [arrowConstraint(originCells)],
    Replicate.encodeTargetCells(starts, starts[0], graph),
    starts[0],
  ));
}

return [
  new Shape('9x9'),
  ...arrowConstraints,
];
