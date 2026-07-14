// Title: RAT RUN 23: Notable Differences
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=8GJGYDqViy4
// Source: https://sudokupad.app/3pev731294

// Normal sudoku. Finkz and Phinx each run a self-avoiding maze path to the
// cupcake cell; the paths never cross, share cells (except at the cupcake),
// or pass through thick maze walls, and may step diagonally only through an
// open 2x2 space, never diagonally through a round wall-spot on a cell
// corner. BLACKCURRANT: one value is double the other. REDCURRANT: one value
// even, one odd. GRAPE: values differ by at least 5. TEST CONSTRAINT: Finkz
// and Phinx visit the same number of cells; for every N, the Nth cell Finkz
// visits and the Nth cell Phinx visits (before the cupcake) always have the
// same difference, and that difference is the digit in the cupcake cell.
//
// ENCODED HERE (validated against the known solution): normal sudoku plus
// every blackcurrant / redcurrant / grape pair. Each currant sits as a round
// (grape: oval) overlay on the shared edge of two orthogonally adjacent grid
// cells -- a fixed geometric relation between two named cells, independent of
// which cells either rat's path visits.
//
// OMITTED: the two rat maze paths (movement, self-avoidance, non-crossing,
// wall-blocking, the diagonal-through-2x2 / round-wall-spot rule, and
// rat->cupcake connectivity) and the TEST CONSTRAINT, which reads the Nth
// cell of each path in visiting order and ties that pairing's difference to
// the cupcake digit. Per the Rat Run family finding, this is inexpressible:
// the rules explicitly allow diagonal movement through an open 2x2 space, so
// a genuine path's on-path cells need not be orthogonally connected, and
// ISS's ConnectedValues primitive (orthogonal-only) would be unsound here --
// it could reject the true solution. There is also no ISS primitive for
// path-position-indexed comparisons across two solver-discovered paths. This
// is a PARTIAL encoding: it never rejects the true solution but does not pin
// the digits down on its own.

return [
  new Shape('9x9'),

  // Blackcurrants: one value double the other. Native Kropki-style dot.
  new BlackDot('R1C1', 'R2C1'),
  new BlackDot('R5C9', 'R6C9'),
  new BlackDot('R7C9', 'R8C9'),
  new BlackDot('R8C3', 'R8C4'),
  new BlackDot('R8C7', 'R8C8'),
  new BlackDot('R8C1', 'R9C1'),
  new BlackDot('R9C5', 'R9C6'),

  // Redcurrants: one value even, one odd (no native class -- custom Pair).
  ...(() => {
    const oppositeParity = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);
    return [
      new Pair(oppositeParity, 'redcurrant', 'R1C9', 'R2C9'),
      new Pair(oppositeParity, 'redcurrant', 'R6C6', 'R6C7'),
      new Pair(oppositeParity, 'redcurrant', 'R7C3', 'R7C4'),
      new Pair(oppositeParity, 'redcurrant', 'R9C4', 'R9C5'),
    ];
  })(),

  // Grapes: values differ by at least 5.
  new Whisper(5, 'R6C9', 'R7C9'),
  new Whisper(5, 'R1C4', 'R1C5'),
  new Whisper(5, 'R2C7', 'R3C7'),
  new Whisper(5, 'R7C2', 'R7C3'),
];
