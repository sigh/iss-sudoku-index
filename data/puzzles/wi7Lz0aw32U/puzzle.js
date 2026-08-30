// Title: The Puzzle of Chromosomes
// Author: Philipp Blume
// Video: https://www.youtube.com/watch?v=wi7Lz0aw32U
// Source: https://cracking-the-cryptic.web.app/sudoku/Hrf77bnJtN
//
// Normal sudoku rules apply (standard 3x3 boxes -- the payload's own regions
// are exactly the nine boxes, so no Jigsaw is needed).
//
// Outside clue rule: the numbers outside the grid show the sum of the first X
// numbers from that direction, where the Xth number is the first one whose
// parity differs from the number immediately before it. Encoded below as one
// NFA per lane, each read from the printed edge inward. All eight outside
// clues sit at ordinary mid-edge row/column positions (never a corner), which
// is why they are read as straight lanes rather than diagonal (Little
// Killer-style) rays.
//
// Line rule: each of the five drawn lines sums to 23. The video description
// also calls the lines "unique content"; taken as "no repeated digit within a
// line" that is arithmetically impossible for the 11-cell line below (only 9
// digits exist), and no other grounded reading was found, so it is an
// omitted rule.

const TARGET = 23;

// Carries (prevParity, runningSum, found) along a lane read from its near
// edge inward. `found` latches true at the first digit whose parity differs
// from the one immediately before it -- that digit is included in the sum,
// and the sum is then frozen (later digits in the lane are unconstrained by
// this clue). `sum` is clamped to TARGET + 1 once it can only overshoot.
// Every state keeps the same three fields (prevParity stays present, unused,
// once found) for one consistent state shape.
const parityChangeSumSpec = NFA.encodeSpec({
  startState: { prevParity: null, sum: 0, found: false },
  transition: ({ prevParity, sum, found }, value) => {
    if (found) return { prevParity, sum, found: true };
    const parity = value % 2;
    const newSum = Math.min(sum + value, TARGET + 1);
    if (prevParity === null) {
      // First digit in the lane: nothing to compare against yet.
      return { prevParity: parity, sum: newSum, found: false };
    }
    if (parity === prevParity) {
      return { prevParity: parity, sum: newSum, found: false };
    }
    // First parity change: this is the Xth number.
    return { prevParity: null, sum: newSum, found: true };
  },
  accept: ({ sum, found }) => found && sum === TARGET,
}, 9);

const outsideLanes = {
  // top C1, reading down -- overlay #0
  topC1: ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'],
  // top C3, reading down -- overlay #1
  topC3: ['R1C3', 'R2C3', 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R8C3', 'R9C3'],
  // top C8, reading down -- overlay #2
  topC8: ['R1C8', 'R2C8', 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8', 'R9C8'],
  // left R4, reading right -- overlay #3
  leftR4: ['R4C1', 'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8', 'R4C9'],
  // left R5, reading right -- overlay #4
  leftR5: ['R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9'],
  // right R7, reading left -- overlay #5
  rightR7: ['R7C9', 'R7C8', 'R7C7', 'R7C6', 'R7C5', 'R7C4', 'R7C3', 'R7C2', 'R7C1'],
  // bottom C4, reading up -- overlay #6
  bottomC4: ['R9C4', 'R8C4', 'R7C4', 'R6C4', 'R5C4', 'R4C4', 'R3C4', 'R2C4', 'R1C4'],
  // bottom C6, reading up -- overlay #7
  bottomC6: ['R9C6', 'R8C6', 'R7C6', 'R6C6', 'R5C6', 'R4C6', 'R3C6', 'R2C6', 'R1C6'],
};

const outsideClues = Object.entries(outsideLanes).map(
  ([name, cells]) => new NFA(parityChangeSumSpec, name, ...cells));

// Drawn orange lines (cell paths transcribed from the puzzle's drawn line
// waypoints, straight polyline segments; a segment spanning more than one
// diagonal step covers every cell it crosses).
const lines = [
  ['R3C7', 'R3C8', 'R4C9'],
  ['R2C1', 'R3C2', 'R2C3', 'R3C4', 'R4C5', 'R5C6', 'R5C7', 'R6C7', 'R7C8', 'R8C9', 'R9C8'],
  ['R7C6', 'R7C5', 'R8C5'],
  ['R7C3', 'R8C4', 'R9C3'],
  ['R8C3', 'R9C2', 'R8C1', 'R7C1'],
];

const lineSums = lines.map(cells => new Sum(TARGET, ...cells));

return [
  new Shape('9x9'),

  new Given('R1C5', 2),
  new Given('R1C6', 3),
  new Given('R4C4', 2),
  new Given('R4C5', 3),
  new Given('R5C7', 2),
  new Given('R6C5', 4),
  new Given('R6C7', 3),
  new Given('R7C5', 6),

  ...outsideClues,
  ...lineSums,
];
