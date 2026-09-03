// Title: The Python
// Author: ICHTUES
// Video: https://www.youtube.com/watch?v=gtQzk9W1fZQ
// Source: https://app.crackingthecryptic.com/sudoku/RR8mDPLDJJ

// Rules encoded below:
//   Normal sudoku, with no given digits. A 1-cell-wide python -- an orthogonal
//   path -- begins and ends at the two red cells and never touches itself, not
//   even diagonally. Its digits form a palindrome whose midpoint is the purple
//   cell. The nine grey stones are off the python and each counts the
//   non-python cells of the 3x3 block centred on itself, itself included; the
//   nine stone digits are all different. Each of the seven blue cells counts
//   the python cells of its own 3x3 block, itself included, and may itself be
//   python. Every cell that carries no colour must fail both count clues:
//   otherwise it would be an undrawn stone or an undrawn blue cell ("ALL
//   possible coloured cells are given").
// Nothing is omitted. The exhaustiveness clause is applied to the 62 uncoloured
// cells only: a cell already drawn in one colour cannot also be drawn in
// another, so the clause makes no claim about the 19 coloured cells.
//
// Two cells 90 degrees apart at a turn of an orthogonal path are always
// diagonally adjacent, so "may not touch itself, even diagonally" is read as:
// no 2x2 block holds one diagonal pair of python cells and neither of the
// other two.

const ON = 1;
const OFF = 2;
const NO_LEVEL = 9;   // VH/VL value for a cell that is off the python
const BASE = 6;       // level K = BASE * (VH - 1) + VL
// No 2x2 block holds four python cells (a fourth would close a 4-cycle), so
// the sixteen disjoint 2x2 blocks over rows 1-8 and columns 1-8 hold at most
// 48 of them, and with row 9 and column 9 the python is at most 65 cells long.
// A level is a position counted from one end, so it runs to (65 + 1) / 2 = 33.
const MAX_LEVEL = 33;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const python = graph.makeOverlay('VS');
const levelHigh = graph.makeOverlay('VH');
const levelLow = graph.makeOverlay('VL');

// Drawn art: the nineteen full-cell 1x1 underlays, by fill colour.
const ENDS = ['R2C7', 'R8C9'];                                       // #E6261F
const MIDPOINT = 'R4C3';                                             // #D23BE7
const STONES = [
  'R2C2', 'R2C3', 'R4C8', 'R5C2', 'R6C1', 'R7C7', 'R7C8', 'R8C7', 'R9C9',
];                                                                   // #CFCFCF
const BLUE = ['R1C5', 'R1C7', 'R3C2', 'R3C6', 'R3C8', 'R5C4', 'R7C9'];  // #34BBE6
const coloured = new Set([...ENDS, MIDPOINT, ...STONES, ...BLUE]);

// --- Python shape ----------------------------------------------------------

// Membership is ON/OFF, so a cell with d orthogonal neighbours of which k are
// python has neighbour Sum 2*d - k. The red cells are the only degree-one
// cells; every other python cell has degree two. Degree plus a single
// connected ON region is exactly one simple path between the red cells.
const degreeRules = gridCells.map(cell => {
  const neighbours = python.at(graph.neighbours(cell));
  const base = 2 * neighbours.length;
  if (ENDS.includes(cell)) {
    return new And([
      new Given(python.at(cell), ON),
      new Sum(base - 1, ...neighbours),
    ]);
  }
  return new Or([
    new Given(python.at(cell), OFF),
    new And([
      new Given(python.at(cell), ON),
      new Sum(base - 2, ...neighbours),
    ]),
  ]);
});

// A 2x2 block holding just one diagonal pair is a diagonal self-touch.
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { cells: [] },
  transition: ({ cells }, value) => {
    if (cells === null) return { cells: null };   // block already checked
    const next = [...cells, value === ON];
    if (next.length < 4) return { cells: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { cells: null };
  },
  accept: ({ cells }) => cells === null,
}, geometry.numValues);
const noDiagonalTouches = python.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'no diagonal self-touch',
    ...python.at(graph.block('R1C1', 2, 2))),
  python.at(gridCells.filter(cell => graph.block(cell, 2, 2))));

// --- Palindrome ------------------------------------------------------------

