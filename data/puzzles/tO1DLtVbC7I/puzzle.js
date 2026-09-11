// Title: Caterdokupillar
// Author: Much of the setting community
// Video: https://www.youtube.com/watch?v=tO1DLtVbC7I
// Source: https://sudokupad.app/memeristor/smoldokupillar1?setting-nogrid=1&setting-largepuzzle=1

// Seven 6x6 puzzles chained down a shared canvas, each overlapping the next in
// a 2x2 corner block (the "4 digits carry over" of the preamble). Canvas
// coordinates below are [row, column], 1-indexed, of each puzzle's top-left
// cell:
//
//   1. Face of Eternity (theasylm)           [7, 7]    Japanese Sums
//   2. Aperitif (Tallcat)                    [11, 11]  Renban
//   3. Wheels (Alaric Taqi A. / Crusader175) [15, 15]  Wheels
//   4. Arrow Sudoku (Agent)                  [19, 11]  Arrows
//   5. Metamorphosnipe (Philip Newman)       [23, 15]  unknown digit set
//   6. Moon-Sun (Math Pesto)                 [27, 11]  loop + German whispers
//   7. Double or Nothin' (Kennet's Dad)      [31, 15]  garden path lines
//
// ISS caps a single grid at 16x16 (CellGeometry.MAX_SIZE) and the chain spans
// 30 rows, so each 6x6 puzzle is its own full-grid Var overlay (VA..VG) with
// its rows, columns and boxes stated explicitly, and the 24 physically shared
// cells are tied with SameValues. The main grid is a pinned 1x1 placeholder;
// the answer lives in the seven overlays. The shape carries 9 values because
// puzzle 5 draws its digits from 1-9; every other puzzle's cells are pinned
// back to 1-6.
//
// Baseline for all seven: place the digits once each in every row, column and
// box. Boxes are 2 rows x 3 columns everywhere except puzzle 5, whose drawn
// thick walls run after row 3 and after columns 2 and 4 (3 rows x 2 columns).
//
// Per-puzzle rules, encoded below in the same order:
//
//  1. "Japanese Sums: The squares outside the grid indicate the order of the
//     runs of contiguous cells that must be shaded the color of the clue. The
//     number in the square indicates the sum of the cells in the run. All
//     shaded runs are given. Colors used in this puzzle are Green, Red, Black,
//     Yellow."
//  2. "Renban Lines: Digits on a purple line form a set of non-repeating,
//     consecutive digits in any order."
//  3. "Wheels: Digits in a grey circle have to be placed in the same circular
//     order in the four cells that are touched by the circle. The circles
//     might have to be rotated to the correct position by 90, 180 or 270
//     degrees. Digits are allowed to repeat on wheels as normally allowed by
//     other rules."
//  4. "Arrows: A digit in a circle is equal to the sum of the digits on the
//     attached arrow. Digits are allowed to repeat along the arrows as
//     normally allowed by other rules."
//  5. "Select exactly 6 digits from 1-9 and place them exactly once in every
//     row, column and 2x3 box. Multiplicative Arrow: The product of the digits
//     along an arrow is equal to the number in its connected circle or pill.
//     Digits in pills are two digit numbers read left to right or top to
//     bottom."
//  6. "Draw a non-branching, non-intersecting orthogonally traveling loop that
//     visits each box exactly once. Within each box, the loop either passes
//     through all moons and no suns, or all suns and no moons. The loop cannot
//     pass through the same type of clue in two consecutively used regions.
//     The loop acts as a German Whispers line. German Whispers line: Adjacent
//     digits along these lines must have a difference of at least 3."
//  7. "Garden Path Lines: Blue lines are split into segments by box borders.
//     For each line, the sum of one segment will be double the sum of the
//     other segment."
//
// Nothing is omitted. The preamble's "Start in the top left, and as each 6x6
// puzzle is completed, 4 digits will automatically carry over as givens for
// the next puzzle" describes the solving order and the overlap the SameValues
// ties already state; "Read the rules carefully for each puzzle" is
// instruction, not a constraint.

const graph = cellGraph('6x6');

