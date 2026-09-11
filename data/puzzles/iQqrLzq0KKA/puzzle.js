// Title: Caterdokupillar
// Author: Much of the setting community
// Video: https://www.youtube.com/watch?v=iQqrLzq0KKA
// Source: https://sudokupad.app/memeristor/smoldokupillar1?setting-nogrid=1&setting-largepuzzle=1

// This segment of the Caterdokupillar is seven separate 6x6 puzzles, each by a
// different setter, chained corner to corner: consecutive puzzles share a 2x2
// block of cells (the "4 digits carry over" of the top-level rules). There are
// no givens. Encoded below, in the setters' words:
//
// P1 "Face of Eternity" (theasylm)
//   Normal 6x6 Sudoku rules apply. Place the digits 1-6 exactly once in every
//   row, column, and 2x3 box.
//   Japanese Sums: The squares outside the grid indicate the order of the runs
//   of contiguous cells that must be shaded the color of the clue. The number
//   in the square indicates the sum of the cells in the run. All shaded runs
//   are given. Colors used in this puzzle are Green, Red, Black, Yellow.
// P2 "Aperitif" (Tallcat)
//   Normal 6x6 Sudoku rules apply.
//   Renban Lines: Digits on a purple line form a set of non-repeating,
//   consecutive digits in any order.
// P3 "Wheels" (Alaric Taqi A. / Crusader175)
//   Normal 6x6 Sudoku rules apply.
//   Wheels: Digits in a grey circle have to be placed in the same circular
//   order in the four cells that are touched by the circle. The circles might
//   have to be rotated to the correct position by 90, 180, or 270 degrees.
//   Digits are allowed to repeat on wheels as normally allowed by other rules.
// P4 "Arrow Sudoku" (Agent)
//   Normal 6x6 Sudoku rules apply.
//   Arrows: A digit in a circle is equal to the sum of the digits on the
//   attached arrow. Digits are allowed to repeat along the arrows as normally
//   allowed by other rules.
// P5 "Metamorphosnipe" (Philip Newman)
//   Select exactly 6 digits from 1-9 and place them exactly once in every row,
//   column and 2x3 box. (P5's drawn boxes are 3 rows by 2 columns; the walls
//   are what the encoding follows.)
//   Multiplicative Arrow: The product of the digits along an arrow is equal to
//   the number in its connected circle or pill. Digits in pills are two digit
//   numbers read left to right or top to bottom. Digits are allowed to repeat
//   along the arrows as normally allowed by other rules.
// P6 "Moon-Sun Caterdokupillar" (Math Pesto)
//   Normal 6x6 Sudoku rules apply.
//   Draw a non-branching, non-intersecting orthogonally traveling loop that
//   visits each box exactly once. Within each box, the loop either passes
//   through all moons and no suns, or all suns and no moons. The loop cannot
//   pass through the same type of clue in two consecutively used regions. The
//   loop acts as a German Whispers line. German Whispers line: Adjacent digits
//   along these lines must have a difference of at least 3.
// P7 "Double or Nothin'" (Kennet's Dad)
//   Normal 6x6 Sudoku rules apply.
//   Garden Path Lines: Blue lines are split into segments by box borders. For
//   each line, the sum of one segment will be double the sum of the other
//   segment.
//
// Nothing is omitted.
//
// Layout note. The seven boards span 30 canvas rows, and every ISS grid
// dimension caps at 16 (CellGeometry.MAX_SIZE), so the chain cannot be one
// Shape. Each 6x6 is its own '6x6' Var group instead, addressed by the
// dimension-aware two-argument cell(row, col); a shared 2x2 block is six
// SameValues pairs tying the two boards' copies together. A throwaway 1x1
// Shape, pinned, supplies the shared 1-9 value range every group needs (1-9
// because P5 draws its digits from 1-9; the other six boards are restricted to
// 1-6 by their row constraints).

const MAXV = 9;
const IDX = [1, 2, 3, 4, 5, 6];

const anchorShape = new Shape('1x1', `1-${MAXV}`);
const anchorGiven = new Given('R1C1', 1);

