// Title: Balanced X-Sums
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=Ld1TRj4Zjxc
// Source: https://sudokupad.app/74acwb3vkq

// Balanced X-Sums: for each outside arrow, the first cell gives X. Across the
// first X cells seen from that arrow, odd digits and even digits have equal sums.

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

const arrows = [
  sightline(4, 1, 0, 1),   // Left of R4, rightward.
  sightline(9, 1, -1, 0),  // Below C1, upward.
  sightline(3, 1, 0, 1),   // Left of R3, rightward.
  sightline(2, 1, 0, 1),   // Left of R2, rightward.
  sightline(1, 1, 1, 0),   // Above C1, downward.
  sightline(1, 9, 0, -1),  // Right of R1, leftward.
  sightline(9, 9, -1, 0),  // Below C9, upward.
  sightline(6, 9, 0, -1),  // Right of R6, leftward.
  sightline(4, 9, 0, -1),  // Right of R4, leftward.
  sightline(3, 9, 0, -1),  // Right of R3, leftward.
  sightline(9, 9, -1, -1), // Bottom-right corner, up-left.
  sightline(9, 1, -1, 1),  // Bottom-left corner, up-right.
  sightline(1, 1, 1, 1),   // Top-left corner, down-right.
  sightline(9, 8, -1, 0),  // Below C8, upward.
  sightline(9, 4, -1, 0),  // Below C4, upward.
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Or(
    [1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => new And([
      new Given(cells[0], x),
      new NFA(balancedPrefixNFA(x), `BXS${x}`, ...cells.slice(0, x)),
    ]))
  )),
];