// Canvas coordinates go past column 9, where a written R#C# id would be read
// in the cell-id base and mean a different cell, so every clue below is
// [row, column] and is converted through the owning puzzle's own 6x6 frame.
const GRIDS = [
  { prefix: 'VA', label: '1. Face of Eternity', top: 7, left: 7 },
  { prefix: 'VB', label: '2. Aperitif', top: 11, left: 11 },
  { prefix: 'VC', label: '3. Wheels', top: 15, left: 15 },
  { prefix: 'VD', label: '4. Arrow Sudoku', top: 19, left: 11 },
  { prefix: 'VE', label: '5. Metamorphosnipe', top: 23, left: 15 },
  { prefix: 'VF', label: '6. Moon-Sun', top: 27, left: 11 },
  { prefix: 'VG', label: "7. Double or Nothin'", top: 31, left: 15 },
];
const [A, B, C, D, E, F, G] = GRIDS.map((_, i) => i);
const overlays = GRIDS.map(g => graph.makeOverlay(g.prefix));
const grids = GRIDS.map((g, i) => overlays[i].toVar(g.label));

// The Var cell of puzzle `g` at its own local 1-based (row, col).
const local = (g, row, col) => grids[g].cell(row, col);
// The Var cell of puzzle `g` at a canvas [row, col].
const at = (g, [row, col]) => local(g, row - GRIDS[g].top + 1, col - GRIDS[g].left + 1);
const ats = (g, cells) => cells.map(cell => at(g, cell));

// Puzzle 5's boxes are 3 rows x 2 columns, not the 2x3 of the other six.
const boxesOf = g => g === E
  ? [[1, 1], [1, 3], [1, 5], [4, 1], [4, 3], [4, 5]].map(
    ([row, col]) => overlays[E].block(local(E, row, col), 3, 2))
  : overlays[g].boxes();

const structure = GRIDS.flatMap((_, g) =>
  [...overlays[g].rows(), ...overlays[g].columns(), ...boxesOf(g)]
    .map(cells => new AllDifferent(...cells)));

// Every puzzle but 5 uses the digits 1-6; the shape's other three values exist
// only for puzzle 5's 1-9 alphabet and for the auxiliary layers below.
const digitRanges = GRIDS.flatMap((_, g) =>
  g === E ? [] : overlays[g].cells().map(cell => new Given(cell, 1, 2, 3, 4, 5, 6)));

// Consecutive puzzles share a 2x2 corner block, so the same canvas cell has a
// copy in each. Derived from the origins above rather than listed.
const overlapTies = GRIDS.flatMap((g1, i) => GRIDS.slice(i + 1).flatMap((g2, j) => {
  const g2Index = i + j + 1;
  const ties = [];
  for (let row = Math.max(g1.top, g2.top); row < Math.min(g1.top, g2.top) + 6; row++) {
    for (let col = Math.max(g1.left, g2.left); col < Math.min(g1.left, g2.left) + 6; col++) {
      ties.push(new SameValues(2, at(i, [row, col]), at(g2Index, [row, col])));
    }
  }
  return ties;
}));

// ---------------------------------------------------------------------------
// 1. Face of Eternity -- Japanese Sums
// ---------------------------------------------------------------------------

// A shade code per cell of puzzle 1: unshaded, or one of the four clue colours.
const shades = graph.makeOverlay('VJ');
const shadeCells = shades.toVar('japanese sums shading');
const UNSHADED = 1;
const COLOUR = { G: 2, R: 3, B: 4, Y: 5 };

// Clue sequences transcribed from the coloured squares drawn outside puzzle 1,
// as "<sum><colour>" with the rules' Green / Red / Black / Yellow. Outside
// clues run in the same direction as the line they clue, so a row's squares
// are read left to right and a column's top to bottom -- the square furthest
// from the grid is the first run, the one abutting the grid the last. The six
// row totals and the six column totals both come to 119, so no clue is missing
// or doubled.
const JS_ROWS = [
  ['4G', '8Y', '6G'],
  ['3G', '6B', '7R', '1B', '4G'],
  ['5G', '2R', '10G', '3R', '1G'],
  ['6R', '3Y', '3R', '4Y', '5R'],
  ['2G', '13B', '6G'],
  ['5G', '7B', '5G'],
];
const JS_COLS = [
  ['8G', '6R', '2G'],
  ['4G', '6B', '2R', '3Y', '1B', '5G'],
  ['5Y', '2R', '4G', '1R', '9B'],
  ['3Y', '5R', '6G', '2R', '5B'],
  ['6G', '1B', '3R', '4Y', '5B', '2G'],
  ['5G', '5R', '9G'],
];
const parseClues = clues => clues.map(clue => ({
  sum: parseInt(clue, 10),
  colour: COLOUR[clue.slice(-1)],
}));