const BOARD_LABELS = [
  '1. Face of Eternity', '2. Aperitif', '3. Wheels', '4. Arrow Sudoku',
  '5. Metamorphosnipe', '6. Moon-Sun Caterdokupillar', "7. Double or Nothin'",
];
const boards = ['BA', 'BB', 'BC', 'BD', 'BE', 'BF', 'BG'].map(
  (prefix, i) => new Var(prefix, BOARD_LABELS[i], '6x6'));

// (board, row, col) -> cell id, in each puzzle's own r1c1..r6c6 coordinates.
const at = (p, r, c) => boards[p].cell(r, c);
const cellsOf = (p, rcList) => rcList.map(([r, c]) => at(p, r, c));

const rowsOf = (p) => IDX.map(r => IDX.map(c => at(p, r, c)));
const colsOf = (p) => IDX.map(c => IDX.map(r => at(p, r, c)));

// Box shape per board, [height, width], read off the thick walls each setter
// drew: six of the seven are 2 rows by 3 columns, but P5's thick walls fall
// between its rows 3/4 and between its columns 2/3 and 4/5, so P5's boxes are
// 3 rows by 2 columns.
const BOX_DIMS = [[2, 3], [2, 3], [2, 3], [2, 3], [3, 2], [2, 3], [2, 3]];
const boxCells = (p, b) => {
  const [bh, bw] = BOX_DIMS[p];
  const perBand = 6 / bw;
  const r0 = bh * Math.floor(b / perBand), c0 = bw * (b % perBand);
  return Array.from({ length: bh }, (_, dr) =>
    Array.from({ length: bw }, (_, dc) => at(p, r0 + dr + 1, c0 + dc + 1))).flat();
};
const boxesOf = (p) => [0, 1, 2, 3, 4, 5].map(b => boxCells(p, b));
// P6's own 2x3 tiling, as a box index 0..5 in reading order.
const p6BoxOfCell = (r, c) => 2 * Math.floor((r - 1) / 2) + Math.floor((c - 1) / 3);

// Normal 6x6 sudoku on one board. ContainExact over each row both restricts the
// board to 1-6 out of the shared 1-9 range and makes the row a permutation.
const sudoku6 = (p) => [
  ...rowsOf(p).map(cells => new ContainExact('1_2_3_4_5_6', ...cells)),
  ...colsOf(p).map(cells => new AllDifferent(...cells)),
  ...boxesOf(p).map(cells => new AllDifferent(...cells)),
];

// P5's units instead hold one unknown 6-digit subset of 1-9, the same subset in
// every unit: AllDifferent per unit for "exactly once", SameValues across all
// eighteen units for "select exactly 6 digits".
const P5_UNITS = [...rowsOf(4), ...colsOf(4), ...boxesOf(4)];
const sudokuUnknownSet = [
  ...P5_UNITS.map(cells => new AllDifferent(...cells)),
  new SameValues(P5_UNITS.length, ...P5_UNITS.flat()),
];

// Chain links: [earlier board, its shared block's top-left, later board, its
// shared block's top-left]. Each is a 2x2 block, row and column order
// preserved. Transcribed from metadata.grids' canvas placements.
const LINKS = [
  [0, 5, 5, 1, 1, 1],
  [1, 5, 5, 2, 1, 1],
  [2, 5, 1, 3, 1, 5],
  [3, 5, 5, 4, 1, 1],
  [4, 5, 1, 5, 1, 5],
  [5, 5, 5, 6, 1, 1],
];
const linkConstraints = LINKS.flatMap(([pa, ar, ac, pb, br, bc]) =>
  [[0, 0], [0, 1], [1, 0], [1, 1]].map(([dr, dc]) =>
    new SameValues(2, at(pa, ar + dr, ac + dc), at(pb, br + dr, bc + dc))));

// ---------------------------------------------------------------------------
// P1: Japanese sums.

