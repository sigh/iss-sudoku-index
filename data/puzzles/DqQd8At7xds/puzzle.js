// Title: Caterdokupillar
// Author: Much of the setting community
// Video: https://www.youtube.com/watch?v=DqQd8At7xds
// Source: https://sudokupad.app/memeristor/smoldokupillar1?setting-nogrid=1&setting-largepuzzle=1

// Seven 6x6 puzzles chained across one 42x26 canvas. Each puzzle's top-left
// 2x2 block is the previous puzzle's bottom-right 2x2 block, which is the
// "4 digits carry over as givens for the next puzzle" of the shared rules
// text. There are no other givens.
//
// Rules encoded, puzzle by puzzle. Every puzzle places six digits once each in
// every row, column and drawn box; puzzles 1-4, 6 and 7 use 1-6.
//
//   1. Face of Eternity (theasylm), r7c7-r12c12.
//      Japanese sums: the squares outside the grid give, in order, the sums of
//      the runs of contiguous cells shaded that clue's colour. All shaded runs
//      are given, so a cell in no run is unshaded. Two runs of the same colour
//      must be separated by at least one cell that is not that colour;
//      differently coloured runs may touch.
//   2. Aperitif (Tallcat), r11c11-r16c16. Renban lines.
//   3. Wheels (Alaric Taqi A. / Crusader175), r15c15-r20c20.
//      Digits in a grey circle go in the four cells the circle touches in the
//      same circular order, after rotating the circle by 0, 90, 180 or 270
//      degrees.
//   4. Arrow Sudoku (Agent), r19c11-r24c16. Arrows.
//   5. Metamorphosnipe (Philip Newman), r23c15-r28c20.
//      Six digits selected from 1-9 are placed once each in every row, column
//      and box; which six is for the solver to find. Multiplicative arrows:
//      the product of the arm equals the circle digit, or the two-digit number
//      in the pill read left to right.
//   6. Moon-Sun Caterdokupillar (Math Pesto), r27c11-r32c16.
//      A non-branching, non-intersecting orthogonal loop through cell centres
//      visits each box exactly once. Within a box the loop covers all the
//      moons and no suns, or all the suns and no moons, and two boxes it
//      visits one after the other cannot be of the same kind. The loop is a
//      German whispers line: consecutive digits along it differ by at least 3.
//   7. Double or Nothin' (Kennet's Dad), r31c15-r36c20.
//      Garden path lines: each blue line is cut into two segments by a box
//      border, and one segment's sum is double the other's.
//
// An ISS grid is at most 16 by 16 and seven 6x6 blocks do not pack into one,
// so the 228 canvas cells that some puzzle covers are laid out in canvas
// reading order on a 16x15 `Raw` board, which carries no rules of its own, and
// every house below is stated explicitly.

const SIZE = 6;
const BOARD_ROWS = 16;
const BOARD_COLS = 15;
const CANVAS_ROWS = 42;
const CANVAS_COLS = 26;

const shape = new Shape('16x15', 9, 'Raw');
const range = (n, from = 0) => Array.from({ length: n }, (_, i) => i + from);

// The seven puzzles in chain order: the canvas cell each one's top-left corner
// sits on, and the shape of its drawn boxes as rows x columns. Both come from
// the source's own grid metadata and its thick (th=3) walls; puzzle 5's boxes
// are 3 rows by 2 columns, everyone else's are 2 by 3.
const PUZZLES = [
  { row: 7, col: 7, boxRows: 2, boxCols: 3 },
  { row: 11, col: 11, boxRows: 2, boxCols: 3 },
  { row: 15, col: 15, boxRows: 2, boxCols: 3 },
  { row: 19, col: 11, boxRows: 2, boxCols: 3 },
  { row: 23, col: 15, boxRows: 3, boxCols: 2 },
  { row: 27, col: 11, boxRows: 2, boxCols: 3 },
  { row: 31, col: 15, boxRows: 2, boxCols: 3 },
];