// VH/VL hold K = BASE * (VH - 1) + VL, the python cell's distance in cells from
// the nearer end, counting itself (so both red cells are level 1); cells off
// the python hold VH = VL = NO_LEVEL. Three local facts pin K down: both red
// cells are level 1, adjacent python cells differ by one level, and no level is
// held by three cells. A +/-1 walk from 1 back to 1 that revisits no level three
// times is unimodal, so the two cells at level k are the k-th python cells from
// the two ends -- and the palindrome is then "same level, same digit", which the
// same machine checks. The purple cell is pinned as the walk's single peak,
// which is what puts it at the midpoint of the palindrome.
const manhattan = (a, b) => {
  const p = parseCellId(a);
  const q = parseCellId(b);
  return Math.abs(p.row - q.row) + Math.abs(p.col - q.col);
};
// A level-k cell is k-1 orthogonal steps from a red cell, so k-1 is at least,
// and has the same parity as, the Manhattan distance to the nearer one. Both
// red cells sit on the same colour, so the parity is the same for either one.
const levelsFor = cell => {
  // Each red cell is the first python cell from its own end, so it is level 1.
  if (ENDS.includes(cell)) return [1];
  const first = Math.min(...ENDS.map(end => manhattan(cell, end))) + 1;
  return Array.from(
    { length: Math.floor((MAX_LEVEL - first) / 2) + 1 }, (_, i) => first + 2 * i);
};
const highOf = level => Math.ceil(level / BASE);
const lowOf = level => (level - 1) % BASE + 1;
const levelDomains = new Map(gridCells.map(cell => {
  const levels = levelsFor(cell);
  return [cell, {
    highs: new Set(levels.map(highOf)),
    lows: new Set(levels.map(lowOf)),
  }];
}));
const canHold = (cell, level) => {
  const domain = levelDomains.get(cell);
  return domain.highs.has(highOf(level)) && domain.lows.has(lowOf(level));
};

// One Replicate stamps every value the layer uses anywhere over all of its
// cells; the cells whose own domain is narrower than that carry their own
// Given, which the stamped one is intersected with.
const sorted = values => [...values].sort((a, b) => a - b);
const layerDomain = (layer, part) => {
  const stamped = new Set(gridCells.flatMap(
    cell => [...levelDomains.get(cell)[part]]));
  return [
    layer.makeReplicate(
      new Given(layer.cells()[0], ...sorted(stamped), NO_LEVEL)),
    ...gridCells
      .filter(cell => levelDomains.get(cell)[part].size < stamped.size)
      .map(cell => new Given(
        layer.at(cell), ...sorted(levelDomains.get(cell)[part]), NO_LEVEL)),
  ];
};
const domains = [
  ...layerDomain(levelHigh, 'highs'),
  ...layerDomain(levelLow, 'lows'),
];

// A cell carries a level exactly when it is on the python.
const levelledKey = Pair.fnToKey(
  (membership, level) => (membership === OFF) === (level === NO_LEVEL),
  geometry.numValues);
const levelPresence = gridCells.flatMap(cell => [
  new Pair(levelledKey, 'level iff on the python',
    python.at(cell), levelHigh.at(cell)),
  new Pair(levelledKey, 'level iff on the python',
    python.at(cell), levelLow.at(cell)),
]);

// K(a) - K(b) = BASE * (VH(a) - VH(b)) + (VL(a) - VL(b)).
const levelDifference = (a, b) => new Sum(1,
  [levelHigh.at(a), BASE], [levelLow.at(a), 1],
  [levelHigh.at(b), -BASE], [levelLow.at(b), -1]);
const levelSteps = gridCells.flatMap(cell =>
  [graph.step(cell, 0, 1), graph.step(cell, 1, 0)]
    .filter(next => next !== null)
    .map(next => new Or([
      new Given(python.at(cell), OFF),
      new Given(python.at(next), OFF),
      levelDifference(cell, next),
      levelDifference(next, cell),
    ])));

// The purple cell is the midpoint: it is on the python and both of its python
// neighbours are one level lower, making it the peak of the unimodal walk --
// so the two ends are the same distance away and the python has odd length.
const midpointIsPeak = graph.neighbours(MIDPOINT).map(next => new Or([
  new Given(python.at(next), OFF),
  levelDifference(MIDPOINT, next),
]));