// One machine per line, scanning it as shade, digit, shade, digit, ... so that
// a cell's colour and its value are read together.
//
// The state walks the clue list: `i` counts the runs already begun, `acc` is
// the running total of the run in progress (0 when none is), and `pending`
// sits between a shade symbol and the digit that follows it, holding the run
// index that digit adds to, or -1 for an unshaded cell. Two runs of the same
// colour cannot be adjacent -- they would read as a single run -- so a shade
// equal to the run in progress always continues it, while any other shade
// closes that run, which must have reached its clued total exactly, and opens
// the next clue.
const japaneseSums = clues => NFA.encodeSpec({
  startState: { i: 0, acc: 0, pending: null },
  transition: ({ i, acc, pending }, value) => {
    if (pending === null) {
      if (value === UNSHADED) {
        if (acc > 0 && acc !== clues[i - 1].sum) return undefined;
        return { i, acc: 0, pending: -1 };
      }
      if (value > 5) return undefined;   // not a shade code
      if (acc > 0) {
        if (value === clues[i - 1].colour) return { i, acc, pending: i - 1 };
        if (acc !== clues[i - 1].sum) return undefined;
      }
      if (i < clues.length && value === clues[i].colour) {
        return { i: i + 1, acc: 0, pending: i };
      }
      return undefined;
    }
    if (pending === -1) return { i, acc: 0, pending: null };
    const total = acc + value;
    if (total > clues[pending].sum) return undefined;
    return { i, acc: total, pending: null };
  },
  accept: ({ i, acc, pending }) => pending === null && i === clues.length
    && (acc === 0 || acc === clues[clues.length - 1].sum),
}, 9);

const interleave = (digits, marks) => digits.flatMap((cell, k) => [marks[k], cell]);

const japaneseSumsConstraints = [
  ...JS_ROWS.map((clues, k) => new NFA(
    japaneseSums(parseClues(clues)), `japanese sums row ${k + 1}`,
    ...interleave(overlays[A].row(k + 1), shades.row(k + 1)))),
  ...JS_COLS.map((clues, k) => new NFA(
    japaneseSums(parseClues(clues)), `japanese sums column ${k + 1}`,
    ...interleave(overlays[A].column(k + 1), shades.column(k + 1)))),
];

// ---------------------------------------------------------------------------
// 2. Aperitif -- Renban
// ---------------------------------------------------------------------------

const RENBAN_LINES = [
  [[13, 12], [12, 13], [11, 14]],
  [[13, 11], [14, 11], [15, 12]],
  [[14, 13], [13, 14], [13, 15]],
  [[16, 12], [16, 13], [15, 14]],
];
const renbans = RENBAN_LINES.map(line => new Renban(...ats(B, line)));

// ---------------------------------------------------------------------------
// 3. Wheels
// ---------------------------------------------------------------------------

// Each grey circle is inscribed in one cell and carries its digits on the rim,
// at the compass points facing the four cells the circle touches. A quarter
// turn keeps the digits' cyclic order but moves their compass points, so the
// encoding is one branch per turn. A rim point with no digit drawn says
// nothing about the cell it faces.
const CLOCKWISE = ['N', 'E', 'S', 'W'];
const STEP = { N: [-1, 0], E: [0, 1], S: [1, 0], W: [0, -1] };
const WHEELS = [
  { centre: [16, 18], rim: { N: 3, E: 2, W: 5 } },
  { centre: [18, 16], rim: { N: 2, E: 6, W: 4 } },
  { centre: [19, 19], rim: { N: 6, W: 4 } },
];
const wheels = WHEELS.map(({ centre, rim }) => {
  const touched = CLOCKWISE.map(
    dir => at(C, [centre[0] + STEP[dir][0], centre[1] + STEP[dir][1]]));
  return new Or([0, 1, 2, 3].map(turn => new And(
    Object.entries(rim).map(([dir, digit]) => new Given(
      touched[(CLOCKWISE.indexOf(dir) + turn) % 4], digit)))));
});

// ---------------------------------------------------------------------------
// 4. Arrow Sudoku
// ---------------------------------------------------------------------------

