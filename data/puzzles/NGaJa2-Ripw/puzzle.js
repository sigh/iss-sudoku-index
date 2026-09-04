// Title: All Black and White
// Author: PhyDraLey
// Video: https://www.youtube.com/watch?v=NGaJa2-Ripw
// Source: https://sudokupad.app/dej1r7id27

// Every cell is a raw binary digit (0 or 1); rows and columns repeat
// digits, so this is a Raw grid, not a Sudoku one.
const shape = new Shape('9x9', '0-1', 'Raw');
const graph = cellGraph(shape);

// Each row (and, separately, each column) is the binary representations of
// 0,1,2,3,4 -- "0","1","10","11","100" -- concatenated in some order, with
// the split points undiscovered. The five lengths (1+1+2+2+3) sum to 9, so
// each row/column is exactly one such concatenation with nothing left over.
//
// NFA state: `used` is a bitmask of which of the five numbers have been
// completed (bit i = number i), `phase` is how many bits of the current,
// not-yet-finished number have been read. Only "1","10","11","100" share a
// prefix (all start with a "1" bit; "10" and "100" also share "10"), so a
// "1" bit at phase 0 branches into "number 1, done" and "start of a longer
// number", and a "0" bit at phase 1 branches into "number 2 ('10'), done"
// and "still building toward 4 ('100')". Every other bit is forced. Accept
// only once all five numbers are used and no partial number is pending.
const segmentSpec = {
  startState: { used: 0, phase: 0 },
  transition: ({ used, phase }, value) => {
    if (phase === 0) {
      if (value === 0) {
        // Only "0" (number 0) starts with a 0 bit.
        if (used & 1) return undefined;
        return { used: used | 1, phase: 0 };
      }
      // A 1 bit at a number boundary: either number 1 on its own, or the
      // first bit of "10"/"11"/"100".
      const branches = [];
      if (!(used & 2)) branches.push({ used: used | 2, phase: 0 });
      branches.push({ used, phase: 1 });
      return branches;
    }
    if (phase === 1) {
      if (value === 0) {
        // "10" so far: either number 2 on its own, or the first two bits
        // of "100".
        const branches = [];
        if (!(used & 4)) branches.push({ used: used | 4, phase: 0 });
        branches.push({ used, phase: 2 });
        return branches;
      }
      // "11" can only be number 3.
      if (used & 8) return undefined;
      return { used: used | 8, phase: 0 };
    }
    // phase === 2: "10" read, only a final 0 bit completes "100" (number 4).
    if (value === 0) {
      if (used & 16) return undefined;
      return { used: used | 16, phase: 0 };
    }
    return undefined;
  },
  accept: ({ used, phase }) => used === 0b11111 && phase === 0,
};
// Pass the Shape (not a bare number) so the compiled NFA reads the grid's
// own 0/1 values instead of assuming a 1-indexed alphabet.
const segmentNFA = NFA.encodeSpec(segmentSpec, shape);

const rowSegments = graph.rows().map(
  row => new NFA(segmentNFA, 'row-binary', ...row));
const colSegments = graph.columns().map(
  col => new NFA(segmentNFA, 'col-binary', ...col));

// Kropki white dots: consecutive digits. Restated over {0,1}, adjacent
// cells differ (from the payload's edge-anchored white/black-border marks;
// no black-filled dots are drawn, matching the rules naming only white).
const whiteDots = [
  ['R1C6', 'R1C7'], ['R1C7', 'R1C8'], ['R1C8', 'R1C9'],
  ['R5C5', 'R5C6'], ['R3C1', 'R4C1'], ['R5C1', 'R6C1'],
  ['R2C7', 'R3C7'], ['R2C8', 'R3C8'], ['R2C9', 'R3C9'],
  ['R5C6', 'R6C6'], ['R9C8', 'R9C9'],
].map(cells => new WhiteDot(...cells));

// Grey palindrome lines.
const palindromes = [
  ['R8C4', 'R9C4'],
  ['R1C2', 'R2C2'],
  ['R5C3', 'R6C3', 'R7C3'],
].map(cells => new Palindrome(...cells));

// Arrows: first cell is the circle (sum target, a normal grid cell), the
// rest is the shaft.
const arrows = [
  ['R3C4', 'R4C5', 'R5C5', 'R6C5', 'R7C4'],
  ['R5C4', 'R5C3', 'R5C2', 'R5C1'],
  ['R3C5', 'R4C4', 'R4C3', 'R3C3'],
  ['R7C6', 'R8C7', 'R9C7'],
].map(cells => new Arrow(...cells));

return [
  shape,
  new Given('R1C1', 0),
  ...rowSegments,
  ...colSegments,
  ...whiteDots,
  ...palindromes,
  ...arrows,
];
