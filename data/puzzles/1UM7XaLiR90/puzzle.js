// Title: Hidden Thermo Sudoku
// Author: Prutsbeest
// Video: https://www.youtube.com/watch?v=1UM7XaLiR90
// Source: https://app.crackingthecryptic.com/sudoku/qF8D7mDRnF

// Rules encoded below:
//   Normal sudoku rules apply.
//   The grid holds 9 hidden thermometers. Along each, digits strictly
//   increase from the bulb to the tip; each thermometer's own cells are
//   unknown to the solver except a bulb dot, a tip dot, or both. Colour pairs
//   a bulb with its tip (drawn dots, transcribed from the puzzle art):
//     deepskyblue bulb R7C5 -> tip R3C5
//     gold        bulb R7C1 -> tip R8C5
//     yellowgreen bulb R5C1 -> tip R5C6
//     red         bulb R5C4 -> tip R5C9
//     chocolate   bulb R2C5 -> tip R3C9
//     grey        bulb unknown -> tip R8C7
//     black       bulb unknown -> tip R2C3
//     purple      two bulbs R9C9, R1C5; two tips R1C1, R9C5 (paired below)
//   Every thermometer is at least two cells long, thermometers cannot cross,
//   and different thermometers cannot share a cell.
// Decode notes:
//   Purple marks 2 bulbs and 2 tips with one colour, so which bulb pairs with
//   which tip is not drawn -- both pairings are encoded as a disjunction
//   (PURPLE_A/PURPLE_B are just labels for "whichever purple thermometer").
//   "Cannot cross" is stated apart from "different thermometers cannot share a
//   cell", so it names a distinct condition; that condition is only
//   meaningful if a thermometer may step diagonally (an orthogonal-only path
//   can never cross another without sharing a cell). Adjacency is therefore
//   modelled as the 8 king-move directions, and "cannot cross" as: no two
//   thermometer edges may occupy the two diagonals of the same 2x2 block.
// Not encoded: nothing -- every clause above is modelled below.

// Two Var overlays carry the discovered thermometer network per cell:
//   VM (member): 0 = no thermometer, 1-9 = which of the 9 thermometers.
//   VD (predecessor direction): 0 = this cell is a bulb (no predecessor),
//     otherwise one of 8 king-move codes naming where this cell's immediate
//     (smaller-digit) predecessor sits. A third overlay VR flags a cell as an
//     actual thermometer bulb (VD=0 and VM!=0), used only to count bulbs.
// The value range is widened to 0-9 so VM/VD/VR (10 and 9 states) fit; real
// grid cells are pinned back to 1-9.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const gridCells = graph.cells();

const VM = graph.makeOverlay('VM');
const VD = graph.makeOverlay('VD');
const VR = graph.makeOverlay('VR');

// King-move direction codes, 1-8, with each direction's opposite (used to
// recognise "this neighbour's predecessor pointer names me").
const DIRS = [
  { code: 1, dr: -1, dc: 0 },  // N
  { code: 2, dr: -1, dc: 1 },  // NE
  { code: 3, dr: 0, dc: 1 },   // E
  { code: 4, dr: 1, dc: 1 },   // SE
  { code: 5, dr: 1, dc: 0 },   // S
  { code: 6, dr: 1, dc: -1 },  // SW
  { code: 7, dr: 0, dc: -1 },  // W
  { code: 8, dr: -1, dc: -1 }, // NW
];
const ALLDIR = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const opposite = (d) => ((d - 1 + 4) % 8) + 1;
const neighboursOf = (cell) => DIRS
  .map((d) => ({ ...d, cell: graph.step(cell, d.dr, d.dc) }))
  .filter((d) => d.cell);
const except = (v) => ALLDIR.filter((x) => x !== v);

// Colour ids. Purple's two physical thermometers get arbitrary ids 8/9; the
// puzzle does not distinguish "which is which", only that both exist.
const SKY = 1, GOLD = 2, GREEN = 3, RED = 4, CHOC = 5, GREY = 6, BLACK = 7,
  PURPLE_A = 8, PURPLE_B = 9;