const covers = (p, r, c) =>
  r >= p.row && r < p.row + SIZE && c >= p.col && c < p.col + SIZE;

// Canvas cells covered by at least one puzzle, in canvas reading order. Shared
// cells appear once, which is what makes a carried-over digit one cell.
const canvasCells = range(CANVAS_ROWS, 1).flatMap(
  r => range(CANVAS_COLS, 1)
    .filter(c => PUZZLES.some(p => covers(p, r, c)))
    .map(c => [r, c]));

const boardCellId = i =>
  makeCellId(Math.floor(i / BOARD_COLS) + 1, (i % BOARD_COLS) + 1);
const boardIds = new Map(
  canvasCells.map(([r, c], i) => [r * 100 + c, boardCellId(i)]));
const cell = (r, c) => {
  const id = boardIds.get(r * 100 + c);
  if (id === undefined) throw Error(`r${r}c${c} is on no puzzle`);
  return id;
};
const cellOf = ([r, c]) => cell(r, c);

// Board cells past the last covered canvas cell belong to no puzzle. A Raw
// board leaves them free, so pin them.
const padding = range(BOARD_ROWS * BOARD_COLS - canvasCells.length,
  canvasCells.length).map(i => new Given(boardCellId(i), 1));

const rowsOf = p =>
  range(SIZE).map(i => range(SIZE).map(j => cell(p.row + i, p.col + j)));
const colsOf = p =>
  range(SIZE).map(j => range(SIZE).map(i => cell(p.row + i, p.col + j)));
const boxesOf = p => range(SIZE / p.boxRows).flatMap(
  bi => range(SIZE / p.boxCols).map(
    bj => range(p.boxRows).flatMap(
      i => range(p.boxCols).map(
        j => cell(p.row + bi * p.boxRows + i, p.col + bj * p.boxCols + j)))));
const housesOf = p => [...rowsOf(p), ...colsOf(p), ...boxesOf(p)];
const boxIndexOf = (p, [r, c]) =>
  Math.floor((r - p.row) / p.boxRows) * (SIZE / p.boxCols)
  + Math.floor((c - p.col) / p.boxCols);
const cellsOf = p =>
  range(SIZE).flatMap(i => range(SIZE).map(j => [p.row + i, p.col + j]));
const rcKey = ([r, c]) => r * 100 + c;

// Puzzles 1-4, 6 and 7: every house is exactly the digits 1-6.
const latinHouses = PUZZLES.flatMap(
  (p, i) => i === 4 ? []
    : housesOf(p).map(h => new ContainExact('1_2_3_4_5_6', ...h)));

// --- 5. Metamorphosnipe: six digits chosen from 1-9 --------------------------

const snipe = PUZZLES[4];
const snipeCells = cellsOf(snipe).map(cellOf);
const chosen = new Var('D', 'chosen digits', SIZE);
const chosenIds = chosen.cells();
const ascending = Pair.fnToKey((a, b) => a < b, shape);

const chosenDigits = [
  chosen,
  new AllDifferent(...chosenIds),
  // The chosen digits are held in increasing order. Which Var holds which
  // digit is an artifact of this encoding, so pinning the order removes only
  // relabellings of the same answer.
  ...range(SIZE - 1).map(
    i => new Pair(ascending, 'ascending', chosenIds[i], chosenIds[i + 1])),
  ...housesOf(snipe).map(h => new AllDifferent(...h)),
  // Every cell holds one of the six; with six distinct values in a house that
  // makes each house exactly the chosen set.
  ...snipeCells.map(
    id => new Or(chosenIds.map(v => new SameValues(2, id, v)))),
];

// --- 1. Face of Eternity: Japanese sums --------------------------------------