// [bulb, ...arm] for each drawn arrow.
const ARROWS = [
  [[20, 12], [21, 13], [21, 14]],
  [[22, 16], [23, 15], [24, 14]],
  [[20, 11], [21, 11], [22, 11]],
  [[22, 13], [23, 12]],
  [[23, 14], [24, 13]],
];
const arrows = ARROWS.map(cells => new Arrow(...ats(D, cells)));

// ---------------------------------------------------------------------------
// 5. Metamorphosnipe -- unknown 6-digit set, multiplicative arrows
// ---------------------------------------------------------------------------

// Six of the digits 1-9, the same six in every house. Each row is already a
// 6-cell all-different set, so requiring the six rows to hold equal sets fixes
// one alphabet for the whole grid; the columns and boxes follow, being 6-cell
// all-different subsets of that alphabet.
const unknownDigitSet = new SameValues(6, ...overlays[E].rows().flat());

// The product machine reads the total first -- one circle digit, or a pill's
// two digits most significant first -- then divides it down by each arm digit
// in turn, so the state is only the part of the total still to be accounted
// for. A total that does not divide exactly is rejected as it is read.
const productArrow = pillLength => NFA.encodeSpec({
  startState: { read: 0, rest: 0, divided: false },
  transition: ({ read, rest, divided }, value) => {
    if (read < pillLength) {
      return { read: read + 1, rest: rest * 10 + value, divided };
    }
    if (rest % value !== 0) return undefined;
    return { read, rest: rest / value, divided: true };
  },
  accept: ({ rest, divided }) => divided && rest === 1,
}, 9);

// [[total cells], [arm cells]]; a two-cell total is a pill, read left to right.
const PRODUCT_ARROWS = [
  [[[28, 20]], [[27, 20], [26, 20], [25, 19]]],
  [[[27, 16], [27, 17]], [[28, 18], [28, 19]]],
  [[[23, 18], [23, 19]], [[24, 18], [25, 17], [25, 16]]],
];
const productArrows = PRODUCT_ARROWS.map(([total, arm], k) => new NFA(
  productArrow(total.length), `multiplicative arrow ${k + 1}`,
  ...ats(E, total), ...ats(E, arm)));

// ---------------------------------------------------------------------------
// 6. Moon-Sun Caterdokupillar -- loop through the boxes
// ---------------------------------------------------------------------------

// The loop is carried on its edges: one Var per interior edge of puzzle 6,
// OFF or ON. VH(r, c) is the edge between (r, c) and (r, c+1); VV(r, c) is the
// edge between (r, c) and (r+1, c).
const OFF = 1;
const ON = 2;
const hEdges = new Var('H', 'horizontal loop edges', '6x5');
const vEdges = new Var('V', 'vertical loop edges', '5x6');
const hEdge = (row, col) => hEdges.cell(row, col);
const vEdge = (row, col) => vEdges.cell(row, col);
const EDGES = [];
for (let row = 1; row <= 6; row++) {
  for (let col = 1; col <= 5; col++) {
    EDGES.push({ cell: hEdge(row, col), a: [row, col], b: [row, col + 1] });
  }
}
for (let row = 1; row <= 5; row++) {
  for (let col = 1; col <= 6; col++) {
    EDGES.push({ cell: vEdge(row, col), a: [row, col], b: [row + 1, col] });
  }
}
const edgesAt = (row, col) => EDGES.filter(
  e => (e.a[0] === row && e.a[1] === col) || (e.b[0] === row && e.b[1] === col));

// Loop membership per cell, so the moon/sun rule has something to name.
const onLoop = graph.makeOverlay('VM');
const onLoopCells = onLoop.toVar('loop membership');

// A cell is on the loop exactly when two of its interior edges are used, and
// off it when none are: nothing else is a non-branching, non-intersecting
// line. The membership flag is read first, then the cell's own edges.
const degree = edgeCount => NFA.encodeSpec({
  startState: { member: null, used: 0 },
  transition: ({ member, used }, value) => {
    if (value !== OFF && value !== ON) return undefined;
    if (member === null) return { member: value, used: 0 };
    const next = used + (value === ON ? 1 : 0);
    if (next > 2) return undefined;
    return { member, used: next };
  },
  accept: ({ member, used }) => member !== null
    && (member === ON ? used === 2 : used === 0),
  maxDepth: edgeCount + 1,
}, 9);

