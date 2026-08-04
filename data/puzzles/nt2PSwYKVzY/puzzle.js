// Title: Boston Marathon
// Author: FigoHarr
// Video: https://www.youtube.com/watch?v=nt2PSwYKVzY
// Source: https://app.crackingthecryptic.com/sudoku/bbJb3DpG8M

// Normal sudoku (default 9x9 rows/cols/boxes).
// Coloured "subway" lines:
//   green:  adjacent cells differ by >= 5 (Whisper(5)).
//   blue:   equal sum per box segment (RegionSumLine).
//   orange: consecutive non-repeating set, any order (Renban).
//   red:    every digit used on the line appears exactly twice (no
//           dedicated class; see the per-digit NFA below).
// The green line is drawn as four strokes that branch/share a trunk; each
// stroke is encoded as its own Whisper over the drawn cell order, per the
// drawn segment (stroke "c"'s back half duplicates stroke "a" cell-for-cell,
// so its trailing edges restate constraints stroke "a" already states).
//
// Kropki/XV: "all such connections between orthogonally connected lines of
// different colors are given." Every edge between two orthogonally adjacent
// cells whose sets of covering line-colours differ is either one of the 8
// drawn white-dot/X marks, or explicitly carries none of the four relations
// (white dot/black dot/X/V) -- see the negative Pair block below. The 19
// unmarked edges and the 8 marked ones were enumerated from the drawn line
// geometry, not from the solution. No black dots and no "V" marks are drawn
// anywhere in this puzzle.
//
// The grey cell (R9C9) holds an odd digit.

const green = [
  ['R8C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5'],
  ['R6C5', 'R5C6', 'R4C6', 'R3C6', 'R2C6', 'R1C5'],
  ['R3C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R8C1'],
  ['R6C1', 'R6C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6'],
];

const orange = ['R1C7', 'R2C7', 'R3C7', 'R4C7', 'R5C7', 'R6C6', 'R7C5', 'R8C4', 'R9C3'];

const blue = ['R2C4', 'R3C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9'];

const red = ['R1C3', 'R2C3', 'R3C4', 'R4C5', 'R5C6', 'R6C7', 'R7C8', 'R8C8', 'R9C8', 'R9C9'];

// Every value on the red line appears 0 or 2 times: one small NFA per
// candidate digit, each just counting occurrences of that one digit
// (clamped at 3) and accepting on a final count of 0 or 2. Splitting into
// one NFA per digit (rather than one histogram machine tracking all nine
// counts at once) keeps each machine's state space tiny.
const redRepeats = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => {
  const spec = NFA.encodeSpec({
    startState: { count: 0 },
    transition: ({ count }, value) =>
      ({ count: Math.min(count + (value === digit ? 1 : 0), 3) }),
    accept: ({ count }) => count === 0 || count === 2,
  }, 9);
  return new NFA(spec, `red-repeat-${digit}`, ...red);
});

const whiteDots = [
  ['R3C5', 'R3C6'],
  ['R4C5', 'R4C6'],
  ['R6C5', 'R6C6'],
  ['R2C3', 'R2C4'],
  ['R2C4', 'R3C4'],
].map(cells => new WhiteDot(...cells));

const xMarks = [
  ['R4C4', 'R4C5'],
  ['R2C7', 'R2C8'],
  ['R5C5', 'R5C6'],
].map(cells => new X(...cells));

// None of: consecutive, 1:2 ratio, sum to 10, sum to 5.
const noKropkiXVKey = Pair.fnToKey(
  (a, b) => a !== b + 1 && b !== a + 1 && a !== 2 * b && b !== 2 * a &&
    a + b !== 10 && a + b !== 5,
  9);
const unmarkedCrossColourEdges = [
  ['R2C2', 'R2C3'], ['R2C3', 'R3C3'], ['R2C6', 'R2C7'], ['R2C7', 'R3C7'],
  ['R3C3', 'R3C4'], ['R3C4', 'R3C5'], ['R3C4', 'R4C4'], ['R3C5', 'R4C5'],
  ['R3C6', 'R3C7'], ['R3C6', 'R4C6'], ['R3C7', 'R4C7'], ['R4C5', 'R5C5'],
  ['R4C6', 'R4C7'], ['R4C6', 'R5C6'], ['R5C6', 'R5C7'], ['R5C6', 'R6C6'],
  ['R5C7', 'R6C7'], ['R6C5', 'R7C5'], ['R6C6', 'R6C7'],
].map(([a, b]) => new Pair(noKropkiXVKey, 'no-kropki-xv', a, b));

return [
  new Shape('9x9'),
  new Given('R9C9', 1, 3, 5, 7, 9),
  ...green.map(cells => new Whisper(5, ...cells)),
  new Renban(...orange),
  new RegionSumLine(...blue),
  ...redRepeats,
  ...whiteDots,
  ...xMarks,
  ...unmarkedCrossColourEdges,
];