// Clue squares outside the grid, read from the source's coloured text
// underlays: one list per line, in the order the runs appear along the line
// (left to right for a row, top to bottom for a column), each entry a run sum
// and its colour. G green, R red, Y yellow, B black.
const JS_ROW_CLUES = [
  [[4, 'G'], [8, 'Y'], [6, 'G']],
  [[3, 'G'], [6, 'B'], [7, 'R'], [1, 'B'], [4, 'G']],
  [[5, 'G'], [2, 'R'], [10, 'G'], [3, 'R'], [1, 'G']],
  [[6, 'R'], [3, 'Y'], [3, 'R'], [4, 'Y'], [5, 'R']],
  [[2, 'G'], [13, 'B'], [6, 'G']],
  [[5, 'G'], [7, 'B'], [5, 'G']],
];
const JS_COL_CLUES = [
  [[8, 'G'], [6, 'R'], [2, 'G']],
  [[4, 'G'], [6, 'B'], [2, 'R'], [3, 'Y'], [1, 'B'], [5, 'G']],
  [[5, 'Y'], [2, 'R'], [4, 'G'], [1, 'R'], [9, 'B']],
  [[3, 'Y'], [5, 'R'], [6, 'G'], [2, 'R'], [5, 'B']],
  [[6, 'G'], [1, 'B'], [3, 'R'], [4, 'Y'], [5, 'B'], [2, 'G']],
  [[5, 'G'], [5, 'R'], [9, 'G']],
];

// Sum bounds for a run of `len` distinct digits drawn from 1-6, and the total
// of a whole line. Used only to drop segmentations that no assignment of the
// digits 1-6 could satisfy.
const minRunSum = len => (len * (len + 1)) / 2;
const maxRunSum = len => (len * (2 * SIZE - len + 1)) / 2;
const LINE_TOTAL = minRunSum(SIZE);

// Every way the clue list can sit on the six cells of its line: each run is a
// block of consecutive cells, the blocks appear in clue order, and two runs of
// the same colour are kept apart by at least one cell (adjacent cells of one
// colour would be a single run, and every run is clued).
const segmentations = clues => {
  const out = [];
  const walk = (i, pos, acc) => {
    if (i === clues.length) {
      const spare = SIZE - acc.reduce((n, [, len]) => n + len, 0);
      const spareSum = LINE_TOTAL - clues.reduce((n, [sum]) => n + sum, 0);
      if (spareSum >= minRunSum(spare) && spareSum <= maxRunSum(spare)) {
        out.push(acc.slice());
      }
      return;
    }
    const [sum, colour] = clues[i];
    const gap = i > 0 && clues[i - 1][1] === colour ? 1 : 0;
    for (let start = pos + gap; start < SIZE; start++) {
      for (let len = 1; start + len <= SIZE; len++) {
        if (sum < minRunSum(len) || sum > maxRunSum(len)) continue;
        acc.push([start, len]);
        walk(i + 1, start + len, acc);
        acc.pop();
      }
    }
  };
  walk(0, 0, []);
  return out;
};

const eternity = PUZZLES[0];
const japaneseSums = [
  ...JS_ROW_CLUES.map((clues, i) => [
    clues, range(SIZE).map(j => cell(eternity.row + i, eternity.col + j))]),
  ...JS_COL_CLUES.map((clues, j) => [
    clues, range(SIZE).map(i => cell(eternity.row + i, eternity.col + j))]),
].flatMap(([clues, cells]) => {
  const runSums = seg => seg.map(
    ([start, len], i) => new Sum(clues[i][0], ...cells.slice(start, start + len)));
  const segs = segmentations(clues);
  return segs.length === 1
    ? runSums(segs[0])
    : [new Or(segs.map(seg => new And(runSums(seg))))];
});

// --- 2. Aperitif: renban lines -----------------------------------------------

// Purple line paths, as drawn.
const RENBAN_LINES = [
  [[13, 12], [12, 13], [11, 14]],
  [[13, 11], [14, 11], [15, 12]],
  [[14, 13], [13, 14], [13, 15]],
  [[16, 12], [16, 13], [15, 14]],
];
const renbans = RENBAN_LINES.map(line => new Renban(...line.map(cellOf)));

