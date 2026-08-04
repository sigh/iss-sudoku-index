// Title: Wormholes (Remix)
// Author: Nordy
// Video: https://www.youtube.com/watch?v=JNqUmzOVvOc
// Source: https://app.crackingthecryptic.com/sudoku/rT277BN3dF

// Normal sudoku rules apply (default boxes). Arrows: digits along an arrow
// sum to the digit in that arrow's circle; Arrow permits repeats on the arm,
// which the rules text does not forbid.
//
// Wormholes: index the 9 boxes, and the 9 relative positions within any one
// box, both by (row, col) in {0,1,2}^2. Rules: "A cell in a cage in Box A
// forms a wormhole with the central cell of Box B when the cell's position
// in Box A ... matches the position of Box B in the grid ... Two cells in a
// wormhole relationship both contain the same digit." So for box A and every
// OTHER box B, the one cell of A sitting at B's own (row,col) forms a
// wormhole with B's central cell; whether that pair actually holds (equal
// digit) is not fixed by the geometry, only the pair's existence is. Box A's
// own self-referencing position (matching A's own (row,col)) wormholes into
// A's own centre, which the note excludes from any count ("wormholes that
// look out of that box and into the central cells of OTHER boxes"): so each
// box has up to 8 outward candidate pairs. The corner number in 6 of the 9
// boxes counts how many of that box's outward candidates actually hold; the
// note also confirms a box's total never counts pairs aimed *at* it from
// elsewhere ("A wormhole from another box that looks into the central cell
// of a cage is not counted").
// Boxes TR, the centre box, and BM carry no corner number, so their counts
// are omitted (left unconstrained) below.
//
// Each candidate pair is modelled as one flag Var (1 = equal digit, 2 =
// different) plus a 3-cell NFA reading [source, target, flag] that accepts
// iff the flag correctly reports whether source's digit equals target's; a
// box's corner number is then a plain ContainExact count of its 1-flags.

const boxAbbrev = {
  '0,0': 'TL', '0,1': 'TM', '0,2': 'TR',
  '1,0': 'ML', '1,1': 'MM', '1,2': 'MR',
  '2,0': 'BL', '2,1': 'BM', '2,2': 'BR',
};

const boxCenter = (br, bc) => makeCellId(3 * br + 2, 3 * bc + 2);

// The (up to) 8 outward candidate pairs for box (br, bc): [source, target].
const wormholePairs = (br, bc) => {
  const pairs = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (r === br && c === bc) continue; // self: not "into another box"
      pairs.push([
        makeCellId(3 * br + r + 1, 3 * bc + c + 1),
        boxCenter(r, c),
      ]);
    }
  }
  return pairs;
};

// Reads [source, target, flag]; flag must be 1 iff source's digit equals
// target's digit, else 2. `phase` is the explicit state discriminant.
const eqFlag = NFA.encodeSpec({
  startState: { phase: 'source' },
  transition: (state, value) => {
    if (state.phase === 'source') return { phase: 'target', digit: value };
    if (state.phase === 'target') return { phase: 'flag', eq: value === state.digit };
    return { done: (value === 1) === state.eq };
  },
  accept: (state) => state.done === true,
}, 9);

// Corner numbers, keyed by box (row, col); provenance: the drawn corner
// number in each labelled box.
const wormholeTotals = {
  '0,0': 3, '0,1': 6,
  '1,0': 2, '1,2': 2,
  '2,0': 2, '2,2': 5,
  // '0,2' (top-right), '1,1' (centre), '2,1' (bottom-middle): no corner
  // number drawn -- omitted, that box's count is left unconstrained.
};

const wormholeConstraints = Object.entries(wormholeTotals).flatMap(([key, total]) => {
  const [br, bc] = key.split(',').map(Number);
  const pairs = wormholePairs(br, bc);
  const flags = new Var('WH' + boxAbbrev[key], `box ${boxAbbrev[key]} wormhole flags`, pairs.length);
  const flagCells = flags.cells();
  return [
    flags,
    ...flagCells.map(f => new Given(f, 1, 2)),
    ...pairs.map(([source, target], j) =>
      new NFA(eqFlag, 'wormhole-eq', source, target, flagCells[j])),
    new ContainExact(Array(total).fill(1).join('_'), ...flagCells),
  ];
});

return [
  new Shape('9x9'),
  new Arrow('R4C5', 'R3C5', 'R2C5', 'R1C5'),
  new Arrow('R6C2', 'R7C2', 'R8C1', 'R9C2'),
  new Arrow('R8C5', 'R8C6', 'R7C7', 'R7C8'),
  new Arrow('R5C7', 'R4C8', 'R3C7', 'R2C7'),
  ...wormholeConstraints,
];