const SHADE_OFF = 1;              // 1 unshaded, 2 green, 3 red, 4 black, 5 yellow
const SHADE_CODE = { G: 2, R: 3, B: 4, Y: 5 };
const shade = new Var(
  'SH', 'P1 shading: 1 none, 2 green, 3 red, 4 black, 5 yellow', '6x6');
const shadeDomain = IDX.flatMap(r => IDX.map(
  c => new Given(shade.cell(r, c), 1, 2, 3, 4, 5)));

// Clue tiles outside P1, read towards the grid: rows left to right, columns top
// to bottom. Each entry is the run's sum followed by the tile's colour letter,
// which is also the tile's fill colour in the payload.
const P1_ROW_CLUES = [
  ['4G', '8Y', '6G'],
  ['3G', '6B', '7R', '1B', '4G'],
  ['5G', '2R', '10G', '3R', '1G'],
  ['6R', '3Y', '3R', '4Y', '5R'],
  ['2G', '13B', '6G'],
  ['5G', '7B', '5G'],
];
const P1_COL_CLUES = [
  ['8G', '6R', '2G'],
  ['4G', '6B', '2R', '3Y', '1B', '5G'],
  ['5Y', '2R', '4G', '1R', '9B'],
  ['3Y', '5R', '6G', '2R', '5B'],
  ['6G', '1B', '3R', '4Y', '5B', '2G'],
  ['5G', '5R', '9G'],
];
const parseClues = (list) => list.map(text => ({
  sum: parseInt(text, 10),
  code: SHADE_CODE[text[text.length - 1]],
}));

// One machine per line, scanning [shade, digit] pairs cell by cell. State:
//   k   the clue this line is currently on (or next expects),
//   s   the running total of the run in progress, 0 when no run is open,
//   act whether the digit about to be read belongs to the open run,
//   p   0 = the next symbol is a shade code, 1 = it is a digit.
// A run ends when the colour changes or the shading stops, and the clue list is
// exhaustive, so a colour that would start a run past the last clue, or a run
// whose total misses its clue, has no accepting continuation. Two clues of the
// same colour in a row would need an unshaded cell between them (a same-colour
// neighbour continues the open run instead); no line here has such a pair.
const japaneseSumsNfa = (clues) => {
  const n = clues.length;
  return NFA.encodeSpec({
    startState: { k: 0, s: 0, act: 0, p: 0 },
    transition: ({ k, s, act, p }, value) => {
      if (p === 0) {
        if (value > 5) return undefined;          // not a shade code
        if (value === SHADE_OFF) {
          if (s > 0) {
            if (s !== clues[k].sum) return undefined;
            return { k: k + 1, s: 0, act: 0, p: 1 };
          }
          return { k, s: 0, act: 0, p: 1 };
        }
        let nk = k;
        if (s > 0) {
          if (clues[nk].code === value) return { k: nk, s, act: 1, p: 1 };
          if (s !== clues[nk].sum) return undefined;
          nk += 1;
        }
        if (nk >= n || clues[nk].code !== value) return undefined;
        return { k: nk, s: 0, act: 1, p: 1 };
      }
      if (!act) return { k, s, act: 0, p: 0 };
      const ns = s + value;
      if (ns > clues[k].sum) return undefined;    // the run has overshot its clue
      return { k, s: ns, act: 0, p: 0 };
    },
    accept: ({ k, s, p }) =>
      p === 0 && (s === 0 ? k === n : (k === n - 1 && s === clues[k].sum)),
    maxDepth: 12,
  }, anchorShape);
};

const interleaveShade = (cells) =>
  cells.flatMap(([r, c]) => [shade.cell(r, c), at(0, r, c)]);
const japaneseSums = [
  ...P1_ROW_CLUES.map((list, i) => new NFA(
    japaneseSumsNfa(parseClues(list)), `jsrow${i + 1}`,
    interleaveShade(IDX.map(c => [i + 1, c])))),
  ...P1_COL_CLUES.map((list, i) => new NFA(
    japaneseSumsNfa(parseClues(list)), `jscol${i + 1}`,
    interleaveShade(IDX.map(r => [r, i + 1])))),
];