// Drawn bulb/tip dots (colour-matched pairs), transcribed from the puzzle's
// underlay art: larger circles are bulbs, smaller circles are tips.
const SINGLE_THERMOS = [
  [SKY, 'R7C5', 'R3C5'],
  [GOLD, 'R7C1', 'R8C5'],
  [GREEN, 'R5C1', 'R5C6'],
  [RED, 'R5C4', 'R5C9'],
  [CHOC, 'R2C5', 'R3C9'],
];
const TIP_ONLY = [
  [GREY, 'R8C7'],
  [BLACK, 'R2C3'],
];
const PURPLE_BULBS = ['R9C9', 'R1C5'];
const PURPLE_TIPS = ['R1C1', 'R9C5'];

const BULB_CELLS = new Set([...SINGLE_THERMOS.map(([, b]) => b), ...PURPLE_BULBS]);
const TIP_CELLS = new Set([
  ...SINGLE_THERMOS.map(([, , t]) => t), ...TIP_ONLY.map(([, t]) => t), ...PURPLE_TIPS]);

// ------------------------------------------------------------ colour pins
// Every bulb cell is unconditionally a root (VD=0); every tip cell
// unconditionally has a predecessor (VD != 0) -- both enforced below via
// vdDomain, not repeated here. Known single-thermo colours pin both ends;
// grey/black pin only the tip (their bulb location is for the solver to
// find); purple pins the bulb *cells* to ids 8/9 but leaves the bulb<->tip
// pairing to the Or below.
const colourPins = [
  ...SINGLE_THERMOS.flatMap(([color, bulb, tip]) =>
    [new Given(VM.at(bulb), color), new Given(VM.at(tip), color)]),
  ...TIP_ONLY.map(([color, tip]) => new Given(VM.at(tip), color)),
];

const purplePairing = new Or([
  new And([
    new Given(VM.at('R9C9'), PURPLE_A), new Given(VM.at('R1C1'), PURPLE_A),
    new Given(VM.at('R1C5'), PURPLE_B), new Given(VM.at('R9C5'), PURPLE_B)]),
  new And([
    new Given(VM.at('R9C9'), PURPLE_A), new Given(VM.at('R9C5'), PURPLE_A),
    new Given(VM.at('R1C5'), PURPLE_B), new Given(VM.at('R1C1'), PURPLE_B)]),
]);

// ------------------------------------------------------------- VD domains
// Bulbs: VD forced to 0. Tips: VD forced to a real direction (never 0, so a
// bulb and its tip can never be the same cell -- the length >= 2 rule).
// Every other cell: VD is 0 (off-thermometer filler, see offFiller below) or
// one of its real king-move directions.
const vdDomains = gridCells.map((cell) => {
  const dirs = neighboursOf(cell).map((d) => d.code);
  if (BULB_CELLS.has(cell)) return new Given(VD.at(cell), 0);
  if (TIP_CELLS.has(cell)) return new Given(VD.at(cell), ...dirs);
  return new Given(VD.at(cell), 0, ...dirs);
});

// Off-thermometer cells carry no predecessor: VM=0 => VD=0.
const offFiller = gridCells.map((cell) =>
  new Or([new Given(VM.at(cell), 1, 2, 3, 4, 5, 6, 7, 8, 9), new Given(VD.at(cell), 0)]));

// ------------------------------------------------------- predecessor edges
// Where VD(cell) names a real direction, the named neighbour must be on the
// *same* thermometer and hold a strictly smaller digit -- this is the
// "increase from the bulb" rule, discovered one edge at a time.
const EQ_KEY = Pair.fnToKey((a, b) => a === b, shape);
const GT_KEY = Pair.fnToKey((a, b) => a > b, shape);
const edgeConsistency = gridCells.flatMap((cell) => neighboursOf(cell).map(({ code, cell: nb }) =>
  new Or([
    new Given(VD.at(cell), ...except(code)),
    new And([
      new Pair(EQ_KEY, 'same thermometer', VM.at(cell), VM.at(nb)),
      new Pair(GT_KEY, 'strictly increasing from predecessor', cell, nb),
    ]),
  ])));