const loopDegree = [];
for (let row = 1; row <= 6; row++) {
  for (let col = 1; col <= 6; col++) {
    const incident = edgesAt(row, col);
    loopDegree.push(new NFA(
      degree(incident.length), `loop degree ${row},${col}`,
      onLoopCells.cell(row, col), ...incident.map(e => e.cell)));
  }
}

// All four edges of a 2x2 block used is a closed four-cell circuit: each of
// those cells already has its two edges, so nothing else can join them. The
// loop the rules ask for runs through all six boxes and is therefore longer
// than four cells, so the pattern can never be part of it -- which lets this
// exclude the only circuit small enough to hide inside a single box and so
// leave that box's border crossings untouched.
const noFourLoop = NFA.encodeSpec({
  startState: { used: 0 },
  transition: ({ used }, value) => {
    if (value !== OFF && value !== ON) return undefined;
    return { used: used + (value === ON ? 1 : 0) };
  },
  accept: ({ used }) => used < 4,
  maxDepth: 4,
}, 9);
const noFourLoops = [];
for (let row = 1; row <= 5; row++) {
  for (let col = 1; col <= 5; col++) {
    noFourLoops.push(new NFA(
      noFourLoop, `no 2x2 circuit ${row},${col}`,
      hEdge(row, col), hEdge(row + 1, col), vEdge(row, col), vEdge(row, col + 1)));
  }
}

// The six boxes of puzzle 6, by local top-left cell, and the edges leaving each.
const BOXES = [[1, 1], [1, 4], [3, 1], [3, 4], [5, 1], [5, 4]];
const inBox = ([row, col], b) => {
  const [top, left] = BOXES[b];
  return row >= top && row < top + 2 && col >= left && col < left + 3;
};
const boxBorder = b => EDGES.filter(e => inBox(e.a, b) !== inBox(e.b, b));

// "Visits each box exactly once": the loop crosses each box's border exactly
// twice, so its cells inside that box form one run, in and out again.
const boxCrossings = BOXES.map((_, b) => {
  const border = boxBorder(b);
  return new Sum(border.length + 2, ...border.map(e => e.cell));
});

// Which pairs of boxes the loop steps between. The pairs are the seven
// adjacencies of the 3 x 2 arrangement of boxes.
const BOX_PAIRS = [[0, 1], [2, 3], [4, 5], [0, 2], [2, 4], [1, 3], [3, 5]];
const boxLinks = new Var('P', 'box links', BOX_PAIRS.length);
const sharedEdges = ([b1, b2]) => EDGES.filter(
  e => (inBox(e.a, b1) && inBox(e.b, b2)) || (inBox(e.a, b2) && inBox(e.b, b1)));

// The link flag is read first and then the edges the two boxes share: the flag
// is ON exactly when the loop uses one of them.
const linkFlag = edgeCount => NFA.encodeSpec({
  startState: { flag: null, any: false },
  transition: ({ flag, any }, value) => {
    if (value !== OFF && value !== ON) return undefined;
    if (flag === null) return { flag: value, any: false };
    return { flag, any: any || value === ON };
  },
  accept: ({ flag, any }) => flag !== null && (flag === ON) === any,
  maxDepth: edgeCount + 1,
}, 9);

const boxLinkFlags = BOX_PAIRS.map((pair, k) => {
  const shared = sharedEdges(pair);
  return new NFA(
    linkFlag(shared.length), `box link ${pair[0] + 1}-${pair[1] + 1}`,
    boxLinks.cell(k + 1), ...shared.map(e => e.cell));
});

// Each box is stepped to and from two *different* boxes. Together with every
// box's border being crossed exactly twice, that rules out a circuit shuttling
// between one pair of boxes through their two shared edges, and leaves the six
// boxes with a 2-regular simple link graph. On this bipartite 3 x 2
// arrangement such a graph can only be a single six-box cycle, so the drawn
// figure is one loop rather than several.
const boxLinkCounts = BOXES.map((_, b) => {
  const incident = BOX_PAIRS
    .map((pair, k) => ({ pair, cell: boxLinks.cell(k + 1) }))
    .filter(({ pair }) => pair.includes(b));
  return new Sum(incident.length + 2, ...incident.map(({ cell }) => cell));
});