// --- 3. Wheels ---------------------------------------------------------------

// Each grey circle is centred on a cell and reaches into that cell's four
// orthogonal neighbours. The digits are drawn where the circle meets each of
// those neighbours; a null is a position the source leaves blank. Order is
// north, east, south, west, which is the circle's own circular order.
const WHEELS = [
  { at: [16, 18], digits: [3, 2, null, 5] },
  { at: [18, 16], digits: [2, 6, null, 4] },
  { at: [19, 19], digits: [6, null, null, 4] },
];
const COMPASS = [[-1, 0], [0, 1], [1, 0], [0, -1]];

// A rotation by 90*k degrees sends the digit at position i to the neighbour k
// steps further round the circle.
const wheels = WHEELS.map(({ at, digits }) => new Or(range(4).map(
  k => new And(digits.flatMap((d, i) => d === null ? [] : [new Given(
    cellOf([at[0] + COMPASS[(i + k) % 4][0], at[1] + COMPASS[(i + k) % 4][1]]),
    d)])))));

// --- 4. Arrow Sudoku ---------------------------------------------------------

// Circle cell first, then the arm as drawn.
const ARROWS = [
  [[20, 12], [21, 13], [21, 14]],
  [[20, 11], [21, 11], [22, 11]],
  [[22, 16], [23, 15], [24, 14]],
  [[22, 13], [23, 12]],
  [[23, 14], [24, 13]],
];
const arrows = ARROWS.map(a => new Arrow(...a.map(cellOf)));

// --- 5. Metamorphosnipe: multiplicative arrows -------------------------------

// Arm cells as drawn, then the total: one cell for a circle, or the pill's two
// cells in reading order for a two-digit total.
const MULT_ARROWS = [
  { arm: [[27, 20], [26, 20], [25, 19]], total: [[28, 20]] },
  { arm: [[28, 18], [28, 19]], total: [[27, 16], [27, 17]] },
  { arm: [[24, 18], [25, 17], [25, 16]], total: [[23, 18], [23, 19]] },
];

// Scans the arm and then the total cells. `p` is the running product while the
// arm is read; a product too large for the total to reach is dropped there and
// then, which is also what bounds the machine. For a pill the tens digit
// leaves `p` holding what the ones digit must be.
const productSpec = (armLen, pillLen) => NFA.encodeSpec({
  startState: { i: 0, p: 1 },
  transition: ({ i, p }, value) => {
    if (i < armLen) {
      const q = p * value;
      return q > (pillLen === 2 ? 99 : 9) ? undefined : { i: i + 1, p: q };
    }
    if (pillLen === 2 && i === armLen) {
      const ones = p - 10 * value;
      return ones >= 0 && ones <= 9 ? { i: i + 1, p: ones } : undefined;
    }
    return value === p ? { i: i + 1, p: 0 } : undefined;
  },
  accept: ({ i }) => i === armLen + pillLen,
}, shape);

const multArrows = MULT_ARROWS.map(({ arm, total }) => new NFA(
  productSpec(arm.length, total.length), 'product',
  [...arm, ...total].map(cellOf)));

// --- 6. Moon-Sun Caterdokupillar: the loop -----------------------------------

// Yellow clues as drawn: a filled disc is a sun, an outlined crescent a moon.
const SUNS = [[27, 13], [28, 14], [29, 14], [30, 11], [30, 13], [31, 14], [32, 11]];
const MOONS = [[27, 14], [28, 12], [29, 13], [29, 16], [30, 15], [31, 13], [32, 14]];

const loop = PUZZLES[5];
const NUM_BOXES = (SIZE * SIZE) / (loop.boxRows * loop.boxCols);
const OFF = 1, ON = 2;
const MOON = 1, SUN = 2;

