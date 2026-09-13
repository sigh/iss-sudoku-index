// Title: Every hit counts
// Author: Ratfinkz
// Video: https://www.youtube.com/watch?v=Fu4IrQ_kVj8
// Source: https://sudokupad.app/gfx29v36nv

// Normal sudoku rules apply.
//
// Beige "hit point" lines: counting the diamond as position 1, every digit
// that sits in its own position number (its value equals its 1-indexed
// position along the line) is summed; that sum must equal the digit that
// ends up in the diamond cell. No separate number is printed in a diamond --
// the diamond IS the target, read off the same cell once the grid is solved.
// Digits may not repeat along a line, the diamond cell included.
//
// A digit that sits in a diamond also counts how many of the 8 hit-point
// lines it appears on anywhere, its own line included; that count must equal
// the digit's own value. A digit that never sits in a diamond has no such
// restriction.
//
// Line direction (which end is position 1) is fixed by the drawn diamond
// glyph -- an underlay diamond mark sitting at one end of each stroke -- not
// by the order the drawing happened to store each stroke's waypoints in.

const lines = [
  ['R3C1', 'R2C1', 'R2C2', 'R1C1', 'R1C2', 'R2C3', 'R1C4'],
  ['R2C4', 'R1C5', 'R2C6'],
  ['R4C8', 'R4C9', 'R3C9', 'R2C9', 'R2C8', 'R1C8', 'R1C7'],
  ['R3C7', 'R4C7', 'R5C6', 'R6C7', 'R7C7', 'R8C6', 'R8C7'],
  ['R7C3', 'R6C3', 'R5C4', 'R4C3', 'R3C3', 'R3C4', 'R4C4', 'R3C5'],
  ['R6C9', 'R7C9', 'R8C9', 'R8C8', 'R9C8', 'R9C9'],
  ['R9C4', 'R8C5', 'R9C6'],
  ['R9C2', 'R9C3', 'R8C2', 'R7C1', 'R7C2', 'R6C1'],
];

// No repeats along a line (the diamond cell is on the line too).
const noRepeats = lines.map(cells => new AllDifferent(...cells));

// Hit-point sum: reading position i (1-indexed, diamond = 1) along the line,
// a digit counts toward the sum whenever it equals i; the total must equal
// the diamond's own digit (position 1's value). `first` remembers that
// target as it is read; `sum` saturates at 10, one past the largest legal
// target (9), once it can only fail.
const hitPointSpec = NFA.encodeSpec({
  startState: { pos: 0, first: null, sum: 0 },
  transition: ({ pos, first, sum }, value) => {
    const newPos = pos + 1;
    const newFirst = pos === 0 ? value : first;
    const hit = value === newPos ? newPos : 0;
    return { pos: newPos, first: newFirst, sum: Math.min(sum + hit, 10) };
  },
  accept: ({ first, sum }) => first !== null && sum === first,
  maxDepth: 8, // longest line (e) has 8 cells
}, 9);
const hitPointLines = lines.map(cells => new NFA(hitPointSpec, 'hit-point', ...cells));

// Diamond self-count: a diamond's own digit d must equal the number of the
// 8 lines (this one included) that contain d anywhere. One NFA per diamond:
// segment 0 is the diamond cell alone, capturing d as `target`; the other 8
// segments are the 8 lines themselves (this diamond's own line included),
// each contributing 1 to `count` iff it contains `target` anywhere. Because
// there is no trailing SEGMENT_BREAK after the final segment, that last
// line's contribution is folded in inside `accept` rather than in a break
// branch. maxDepth = 1 (capture) + 47 (all line cells, 7+3+7+7+8+6+3+6) + 8
// (breaks between the 9 segments) = 56.
const diamondCountSpec = NFA.encodeSpec({
  startState: { phase: 'capture', target: null, count: 0, seenThisSeg: false },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      if (state.phase === 'capture') {
        // End of the capture segment: nothing scored yet.
        return { phase: 'scan', target: state.target, count: 0, seenThisSeg: false };
      }
      // End of a line segment: score it, then reset for the next one.
      const count = Math.min(state.count + (state.seenThisSeg ? 1 : 0), 9);
      return { phase: 'scan', target: state.target, count, seenThisSeg: false };
    }
    if (state.phase === 'capture') {
      return { phase: 'capture', target: value, count: 0, seenThisSeg: false };
    }
    return {
      phase: 'scan',
      target: state.target,
      count: state.count,
      seenThisSeg: state.seenThisSeg || value === state.target,
    };
  },
  accept: (state) => {
    if (state.phase !== 'scan' || state.target === null) return false;
    // Fold in the final (unbroken-after) line segment's contribution.
    const count = Math.min(state.count + (state.seenThisSeg ? 1 : 0), 9);
    return count === state.target;
  },
  maxDepth: 56,
}, 9, { multiSegment: true });
const diamondCounts = lines.map(
  cells => new NFA(diamondCountSpec, 'diamond-line-count', [cells[0]], ...lines));

return [
  new Shape('9x9'),
  new Given('R3C8', 1),
  ...noRepeats,
  ...hitPointLines,
  ...diamondCounts,
];