// One clue type per box: the loop takes all of that type and none of the other.
const MOON = 1;
const SUN = 2;
const boxTypes = new Var('T', 'box clue types', BOXES.length);
const MOONS = [[27, 14], [28, 12], [29, 13], [29, 16], [30, 15], [31, 13], [32, 14]];
const SUNS = [[27, 13], [28, 14], [29, 14], [30, 11], [30, 13], [31, 14], [32, 11]];

// The clue is on the loop exactly when its box's type is the clue's own type.
const takesType = type => Pair.fnToKey(
  (boxType, member) => (boxType === type) === (member === ON), 9);
const clueMembership = [
  ...MOONS.map(cell => [cell, MOON, 'moon on loop']),
  ...SUNS.map(cell => [cell, SUN, 'sun on loop']),
].map(([[row, col], type, name]) => {
  const localRow = row - GRIDS[F].top + 1;
  const localCol = col - GRIDS[F].left + 1;
  const box = BOXES.findIndex((_, b) => inBox([localRow, localCol], b));
  return new Pair(
    takesType(type), name,
    boxTypes.cell(box + 1), onLoopCells.cell(localRow, localCol));
});

// Consecutively visited boxes cannot share a clue type.
const alternatingTypes = BOX_PAIRS.map(([b1, b2], k) => new Or([
  new Given(boxLinks.cell(k + 1), OFF),
  new AllDifferent(boxTypes.cell(b1 + 1), boxTypes.cell(b2 + 1)),
]));

// The loop is a German whispers line, so the rule binds the cell pairs the
// loop steps between, which is exactly the used edges.
const loopWhispers = EDGES.map(e => new Or([
  new Given(e.cell, OFF),
  new Whisper(3, local(F, e.a[0], e.a[1]), local(F, e.b[0], e.b[1])),
]));

const loopDomains = [
  ...hEdges.cells().map(cell => new Given(cell, OFF, ON)),
  ...vEdges.cells().map(cell => new Given(cell, OFF, ON)),
  ...onLoopCells.cells().map(cell => new Given(cell, OFF, ON)),
  ...boxLinks.cells().map(cell => new Given(cell, OFF, ON)),
  ...boxTypes.cells().map(cell => new Given(cell, MOON, SUN)),
];

// ---------------------------------------------------------------------------
// 7. Double or Nothin' -- garden path lines
// ---------------------------------------------------------------------------

// Each blue line, in drawn order. The third and fourth are separate strokes
// that both end inside [34, 19] rather than meeting there, and each splits
// into the two segments the rule speaks of; read as one line they would give
// three segments and the rule would have nothing to say.
const GARDEN_LINES = [
  [[32, 15], [32, 16], [33, 16], [33, 17]],
  [[34, 16], [34, 17], [34, 18]],
  [[32, 19], [33, 20], [34, 20], [34, 19]],
  [[34, 19], [35, 19]],
  [[36, 19], [35, 18], [36, 17], [35, 16]],
  [[31, 17], [32, 17], [32, 18], [31, 18]],
];
const gardenBox = ([row, col]) => {
  const localRow = row - GRIDS[G].top + 1;
  const localCol = col - GRIDS[G].left + 1;
  return `${Math.ceil(localRow / 2)},${Math.ceil(localCol / 3)}`;
};
const gardenPaths = GARDEN_LINES.map(line => {
  const boxes = [...new Set(line.map(gardenBox))];
  const [first, second] = boxes.map(
    box => ats(G, line.filter(cell => gardenBox(cell) === box)));
  return new Or([
    new Sum(0, ...first, ...second.map(cell => [cell, -2])),
    new Sum(0, ...second, ...first.map(cell => [cell, -2])),
  ]);
});

return [
  new Shape('1x1', 9),
  new Given('R1C1', 1),
  ...grids,
  shadeCells,
  onLoopCells,
  hEdges,
  vEdges,
  boxLinks,
  boxTypes,
  ...structure,
  ...digitRanges,
  ...overlapTies,
  ...shadeCells.cells().map(cell => new Given(cell, UNSHADED, ...Object.values(COLOUR))),
  ...japaneseSumsConstraints,
  ...renbans,
  ...wheels,
  ...arrows,
  unknownDigitSet,
  ...productArrows,
  ...loopDomains,
  ...loopDegree,
  ...noFourLoops,
  ...boxCrossings,
  ...boxLinkFlags,
  ...boxLinkCounts,
  ...clueMembership,
  ...alternatingTypes,
  ...loopWhispers,
  ...gardenPaths,
];