// ------------------------------------------------------------------ degree
// For each cell, count how many neighbours name it as their predecessor (its
// "children"). A tip must have none; every other thermometer cell must have
// exactly one (no branching, no dead ends short of the tip); an off cell
// must have none. Combined with edgeConsistency's strict digit increase,
// this rules out both branching and cycles: a directed cycle would need its
// values to increase all the way around, which is impossible, and every
// non-tip cell's mandatory single child forces any chain to terminate only
// at the one cell architecturally allowed to have zero children -- so a
// discovered (grey/black) bulb's chain can only ever reach its own colour's
// pinned tip.
const degreeSpecCache = new Map();
const degreeSpec = (backCodes, required) => {
  const key = `${backCodes.join(',')}:${required}`;
  if (!degreeSpecCache.has(key)) {
    degreeSpecCache.set(key, NFA.encodeSpec({
      startState: { i: 0, on: false, n: 0 },
      transition: (state, v) => {
        if (state.i === 0) return { i: 1, on: v !== 0, n: 0 };
        const n = state.n + (v === backCodes[state.i - 1] ? 1 : 0);
        return n > required ? undefined : { i: state.i + 1, on: state.on, n };
      },
      accept: (state) => state.n === (state.on ? required : 0),
      maxDepth: 1 + backCodes.length,
    }, shape));
  }
  return degreeSpecCache.get(key);
};
const degrees = gridCells.map((cell) => {
  const nbrs = neighboursOf(cell);
  const backCodes = nbrs.map((d) => opposite(d.code));
  const required = TIP_CELLS.has(cell) ? 0 : 1;
  return new NFA(degreeSpec(backCodes, required), 'thermometer child count',
    VM.at(cell), ...nbrs.map((d) => VD.at(d.cell)));
});

// -------------------------------------------------------------- root count
// VR flags an actual bulb (VD=0 and VM!=0); exactly 9 cells may be one,
// matching the 9 thermometers. The 7 drawn bulbs are already pinned to
// VD=0 with a real colour, so this only leaves the search 2 free bulb
// cells -- grey's and black's.
const rootLink = gridCells.map((cell) => new And([
  new Or([new Given(VD.at(cell), ...except(0)), new Given(VM.at(cell), 0), new Given(VR.at(cell), 1)]),
  new Or([new Given(VR.at(cell), 0), new And([new Given(VD.at(cell), 0), new Given(VM.at(cell), 1, 2, 3, 4, 5, 6, 7, 8, 9)])]),
]));
const rootCount = new Sum(9, ...VR.cells());

// -------------------------------------------------------------- crossing
// No two thermometer edges may occupy both diagonals of the same 2x2 block
// (see the decode note above on why diagonal steps are read into the rule).
const crossing = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 8; c++) {
    const a = makeCellId(r, c), b = makeCellId(r, c + 1),
      cc = makeCellId(r + 1, c), d = makeCellId(r + 1, c + 1);
    const notDiag1 = new And([new Given(VD.at(a), ...except(4)), new Given(VD.at(d), ...except(8))]);
    const notDiag2 = new And([new Given(VD.at(b), ...except(6)), new Given(VD.at(cc), ...except(2))]);
    crossing.push(new Or([notDiag1, notDiag2]));
  }
}

return [
  shape,
  VM.toVar('thermometer membership'),
  VD.toVar('predecessor direction'),
  VR.toVar('is a bulb'),
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  ...colourPins,
  purplePairing,
  ...vdDomains,
  ...offFiller,
  ...edgeConsistency,
  ...degrees,
  ...rootLink,
  rootCount,
  ...crossing,
];