// The loop's own state: which cells it uses, which box borders it steps over,
// which kind of clue each box's stretch of loop covers, and where each box
// falls in the cyclic order the loop visits the boxes in.
const onLoop = new Var('M', 'loop cells', `${SIZE}x${SIZE}`);
const boxType = new Var('T', 'clue kind per box', NUM_BOXES);
const boxPos = new Var('P', 'box order along the loop', NUM_BOXES);
const onLoopId = rc =>
  onLoop.cell(rc[0] - loop.row + 1, rc[1] - loop.col + 1);
const boxOf = rc => boxIndexOf(loop, rc);

// Orthogonally adjacent pairs of the puzzle's cells that lie in different
// boxes: the steps the loop can take between one box and the next.
const crossings = cellsOf(loop).flatMap(
  rc => [[0, 1], [1, 0]].map(([dr, dc]) => [rc, [rc[0] + dr, rc[1] + dc]])
    .filter(([a, b]) => b[0] < loop.row + SIZE && b[1] < loop.col + SIZE
      && boxOf(a) !== boxOf(b)));
const crossVar = new Var('X', 'loop steps between boxes', crossings.length);
const crossingsAt = rc =>
  crossings.flatMap((e, i) => e.some(x => rcKey(x) === rcKey(rc)) ? [i] : []);

// Every simple path through `cells`, as the cell sequence, deduplicated by the
// vertex and edge sets it uses so a path and its reverse count once. A single
// cell is a path of length one.
const simplePaths = cells => {
  const inside = new Set(cells.map(rcKey));
  const found = new Map();
  const walk = path => {
    const end = path[path.length - 1];
    const id = path.map(rcKey).slice().sort((x, y) => x - y).join(',') + '|'
      + path.slice(1).map((rc, i) => [rcKey(path[i]), rcKey(rc)]
        .sort((x, y) => x - y).join('-')).sort().join(',');
    if (!found.has(id)) found.set(id, path.slice());
    for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const next = [end[0] + dr, end[1] + dc];
      if (!inside.has(rcKey(next))) continue;
      if (path.some(rc => rcKey(rc) === rcKey(next))) continue;
      walk([...path, next]);
    }
  };
  cells.forEach(rc => walk([rc]));
  return [...found.values()];
};

// One box's share of the loop is a single stretch, because the loop visits the
// box exactly once: a simple path whose two ends each step over a box border.
// Enumerating those stretches is what states "non-branching, non-intersecting"
// and "visits each box exactly once" here; each branch fixes the box's loop
// cells, its border steps and its clue kind, so no other shape can be chosen.
const boxLoopChoices = range(NUM_BOXES).map(b => {
  const boxCells = cellsOf(loop).filter(rc => boxOf(rc) === b);
  const boxMoons = MOONS.filter(rc => boxOf(rc) === b);
  const boxSuns = SUNS.filter(rc => boxOf(rc) === b);
  const boxCrossings = crossings.flatMap((e, i) => e.some(x => boxOf(x) === b) ? [i] : []);
  const branches = simplePaths(boxCells).flatMap(path => {
    const used = new Set(path.map(rcKey));
    // All moons and no suns, or all suns and no moons. Every box here holds at
    // least one of each, so at most one of the two can hold.
    const covers = clues => clues.every(rc => used.has(rcKey(rc)));
    const avoids = clues => clues.every(rc => !used.has(rcKey(rc)));
    const kind = covers(boxMoons) && avoids(boxSuns) ? MOON
      : covers(boxSuns) && avoids(boxMoons) ? SUN : null;
    if (kind === null) return [];
    const ends = [path[0], path[path.length - 1]];
    return crossingsAt(ends[0]).flatMap(x => crossingsAt(ends[1]).flatMap(y => {
      if (x === y) return [];
      // The two steps must reach different boxes: a loop that left a box and
      // came straight back could not go on to visit the other boxes.
      const away = (i, from) =>
        boxOf(crossings[i].find(rc => rcKey(rc) !== rcKey(from)));
      if (away(x, ends[0]) === away(y, ends[1])) return [];
      return [new And([
        ...boxCells.map(rc => new Given(
          onLoopId(rc), used.has(rcKey(rc)) ? ON : OFF)),
        ...boxCrossings.map(i => new Given(
          crossVar.cell(i + 1), i === x || i === y ? ON : OFF)),
        new Given(boxType.cell(b + 1), kind),
        // The loop is a German whispers line, so its steps inside this box are.
        ...(path.length > 1 ? [new Whisper(3, ...path.map(cellOf))] : []),
      ])];
    }));
  });
  return new Or(branches);
});

