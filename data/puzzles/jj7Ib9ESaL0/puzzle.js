// Title: BYO Renbanmometers
// Author: Memeristor
// Video: https://www.youtube.com/watch?v=jj7Ib9ESaL0
// Source: https://app.crackingthecryptic.com/sudoku/tgLhMqqHrm

// Rules encoded here:
//   1. Normal sudoku.
//   2. Nine hidden "renbanmometers". Only the endpoints are drawn: a large
//      circle is a bulb, a small circle is a tip, and the in-cell letter names
//      which bulb goes with which tip.
//   3. A renbanmometer is a chain of cells stepping orthogonally or diagonally
//      (king steps) from its bulb to its tip.
//   4. Digits increase from the bulb end and form a non-repeating consecutive
//      sequence, so each cell of the chain holds one more than the cell before
//      it. That caps a chain at 9 cells.
//   5. Renbanmometers never cross: no two chain steps may be the two diagonals
//      of the same 2x2 block.
//   6. Different renbanmometers never share a cell.
// Nothing is omitted.

// The route itself is what the solver must find, so it is carried on three
// whole-grid Var overlays rather than written out as cell lists:
//   VS  the direction of a cell's successor along its chain, or "no successor"
//   VP  the direction of a cell's predecessor, or "no predecessor"
//   VL  which renbanmometer the cell belongs to
// Digits rise by exactly one along VS, so a chain can never revisit a cell and
// no cycle can form: no separate subtour elimination is needed.

const graph = cellGraph('9x9');

// Drawn endpoints. Bulb = the 0.7-width circle, tip = the 0.5-width circle;
// `letter` is the letter printed in the cell, which pairs bulb with tip.
const RENBANS = [
  { code: 1, letter: 'A', bulb: 'R1C4', tip: 'R2C2' },
  { code: 2, letter: 'B', bulb: 'R2C4', tip: 'R4C7' },
  { code: 3, letter: 'C', bulb: 'R3C3', tip: 'R5C5' },
  { code: 4, letter: 'D', bulb: 'R4C2', tip: 'R7C4' },
  { code: 5, letter: 'E', bulb: 'R4C6', tip: 'R6C5' },
  { code: 6, letter: 'F', bulb: 'R5C6', tip: 'R5C4' },
  { code: 7, letter: 'G', bulb: 'R7C9', tip: 'R6C9' },
  { code: 8, letter: 'H', bulb: 'R8C9', tip: 'R7C7' },
  { code: 9, letter: 'I', bulb: 'R9C5', tip: 'R5C3' },
];

// The eight king steps, indexed 1-8; 9 means "no link in this direction".
// The list is symmetric about its centre, so the reverse of step d is 9 - d.
const STEPS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const NONE = 9;
const NW = 1, NE = 3, SW = 6, SE = 8;  // indices of the four diagonal steps
const reverse = (d) => 9 - d;

const succ = graph.makeOverlay('VS');
const pred = graph.makeOverlay('VP');
const label = graph.makeOverlay('VL');

const cells = graph.cells();
const stepFrom = (cell, d) => graph.step(cell, ...STEPS[d - 1]);
const inGridSteps = (cell) =>
  [1, 2, 3, 4, 5, 6, 7, 8].filter(d => stepFrom(cell, d) !== null);

const bulbOf = new Map(RENBANS.map(r => [r.bulb, r]));
const tipOf = new Map(RENBANS.map(r => [r.tip, r]));

// A pointer may only name a direction that stays on the board.
const pointerDomains = cells.flatMap(cell => {
  const dirs = inGridSteps(cell);
  if (dirs.length === 8) return [];  // unrestricted
  return [
    new Given(succ.at(cell), ...dirs, NONE),
    new Given(pred.at(cell), ...dirs, NONE),
  ];
});

// A bulb starts a chain, a tip ends one, and each carries its own letter.
const endpoints = RENBANS.flatMap(r => [
  new Given(label.at(r.bulb), r.code),
  new Given(pred.at(r.bulb), NONE),
  new Given(succ.at(r.bulb), ...inGridSteps(r.bulb)),  // a bulb has a successor
  new Given(label.at(r.tip), r.code),
  new Given(succ.at(r.tip), NONE),
  new Given(pred.at(r.tip), ...inGridSteps(r.tip)),    // a tip has a predecessor
]);

