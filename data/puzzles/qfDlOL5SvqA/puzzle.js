// Title: Archery Target
// Author: Nahileon
// Video: https://www.youtube.com/watch?v=qfDlOL5SvqA
// Source: https://app.crackingthecryptic.com/sudoku/Hdpt6h9nBt

// Rules encoded here:
//   1. Normal sudoku.
//   2. The grey line in the central box is a thermometer: digits increase from
//      the bulb to the tip, and the positions of the bulb and the tip are
//      hidden.
//   3. In the outer three rings, the sum of the digits along a ring between two
//      9s is always the same throughout the puzzle. Two 9s may be the same 9
//      when a ring holds only one.
// The coloured cell shading is what draws the rings; it carries no other rule,
// and the bullseye R5C5 lies in no ring. Nothing is omitted.

const shape = new Shape('9x9', '0-15');
const graph = cellGraph(shape);

// A segment total can reach the seventies, far past a single cell's alphabet,
// so it is carried as two base-16 digits (high, low) on Var overlays and read
// back with coefficient sums. The board keeps the real 1-9 alphabet; 0 exists
// only so a Var can hold a zero digit.
const givens = { R2C8: 5, R7C6: 7, R8C1: 3 };
const digits = [
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  ...Object.entries(givens).map(([cell, value]) => new Given(cell, value)),
];

// --- Thermometer -----------------------------------------------------------
// The line's waypoints trace a square through the eight non-centre cells of
// box 5 and return to their start, so the drawn thermometer is a closed ring.
// A closed ring means the bulb and the tip are neighbours on it: the digits
// climb all the way round from the bulb to the cell just before it. Which cell
// is the bulb, and which way round the climb runs, are both hidden, so the
// encoding disjoins over all eight cut points in both directions.
const thermoRing = [
  'R4C6', 'R4C5', 'R4C4', 'R5C4', 'R6C4', 'R6C5', 'R6C6', 'R5C6'];
const rotations = cells => cells.map(
  (_, i) => [...cells.slice(i), ...cells.slice(0, i)]);
const thermo = new Or([
  ...rotations(thermoRing),
  ...rotations([...thermoRing].reverse()),
].map(order => new Thermo(...order)));

// --- Rings -----------------------------------------------------------------
// The underlays shade four concentric bands of the board: 32 cells around the
// 9x9 border, 24 around the 7x7 border, 16 around the 5x5 border and the 8
// around box 5's centre. "The outer three rings" are the first three of those,
// listed here in ring order (clockwise from the top-left corner) because the
// rule reads the digits as they run round the band.
const ring = inset => {
  const lo = 1 + inset;
  const hi = 9 - inset;
  const range = (a, b) => Array.from(
    { length: Math.abs(b - a) + 1 }, (_, i) => a + Math.sign(b - a) * i);
  return [
    ...range(lo, hi).map(c => makeCellId(lo, c)),
    ...range(lo + 1, hi).map(r => makeCellId(r, hi)),
    ...range(hi - 1, lo).map(c => makeCellId(hi, c)),
    ...range(hi - 1, lo + 1).map(r => makeCellId(r, lo)),
  ];
};
const rings = [ring(0), ring(1), ring(2)];

// Var layout. VS holds the common segment total S as 16*VS1 + VS2. VA/VB hold,
// for every ring cell in turn, the total still owed by the arc that cell sits
// in: 16*VA + VB is S minus the digits of that arc up to and including this
// cell, and is S again at a 9. VE marks a ring that holds no 9 at all, where
// "between two 9s" names nothing and the rule says nothing.
const totalVar = new Var('S', 'common arc total, as 16*VS1 + VS2', 2);
const numRingCells = rings.reduce((n, cells) => n + cells.length, 0);
const owedHigh = new Var('A', 'arc total still owed, high base-16 digit', numRingCells);
const owedLow = new Var('B', 'arc total still owed, low base-16 digit', numRingCells);
const noNine = new Var('E', 'ring holds no 9', rings.length);

const ringIndex = rings.map((cells, r) => {
  const before = rings.slice(0, r).reduce((n, c) => n + c.length, 0);
  return cells.map((_, i) => before + i + 1);
});
const hi = i => owedHigh.cell(i);
const lo = i => owedLow.cell(i);
const exempt = r => noNine.cell(r + 1);

// Walking a ring, the owed total drops by each digit passed and is reset to S
// by each 9; requiring it to be exactly 0 on the cell before a 9 is what makes
// every arc total S. The chain is stated cyclically -- cell 1's predecessor is
// the last cell of the ring -- which is what closes the arc that straddles the
// start of the list, including the whole-ring arc of a ring with a single 9.
// A ring with no 9 admits no such chain at all (the owed total would have to
// fall for ever), so that case is the separate VE branch.
const ringChain = rings.flatMap((cells, r) => cells.map((cell, i) => {
  const n = cells.length;
  const cur = ringIndex[r][i];
  const prev = ringIndex[r][(i + n - 1) % n];
  return new Or([
    // A 9: it closes the previous arc (nothing left owed) and opens a new one.
    new And([
      new Given(exempt(r), 0),
      new Given(cell, 9),
      new Given(hi(prev), 0), new Given(lo(prev), 0),
      new SameValues(2, hi(cur), totalVar.cell(1)),
      new SameValues(2, lo(cur), totalVar.cell(2)),
    ]),
    // Not a 9: this digit is spent out of the arc's remaining total.
    new And([
      new Given(exempt(r), 0),
      new Given(cell, 1, 2, 3, 4, 5, 6, 7, 8),
      new Sum(0,
        [hi(prev), 16], [lo(prev), 1], [cell, -1],
        [hi(cur), -16], [lo(cur), -1]),
    ]),
    // Ring holds no 9: nothing to constrain, and the owed totals are pinned so
    // the exempt branch carries no free state.
    new And([
      new Given(exempt(r), 1),
      new Given(cell, 1, 2, 3, 4, 5, 6, 7, 8),
      new Given(hi(cur), 0), new Given(lo(cur), 0),
    ]),
  ]);
}));

return [
  shape,
  totalVar,
  owedHigh,
  owedLow,
  noNine,
  ...rings.map((_, r) => new Given(exempt(r), 0, 1)),
  ...digits,
  thermo,
  ...ringChain,
];