// One machine per level, scanning (VH, VL, digit) over every cell whose level
// domain still admits that level. It counts the cells holding the level,
// rejecting a third, and rejects a second cell whose digit differs from the
// first's.
const levelMachine = (high, low) => NFA.encodeSpec({
  startState: { phase: 0, hit: false, count: 0, digit: 0 },
  transition: ({ phase, hit, count, digit }, value) => {
    if (phase === 0) return { phase: 1, hit: value === high, count, digit };
    if (phase === 1) return { phase: 2, hit: hit && value === low, count, digit };
    if (!hit) return { phase: 0, hit: false, count, digit };
    if (count === 2) return undefined;                     // a third cell
    if (digit !== 0 && digit !== value) return undefined;  // unequal pair
    return { phase: 0, hit: false, count: count + 1, digit: value };
  },
  accept: () => true,
}, geometry.numValues);
const palindrome = Array.from({ length: MAX_LEVEL }, (_, i) => i + 1)
  .map(level => {
    const cells = gridCells.filter(cell => canHold(cell, level));
    return new NFA(
      levelMachine(highOf(level), lowOf(level)), `python level ${level}`,
      ...cells.flatMap(cell => [levelHigh.at(cell), levelLow.at(cell), cell]));
  });

// --- Count clues -----------------------------------------------------------

// The digit of the first cell scanned is how many of the rest hold `wanted`.
// The scan is the clue cell's own membership followed by its king-move
// neighbours, i.e. the 3x3 block centred on it, the cell itself included.
const countMachine = wanted => NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === wanted ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);
const blockOf = cell => python.at([cell, ...graph.kingNeighbours(cell)]);

// Stones: off the python, digit counts the non-python cells of their block,
// and the nine stone digits are all different.
const stoneClues = [
  ...STONES.map(cell => new Given(python.at(cell), OFF)),
  ...STONES.map(cell => new NFA(countMachine(OFF), 'stone non-python count',
    cell, ...blockOf(cell))),
  new AllDifferent(...STONES),
];

// Blue cells: digit counts the python cells of their block. They carry no
// membership pin -- a blue cell may itself be python, and then counts itself.
const blueClues = BLUE.map(cell => new NFA(countMachine(ON), 'blue python count',
  cell, ...blockOf(cell)));

// All possible coloured cells are given: an uncoloured cell must not qualify as
// a stone (off the python with its digit equal to its block's non-python count)
// and must not qualify as a blue cell (digit equal to its block's python count).
// Phases: 0 reads the digit, 1 reads the cell's own membership, 2 counts the
// rest of the block. `blockSize` is the 3x3 block clipped at the grid edge, so
// the non-python count is blockSize - count.
const notAClueMachine = blockSize => NFA.encodeSpec({
  startState: { phase: 0, target: 0, isPython: false, count: 0 },
  transition: ({ phase, target, isPython, count }, value) => {
    if (phase === 0) return { phase: 1, target: value, isPython, count };
    if (phase === 1) {
      return { phase: 2, target, isPython: value === ON, count: value === ON ? 1 : 0 };
    }
    // Clamped at blockSize, which a real scan of the block cannot exceed.
    return {
      phase: 2, target, isPython,
      count: Math.min(count + (value === ON ? 1 : 0), blockSize),
    };
  },
  accept: ({ phase, target, isPython, count }) => phase === 2 &&
    count !== target &&                                  // not an undrawn blue cell
    (isPython || blockSize - count !== target),          // not an undrawn stone
}, geometry.numValues);
const negativeClues = gridCells
  .filter(cell => !coloured.has(cell))
  .map(cell => {
    const block = blockOf(cell);
    return new NFA(notAClueMachine(block.length), 'no undrawn colour',
      cell, ...block);
  });

return [
  new Shape('9x9'),
  python.toVar('python membership'),
  levelHigh.toVar('python level, high part'),
  levelLow.toVar('python level, low part'),
  python.makeReplicate(new Given(python.cells()[0], ON, OFF)),
  ...domains,
  new Given(python.at(MIDPOINT), ON),
  ...degreeRules,
  new ConnectedValues('VS', ON),
  noDiagonalTouches,
  ...levelPresence,
  ...levelSteps,
  ...midpointIsPeak,
  ...palindrome,
  ...stoneClues,
  ...blueClues,
  ...negativeClues,
];