const differ = Pair.fnToKey((a, b) => a !== b, shape);
// Positions run 1..NUM_BOXES round the loop, so neighbouring boxes are one
// apart modulo NUM_BOXES.
const nextRound = Pair.fnToKey(
  (a, b) => a <= NUM_BOXES && b <= NUM_BOXES
    && ((a - b + NUM_BOXES) % NUM_BOXES === 1
      || (b - a + NUM_BOXES) % NUM_BOXES === 1), shape);

const loopSteps = crossings.map(([a, b], i) => new Or([
  new Given(crossVar.cell(i + 1), OFF),
  new And([
    new Whisper(3, cellOf(a), cellOf(b)),
    // Consecutively visited boxes take opposite clue kinds, and are one step
    // apart in the visiting order.
    new Pair(differ, 'alternating clue kind',
      boxType.cell(boxOf(a) + 1), boxType.cell(boxOf(b) + 1)),
    new Pair(nextRound, 'consecutive boxes',
      boxPos.cell(boxOf(a) + 1), boxPos.cell(boxOf(b) + 1)),
  ]),
]));

const moonSunLoop = [
  onLoop, crossVar, boxType, boxPos,
  // One loop through all the boxes: the visiting order is a permutation of
  // 1..NUM_BOXES that every border step it takes agrees with.
  ...range(NUM_BOXES).map(
    b => new Given(boxPos.cell(b + 1), ...range(NUM_BOXES, 1))),
  new AllDifferent(...boxPos.cells()),
  // Where the numbering starts and which way round it runs are artifacts of
  // this encoding, so anchor both: the first box takes position 1, and of the
  // next two boxes in reading order the earlier one takes the lower position.
  new Given(boxPos.cell(1), 1),
  new Pair(ascending, 'numbering direction', boxPos.cell(2), boxPos.cell(3)),
  ...boxLoopChoices,
  ...loopSteps,
];

// --- 7. Double or Nothin': garden path lines ---------------------------------

// Blue line paths, as drawn. The last entry is drawn closed; its repeated
// first waypoint is dropped, since the cell is on the line once.
const BLUE_LINES = [
  [[32, 15], [32, 16], [33, 16], [33, 17]],
  [[34, 16], [34, 17], [34, 18]],
  [[32, 19], [33, 20], [34, 20], [34, 19]],
  [[34, 19], [35, 19]],
  [[36, 19], [35, 18], [36, 17], [35, 16]],
  [[31, 17], [32, 17], [32, 18], [31, 18]],
];

const garden = PUZZLES[6];

const gardenPaths = BLUE_LINES.map(line => {
  // Split the drawn path into maximal runs of cells sharing a box.
  const segs = line.reduce((acc, rc) => {
    const last = acc[acc.length - 1];
    if (last && boxIndexOf(garden, last[0]) === boxIndexOf(garden, rc)) last.push(rc);
    else acc.push([rc]);
    return acc;
  }, []);
  if (segs.length !== 2) throw Error('line does not split into two segments');
  const [a, b] = segs.map(s => s.map(cellOf));
  return new Or([
    new Sum(0, ...a.map(id => [id, 1]), ...b.map(id => [id, -2])),
    new Sum(0, ...b.map(id => [id, 1]), ...a.map(id => [id, -2])),
  ]);
});

return [
  shape,
  ...padding,
  ...latinHouses,
  ...chosenDigits,
  ...japaneseSums,
  ...renbans,
  ...wheels,
  ...arrows,
  ...multArrows,
  ...moonSunLoop,
  ...gardenPaths,
];