// ---------------------------------------------------------------------------
// P2: renban lines. Cell paths of the four purple strokes.

const P2_RENBAN = [
  [[3, 2], [2, 3], [1, 4]],
  [[3, 1], [4, 1], [5, 2]],
  [[4, 3], [3, 4], [3, 5]],
  [[6, 2], [6, 3], [5, 4]],
];
const renbans = P2_RENBAN.map(path => new Renban(...cellsOf(1, path)));

// ---------------------------------------------------------------------------
// P3: wheels. Each grey ring is centred on a cell centre and reaches into that
// cell's four orthogonal neighbours; a digit disc sits where the ring crosses
// each of the four shared borders. `cells` lists those neighbours clockwise
// from north, `digits` the disc at that ring position (null: no disc drawn).
// Turning the ring by k quarter-turns clockwise puts the digit from position
// i-k into the cell at position i, so the rule is the disjunction over k.
const P3_WHEELS = [
  { cells: [[1, 4], [2, 5], [3, 4], [2, 3]], digits: [3, 2, null, 5] },
  { cells: [[3, 2], [4, 3], [5, 2], [4, 1]], digits: [2, 6, null, 4] },
  { cells: [[4, 5], [5, 6], [6, 5], [5, 4]], digits: [6, null, null, 4] },
];
const wheels = P3_WHEELS.map(({ cells, digits }) => new Or(
  [0, 1, 2, 3].map(k => new And(
    [0, 1, 2, 3]
      .filter(i => digits[(i - k + 4) % 4] !== null)
      .map(i => new Given(at(2, ...cells[i]), digits[(i - k + 4) % 4]))))));

// ---------------------------------------------------------------------------
// P4: arrows. Circle first, then the arm outwards from it.

const P4_ARROWS = [
  [[2, 2], [3, 3], [3, 4]],
  [[4, 6], [5, 5], [6, 4]],
  [[2, 1], [3, 1], [4, 1]],
  [[4, 3], [5, 2]],
  [[5, 4], [6, 3]],
];
const arrows = P4_ARROWS.map(path => new Arrow(...cellsOf(3, path)));

// ---------------------------------------------------------------------------
// P5: multiplicative arrows.

// Scans the arm cells, then the target's cells most significant first. State:
//   i how many cells have been read, v the running product while i < armLen and
//   afterwards what is left of that product once each target digit's place
//   value has been subtracted. The product only ever grows, so passing the
//   target's largest possible value is dead; accept when nothing is left over.
const productNfa = (armLen, targetLen) => {
  const total = armLen + targetLen;
  const maxTarget = Math.pow(10, targetLen) - 1;
  return NFA.encodeSpec({
    startState: { i: 0, v: 1 },
    transition: ({ i, v }, value) => {
      if (i < armLen) {
        const product = v * value;
        if (product > maxTarget) return undefined;
        return { i: i + 1, v: product };
      }
      const rest = v - Math.pow(10, total - 1 - i) * value;
      if (rest < 0) return undefined;
      return { i: i + 1, v: rest };
    },
    accept: ({ i, v }) => i === total && v === 0,
    maxDepth: total,
  }, anchorShape);
};

const P5_ARROWS = [
  { arm: [[5, 6], [4, 6], [3, 5]], target: [[6, 6]] },
  { arm: [[6, 4], [6, 5]], target: [[5, 2], [5, 3]] },
  { arm: [[2, 4], [3, 3], [3, 2]], target: [[1, 4], [1, 5]] },
];
const productArrows = P5_ARROWS.map(({ arm, target }, i) => new NFA(
  productNfa(arm.length, target.length), `product${i + 1}`,
  [...cellsOf(4, arm), ...cellsOf(4, target)]));

// ---------------------------------------------------------------------------
// P6: the moon/sun loop.

const LOOP_BOARD = 5;
const EDGE_OFF = 1, EDGE_ON = 2, CELL_OFF = 1, CELL_ON = 2;
const TYPE_SUN = 1, TYPE_MOON = 2;

