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

const arrowConstraints = [
  // Rightward rows: the R1C1-anchored template is shifted to rows 2, 3, 4.
  graph.makeReplicate(
    arrowConstraint(sightline(1, 1, 0, 1)), ['R2C1', 'R3C1', 'R4C1']),
  // Upward columns: clue cell R9C1 lies inside the R1C1-anchored template.
  graph.makeReplicate(
    arrowConstraint(sightline(9, 1, -1, 0)), ['R1C1', 'R1C4', 'R1C8', 'R1C9']),
  // Leftward rows: clue cell R1C9 lies inside the R1C1-anchored template.
  graph.makeReplicate(
    arrowConstraint(sightline(1, 9, 0, -1)), ['R1C1', 'R3C1', 'R4C1', 'R6C1']),
  // The remaining four directions occur once each.
  arrowConstraint(sightline(1, 1, 1, 0)),
  arrowConstraint(sightline(9, 9, -1, -1)),
  arrowConstraint(sightline(9, 1, -1, 1)),
  arrowConstraint(sightline(1, 1, 1, 1)),
];

return [
  new Shape('9x9'),
  ...arrowConstraints,
];