// Away from the drawn endpoints a cell is either off every chain, or strictly
// inside one, so it has a successor exactly when it has a predecessor. Chains
// therefore start only at bulbs and stop only at tips.
const interiorKey = Pair.fnToKey((s, p) => (s === NONE) === (p === NONE), 9);
// An off-chain cell has no renbanmometer to name; pin its label to the first
// code so the layer carries no free choice. This is bookkeeping for the
// overlay, not a puzzle rule.
const unusedLabelKey = Pair.fnToKey((s, l) => s !== NONE || l === RENBANS[0].code, 9);
const interior = cells.filter(c => !bulbOf.has(c) && !tipOf.has(c)).flatMap(cell => [
  new Pair(interiorKey, 'chained both ways or neither', succ.at(cell), pred.at(cell)),
  new Pair(unusedLabelKey, 'unused label', succ.at(cell), label.at(cell)),
]);

// One machine per directed neighbour pair (c, d). Reading
// [VS_c, VP_d, VL_c, VL_d, c, d] it says: c names d as its successor exactly
// when d names c as its predecessor, and when it does, the two cells are on the
// same renbanmometer and d's digit is one more than c's.
const linkSpec = (d) => NFA.encodeSpec({
  startState: 'start',
  transition: (state, value) => {
    switch (state) {
      case 'start':  // VS_c
        return value === d ? 'linked' : 'unlinked';
      case 'unlinked':  // VP_d must not claim c either
        return value === reverse(d) ? undefined : 'skip';
      case 'linked':  // VP_d must point back at c
        return value === reverse(d) ? 'sameLabel' : undefined;
      case 'skip':  // no link: the remaining cells are unconstrained
        return 'skip';
      case 'sameLabel':  // VL_c
        return { label: value };
      case 'rising':  // digit of c
        return { digit: value };
      case 'end':
        return undefined;
      default:
        if (state.label !== undefined) {  // VL_d
          return value === state.label ? 'rising' : undefined;
        }
        return value === state.digit + 1 ? 'end' : undefined;  // digit of d
    }
  },
  accept: (state) => state === 'skip' || state === 'end',
}, 9);
const LINK_SPECS = [1, 2, 3, 4, 5, 6, 7, 8].map(linkSpec);

const links = cells.flatMap(cell =>
  inGridSteps(cell).map(d => {
    const next = stepFrom(cell, d);
    return new NFA(
      LINK_SPECS[d - 1], 'chain link',
      succ.at(cell), pred.at(next),
      label.at(cell), label.at(next),
      cell, next);
  }));

// No crossing: within a 2x2 block the two diagonals may not both be chain
// steps. Either diagonal can be walked from either end, so all four
// combinations are excluded. The template sits on the top-left 2x2 block and is
// stamped onto every other block.
const crossingKey = (a, b) => Pair.fnToKey((x, y) => !(x === a && y === b), 9);
const crossings = succ.makeReplicate(
  [
    // Falling diagonal walked downwards ...
    new Pair(crossingKey(SE, SW), 'no crossing', succ.at('R1C1'), succ.at('R1C2')),
    new Pair(crossingKey(SE, NE), 'no crossing', succ.at('R1C1'), succ.at('R2C1')),
    // ... or upwards.
    new Pair(crossingKey(NW, SW), 'no crossing', succ.at('R2C2'), succ.at('R1C2')),
    new Pair(crossingKey(NW, NE), 'no crossing', succ.at('R2C2'), succ.at('R2C1')),
  ],
  succ.at(cells.filter(cell => graph.block(cell, 2, 2) !== null)));

return [
  new Shape('9x9'),
  new Given('R4C4', 8),
  succ.toVar('successor step'),
  pred.toVar('predecessor step'),
  label.toVar('renbanmometer'),
  ...pointerDomains,
  ...endpoints,
  ...interior,
  ...links,
  crossings,
];