// One Var per orthogonal cell pair, holding whether the loop uses that step.
// An edge model rather than membership-plus-degree because a centre-to-centre
// loop that is "non-branching, non-intersecting" is allowed to run alongside
// itself: two on-loop cells may be adjacent without the step between them
// being used, which a neighbour count cannot tell from a branch.
const eh = new Var('EH', 'P6 loop step rXcY-rXc(Y+1); 1 unused, 2 used', '6x5');
const ev = new Var('EV', 'P6 loop step rXcY-r(X+1)cY; 1 unused, 2 used', '5x6');
const onLoop = new Var('ON', 'P6 loop membership; 1 off, 2 on', '6x6');
const boxType = new Var('BT', 'P6 box clue type; 1 sun, 2 moon', 6);

const loopDomains = [
  ...IDX.flatMap(r => [1, 2, 3, 4, 5].map(
    c => new Given(eh.cell(r, c), EDGE_OFF, EDGE_ON))),
  ...[1, 2, 3, 4, 5].flatMap(r => IDX.map(
    c => new Given(ev.cell(r, c), EDGE_OFF, EDGE_ON))),
  ...IDX.flatMap(r => IDX.map(
    c => new Given(onLoop.cell(r, c), CELL_OFF, CELL_ON))),
  ...[0, 1, 2, 3, 4, 5].map(
    b => new Given(boxType.cell(b + 1), TYPE_SUN, TYPE_MOON)),
];

const incidentEdges = (r, c) => [
  ...(c > 1 ? [eh.cell(r, c - 1)] : []),
  ...(c < 6 ? [eh.cell(r, c)] : []),
  ...(r > 1 ? [ev.cell(r - 1, c)] : []),
  ...(r < 6 ? [ev.cell(r, c)] : []),
];

// Each cell uses either no steps or exactly two -- non-branching, and a loop
// rather than a path. With every edge 1 or 2, the incident edges total
// (count + used), so subtracting twice the 1/2 membership flag leaves the
// constant (count - 2): the flag is forced to 2 exactly when two steps are
// used, and 1 exactly when none are.
const loopDegree = IDX.flatMap(r => IDX.map(c => {
  const inc = incidentEdges(r, c);
  return new Sum(inc.length - 2, ...inc, [onLoop.cell(r, c), -2]);
}));

// Steps leaving each box. "Visits each box exactly once" is exactly two of
// them: a closed loop crossing a box border twice has one run inside.
const boxBorderEdges = (b) => {
  const br = Math.floor(b / 2), bc = b % 2;
  const rows = [2 * br + 1, 2 * br + 2], cols = [3 * bc + 1, 3 * bc + 2, 3 * bc + 3];
  return [
    ...(br > 0 ? cols.map(c => ev.cell(2 * br, c)) : []),
    ...(br < 2 ? cols.map(c => ev.cell(2 * br + 2, c)) : []),
    ...(bc > 0 ? rows.map(r => eh.cell(r, 3 * bc)) : []),
    ...(bc < 1 ? rows.map(r => eh.cell(r, 3 * bc + 3)) : []),
  ];
};
const boxVisits = [0, 1, 2, 3, 4, 5].map(b => {
  const edges = boxBorderEdges(b);
  return new Sum(edges.length + 2, ...edges);
});

// No 2x2 block may have all four of its steps used. Such a block is already a
// closed 4-cycle, so its cells can carry nothing else, and a loop that has to
// cross all six box borders cannot be four cells; with the two rules above this
// leaves no room for a second component, which is what makes the drawing a
// single loop.
const noSmallCycle = [1, 2, 3, 4, 5].flatMap(r => [1, 2, 3, 4, 5].map(
  c => new Or([
    new Given(eh.cell(r, c), EDGE_OFF),
    new Given(eh.cell(r + 1, c), EDGE_OFF),
    new Given(ev.cell(r, c), EDGE_OFF),
    new Given(ev.cell(r, c + 1), EDGE_OFF),
  ])));

