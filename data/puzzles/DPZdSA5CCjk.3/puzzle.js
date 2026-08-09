// Title: 9/3/22: Unicorn Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=DPZdSA5CCjk
// Source: https://f-puzzles.com/?id=2eg4lvox

// Normal sudoku rules apply. Additionally: for each cell that holds a 9,
// every digit at a knight's move from that cell must differ from every other
// digit at a knight's move from that cell (a 9 may itself be seen more than
// once by another 9, so long as no other digit repeats among the seen cells).
//
// Modeled as one NFA per grid cell: the cell is read first, then its knight
// neighbors (computed from the knight offsets below, never hand-enumerated).
// The NFA state tracks whether the leading cell is a 9 and, if so, a bitmask
// of neighbor digits seen so far; a repeated neighbor digit is rejected. When
// the leading cell is not a 9 the neighbor symbols are read but ignored.
const KNIGHT_OFFSETS = [
  [1, 2], [1, -2], [-1, 2], [-1, -2],
  [2, 1], [2, -1], [-2, 1], [-2, -1],
];

const knightSeenNFASpec = NFA.encodeSpec({
  startState: { isNine: null, seen: 0 },
  transition: ({ isNine, seen }, value) => {
    if (isNine === null) return { isNine: value === 9, seen: 0 };
    if (!isNine) return { isNine, seen };
    const bit = 1 << value;
    if (seen & bit) return undefined;  // two equal digits seen by this 9
    return { isNine, seen: seen | bit };
  },
  accept: () => true,
}, 9);

const graph = cellGraph('9x9');
const knightSeenConstraints = graph.cells().map((center) => {
  const neighbors = KNIGHT_OFFSETS
    .map(([dr, dc]) => graph.step(center, dr, dc))
    .filter((cell) => cell !== null);
  return new NFA(knightSeenNFASpec, 'KnightSeen', center, ...neighbors);
});

return [
  new Shape('9x9'),

  new Given('R1C2', 1),
  new Given('R1C5', 4),
  new Given('R1C7', 9),
  new Given('R2C1', 4),
  new Given('R2C3', 3),
  new Given('R2C6', 9),
  new Given('R2C9', 8),
  new Given('R3C4', 1),
  new Given('R3C6', 2),
  new Given('R4C2', 9),
  new Given('R4C8', 8),
  new Given('R5C3', 6),
  new Given('R5C5', 9),
  new Given('R5C7', 7),
  new Given('R6C2', 5),
  new Given('R6C8', 9),
  new Given('R7C4', 3),
  new Given('R7C6', 4),
  new Given('R8C1', 5),
  new Given('R8C4', 9),
  new Given('R8C7', 2),
  new Given('R8C9', 1),
  new Given('R9C3', 9),
  new Given('R9C5', 1),
  new Given('R9C8', 3),

  ...knightSeenConstraints,
];
