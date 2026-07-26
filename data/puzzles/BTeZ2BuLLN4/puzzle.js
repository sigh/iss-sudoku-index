// Title: Gatekeeper
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=BTeZ2BuLLN4
// Source: https://sudokupad.app/pnli3vy6ph

// Normal sudoku rules apply (default 3x3 boxes).
// Along each line, every 3 consecutive digits sum to a multiple of 5. This is
// enforced with an NFA sliding a 2-value memory of the last two digits' sums
// mod 5 (`a`, `b`); once both are populated it checks a+b+newValue against
// the next incoming value, which is exactly the sum of each 3-cell window.
// Black dots require the two digits to be in a 2:1 ratio (native BlackDot).

// Cell lists transcribed from the payload's `lines` entries (each its own
// ordered zig-zag path through cell corners, not an orthogonal run).
const lines = [
  ['R5C4', 'R6C5', 'R5C6'],
  ['R6C4', 'R7C5', 'R6C6'],
  ['R2C2', 'R3C3', 'R4C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8'],
  ['R3C4', 'R4C5', 'R3C6', 'R2C5'],
  ['R6C8', 'R7C7', 'R8C6', 'R9C5', 'R8C4', 'R7C3', 'R6C2'],
  ['R7C4', 'R8C5', 'R7C6'],
  ['R3C1', 'R4C2', 'R5C3'],
  ['R3C9', 'R4C8', 'R5C7'],
  ['R7C1', 'R8C2', 'R8C3'],
  ['R8C7', 'R8C8', 'R7C9'],
];

// Cell pairs transcribed from the payload's `overlays` entries (edge-sized
// filled circles between two orthogonally adjacent cells).
const blackDotPairs = [
  ['R5C4', 'R6C4'],
  ['R5C6', 'R6C6'],
  ['R5C5', 'R6C5'],
  ['R9C2', 'R9C3'],
  ['R9C7', 'R9C8'],
];

const sumMod5Spec = NFA.encodeSpec({
  startState: { a: null, b: null },
  transition: ({ a, b }, value) => {
    const r = value % 5;
    if (a !== null && (a + b + r) % 5 !== 0) return undefined;
    return { a: b, b: r };
  },
  accept: () => true,
}, 9);

const sumMod5Lines = lines.map(
  (cells) => new NFA(sumMod5Spec, 'SumMod5', ...cells));

const blackDots = blackDotPairs.map(
  ([a, b]) => new BlackDot(a, b));

return [
  new Shape('9x9'),
  ...sumMod5Lines,
  ...blackDots,
];