const loopWhispers = [
  ...IDX.flatMap(r => [1, 2, 3, 4, 5].map(c => new Or([
    new Given(eh.cell(r, c), EDGE_OFF),
    new Whisper(3, at(LOOP_BOARD, r, c), at(LOOP_BOARD, r, c + 1)),
  ]))),
  ...[1, 2, 3, 4, 5].flatMap(r => IDX.map(c => new Or([
    new Given(ev.cell(r, c), EDGE_OFF),
    new Whisper(3, at(LOOP_BOARD, r, c), at(LOOP_BOARD, r + 1, c)),
  ]))),
];

// Filled yellow discs and yellow crescent glyphs.
const P6_SUNS = [[1, 3], [2, 4], [3, 4], [4, 1], [4, 3], [5, 4], [6, 1]];
const P6_MOONS = [[1, 4], [2, 2], [3, 3], [3, 6], [4, 5], [5, 3], [6, 4]];
const inBox = (b, list) => list.filter(([r, c]) => p6BoxOfCell(r, c) === b);

const boxClueTypes = [0, 1, 2, 3, 4, 5].map(b => {
  const suns = inBox(b, P6_SUNS), moons = inBox(b, P6_MOONS);
  const branch = (type, on, off) => new And([
    new Given(boxType.cell(b + 1), type),
    ...on.map(([r, c]) => new Given(onLoop.cell(r, c), CELL_ON)),
    ...off.map(([r, c]) => new Given(onLoop.cell(r, c), CELL_OFF)),
  ]);
  return new Or([
    branch(TYPE_SUN, suns, moons),
    branch(TYPE_MOON, moons, suns),
  ]);
});

// Box pairs sharing a border, with the steps that would cross it. Two boxes are
// consecutive along the loop exactly when at least one of those steps is used.
const BOX_NEIGHBOURS = [];
for (let b = 0; b < 6; b++) {
  const br = Math.floor(b / 2), bc = b % 2;
  if (bc === 0) {
    BOX_NEIGHBOURS.push([b, b + 1,
      [2 * br + 1, 2 * br + 2].map(r => eh.cell(r, 3))]);
  }
  if (br < 2) {
    BOX_NEIGHBOURS.push([b, b + 2,
      [3 * bc + 1, 3 * bc + 2, 3 * bc + 3].map(c => ev.cell(2 * br + 2, c))]);
  }
}
const consecutiveTypes = BOX_NEIGHBOURS.map(([a, b, edges]) => new Or([
  new And(edges.map(e => new Given(e, EDGE_OFF))),
  new AllDifferent(boxType.cell(a + 1), boxType.cell(b + 1)),
]));

// ---------------------------------------------------------------------------
// P7: garden path lines, each already cut in two by the single box border it
// crosses. Either segment may be the doubled one.

const P7_LINES = [
  [[[2, 1], [2, 2]], [[3, 2], [3, 3]]],
  [[[4, 2], [4, 3]], [[4, 4]]],
  [[[2, 5]], [[3, 6], [4, 6], [4, 5]]],
  [[[4, 5]], [[5, 5]]],
  [[[6, 5], [5, 4]], [[6, 3], [5, 2]]],
  [[[1, 3], [2, 3]], [[2, 4], [1, 4]]],
];
const gardenPaths = P7_LINES.map(([segA, segB]) => {
  const a = cellsOf(6, segA), b = cellsOf(6, segB);
  return new Or([
    new Sum(0, ...a, ...b.map(cell => [cell, -2])),
    new Sum(0, ...b, ...a.map(cell => [cell, -2])),
  ]);
});

return [
  anchorShape, anchorGiven,
  ...boards,
  shade, eh, ev, onLoop, boxType,
  ...[0, 1, 2, 3, 5, 6].flatMap(sudoku6),
  ...sudokuUnknownSet,
  ...linkConstraints,
  ...shadeDomain,
  ...japaneseSums,
  ...renbans,
  ...wheels,
  ...arrows,
  ...productArrows,
  ...loopDomains,
  ...loopDegree,
  ...boxVisits,
  ...noSmallCycle,
  ...loopWhispers,
  ...boxClueTypes,
  ...consecutiveTypes,
  ...gardenPaths,
];
