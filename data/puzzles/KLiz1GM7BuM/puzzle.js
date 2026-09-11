// Title: Caterdokupillar
// Author: Much of the setting community
// Video: https://www.youtube.com/watch?v=KLiz1GM7BuM
// Source: https://sudokupad.app/memeristor/smoldokupillar1?setting-nogrid=1&setting-largepuzzle=1

// Seven 6x6 variant puzzles drawn on one 42x26 canvas, each overlapping the next
// in a 2x2 corner block. The chain rule -- "as each 6x6 puzzle is completed, 4
// digits will automatically carry over as givens for the next puzzle" -- is
// exactly that overlap. Canvas positions (1-indexed rows/columns of the canvas):
//
//   1. Face of Eternity          theasylm                      r7c7   - r12c12
//   2. Aperitif                  Tallcat                       r11c11 - r16c16
//   3. Wheels                    Alaric Taqi A. (Crusader175)  r15c15 - r20c20
//   4. Arrow Sudoku              Agent                         r19c11 - r24c16
//   5. Metamorphosnipe           Philip Newman                 r23c15 - r28c20
//   6. Moon-Sun Caterdokupillar  Math Pesto                    r27c11 - r32c16
//   7. Double or Nothin'         Kennet's Dad                  r31c15 - r36c20
//
// Rules encoded:
//   Puzzles 1-4, 6, 7: normal 6x6 Sudoku -- 1-6 once each in every row, column
//     and box.
//   Puzzle 5 (Metamorphosnipe): six digits selected from 1-9, once each in every
//     row, column and box; which six is part of the answer.
//   Puzzle 1: coloured Japanese sums. The squares outside the grid give, in
//     order, the runs of contiguous cells shaded that colour, each square holding
//     the sum of its run. All shaded runs are given. Colours: green, red, black,
//     yellow.
//   Puzzle 2: renban lines -- digits on a purple line are a set of non-repeating
//     consecutive digits in any order.
//   Puzzle 3: wheels -- the digits written round a grey circle go into the four
//     cells the circle touches, in the same circular order, after a rotation of
//     0, 90, 180 or 270 degrees. Repeats allowed where other rules allow them.
//   Puzzle 4: arrows -- the digit in a circle is the sum of the digits along its
//     arrow, repeats allowed.
//   Puzzle 5: multiplicative arrows -- the product of the digits along an arrow
//     equals the number in its connected circle, or in its pill read left to
//     right / top to bottom. Repeats allowed.
//   Puzzle 7: garden path lines -- each blue line is cut into segments by box
//     borders, and one segment's sum is double the other's.
//
// Rules omitted, all of them puzzle 6's, which is left with its Sudoku layer and
// its two carried-over 2x2 blocks:
//   - the solver-drawn non-branching, non-intersecting orthogonal loop;
//   - the loop visiting each box exactly once;
//   - within a visited box, the loop passing through all moons and no suns, or
//     all suns and no moons;
//   - the loop not passing through the same clue type in two consecutively used
//     boxes;
//   - the German whispers rule (adjacent difference of at least 3) along the
//     loop.
// Nothing below reads puzzle 6's drawn moons and suns.
//
// Board layout. The canvas is 42x26, past the 16-row/16-column cap on every ISS
// grid, so the answer cannot be the Shape's own grid. Each 6x6 puzzle is instead
// one 6x6 Var group, and the carry-over blocks are equalities between the two
// groups that hold the same canvas cell. The main grid is a single unused Raw
// cell, pinned so it adds no freedom.

const shape = new Shape('1x1', 9, 'Raw');

// A plain 6x6 Sudoku geometry, used only to lay out and address the Var groups:
// its rows, columns and 2x3 boxes are the houses each puzzle is solved over.
const grid = cellGraph('6x6');

// Top-left canvas cell of each puzzle, in chain order (the payload's per-grid
// `top`/`left`), with its box shape as [rows, columns] and the Var group that
// holds its digits. Box shapes are read off the thick walls that run the full
// width or height of each grid: every puzzle but Metamorphosnipe is walled after
// its 2nd and 4th row and after its 3rd column, and Metamorphosnipe after its
// 3rd row and its 2nd and 4th columns.
const PUZZLES = [
  { name: 'A', top: 7, left: 7, box: [2, 3] },
  { name: 'B', top: 11, left: 11, box: [2, 3] },
  { name: 'C', top: 15, left: 15, box: [2, 3] },
  { name: 'D', top: 19, left: 11, box: [2, 3] },
  { name: 'E', top: 23, left: 15, box: [3, 2] },
  { name: 'F', top: 27, left: 11, box: [2, 3] },
  { name: 'G', top: 31, left: 15, box: [2, 3] },
].map(p => ({ ...p, layer: grid.makeOverlay('V' + p.name) }));
const [P1, P2, P3, P4, P5, P6, P7] = PUZZLES;

// A canvas cell, as held by one named puzzle's Var group.
const at = (p, r, c) => p.layer.at(makeCellId(r - p.top + 1, c - p.left + 1));
const cellsOn = (p, coords) => coords.map(([r, c]) => at(p, r, c));

const groups = PUZZLES.map(p => p.layer.toVar('digit'));

// The six rows, six columns and six boxes each puzzle is solved over.
const housesOf = (p) => {
  const [boxRows, boxCols] = p.box;
  const boxes = [];
  for (let r = 1; r <= 6; r += boxRows) {
    for (let c = 1; c <= 6; c += boxCols) {
      boxes.push(p.layer.block(p.layer.at(makeCellId(r, c)), boxRows, boxCols));
    }
  }
  return [...p.layer.rows(), ...p.layer.columns(), ...boxes];
};

const sudoku = PUZZLES.flatMap(
  p => housesOf(p).map(house => new AllDifferent(...house)));

// Puzzles 1-4, 6 and 7 place 1-6; puzzle 5 draws from all of 1-9.
const digitRanges = PUZZLES.filter(p => p !== P5).map(
  p => p.layer.makeReplicate(new Given(p.layer.cells()[0], 1, 2, 3, 4, 5, 6)));

// The carry-over: wherever two puzzles cover the same canvas cell, the two Var
// groups hold one digit. Derived from the positions above, over every pair.
const carriedOver = PUZZLES.flatMap((a, i) => PUZZLES.slice(i + 1).flatMap(b => {
  const rows = [], cols = [];
  for (let r = Math.max(a.top, b.top); r <= Math.min(a.top + 5, b.top + 5); r++) rows.push(r);
  for (let c = Math.max(a.left, b.left); c <= Math.min(a.left + 5, b.left + 5); c++) cols.push(c);
  return rows.flatMap(r => cols.map(c => new SameValues(2, at(a, r, c), at(b, r, c))));
}));

// ---------------------------------------------------------------------------
// 1. Face of Eternity -- coloured Japanese sums
// ---------------------------------------------------------------------------

// One shading cell per cell of puzzle 1, holding that cell's colour.
const UNSHADED = 1, GREEN = 2, RED = 3, BLACK = 4, YELLOW = 5;
const COLOUR = { G: GREEN, R: RED, B: BLACK, Y: YELLOW };
const shades = grid.makeOverlay('VS');
const shadeRange = shades.makeReplicate(
  new Given(shades.cells()[0], UNSHADED, GREEN, RED, BLACK, YELLOW));

// Transcribed from the coloured squares drawn outside puzzle 1: [sum, colour],
// in the order the squares are drawn, which is the order of the runs -- left to
// right for a row's squares (canvas columns 2-6), top to bottom for a column's
// (canvas rows 1-6). Fills are green #70ad84, red #e08570, yellow #feff75 and
// black #000000; the black squares are the ones whose numbers print in white.
// Keys are the row / column of puzzle 1's own 6x6 grid.
const ROW_CLUES = [
  [[4, 'G'], [8, 'Y'], [6, 'G']],
  [[3, 'G'], [6, 'B'], [7, 'R'], [1, 'B'], [4, 'G']],
  [[5, 'G'], [2, 'R'], [10, 'G'], [3, 'R'], [1, 'G']],
  [[6, 'R'], [3, 'Y'], [3, 'R'], [4, 'Y'], [5, 'R']],
  [[2, 'G'], [13, 'B'], [6, 'G']],
  [[5, 'G'], [7, 'B'], [5, 'G']],
];
const COL_CLUES = [
  [[8, 'G'], [6, 'R'], [2, 'G']],
  [[4, 'G'], [6, 'B'], [2, 'R'], [3, 'Y'], [1, 'B'], [5, 'G']],
  [[5, 'Y'], [2, 'R'], [4, 'G'], [1, 'R'], [9, 'B']],
  [[3, 'Y'], [5, 'R'], [6, 'G'], [2, 'R'], [5, 'B']],
  [[6, 'G'], [1, 'B'], [3, 'R'], [4, 'Y'], [5, 'B'], [2, 'G']],
  [[5, 'G'], [5, 'R'], [9, 'G']],
];

// The machine reads a line as [shade, digit, shade, digit, ...]. Its state is
// `idx`, the number of runs already completed, and `rem`, how much of the current
// run's clued sum is still outstanding, with `rem < 0` standing for "not inside a
// run". So a run ends exactly when its clue's sum is reached, and the next shaded
// cell has to open the next clue's run -- which is what makes the clue list
// exhaustive ("all shaded runs are given"). Two runs of the same colour cannot
// touch, since they would read as one run: the transition out of `rem === 0` only
// accepts the colour of the *next* clue.
const japaneseSums = (clues) => NFA.encodeSpec({
  startState: { expectShade: true, idx: 0, rem: -1 },
  transition: ({ expectShade, idx, rem }, value) => {
    if (!expectShade) {
      if (rem < 0) return { expectShade: true, idx, rem };  // unshaded: digit free
      if (value > rem) return undefined;                    // run would overshoot
      return { expectShade: true, idx, rem: rem - value };
    }
    if (value === UNSHADED) {
      if (rem > 0) return undefined;                        // run left unfinished
      return { expectShade: false, idx: rem === 0 ? idx + 1 : idx, rem: -1 };
    }
    if (rem > 0) {
      return value === COLOUR[clues[idx][1]]
        ? { expectShade: false, idx, rem } : undefined;
    }
    const next = rem === 0 ? idx + 1 : idx;                 // rem === 0 closes a run
    if (next >= clues.length || value !== COLOUR[clues[next][1]]) return undefined;
    return { expectShade: false, idx: next, rem: clues[next][0] };
  },
  accept: ({ expectShade, idx, rem }) => expectShade && (
    rem < 0 ? idx === clues.length : rem === 0 && idx === clues.length - 1),
}, shape);

const japaneseLines = [
  ...ROW_CLUES.map((clues, i) => new NFA(
    japaneseSums(clues), `japanese sums row ${i + 1}`,
    ...grid.row(i + 1).flatMap(cell => [shades.at(cell), P1.layer.at(cell)]))),
  ...COL_CLUES.map((clues, j) => new NFA(
    japaneseSums(clues), `japanese sums column ${j + 1}`,
    ...grid.column(j + 1).flatMap(cell => [shades.at(cell), P1.layer.at(cell)]))),
];

// ---------------------------------------------------------------------------
// 2. Aperitif -- renban lines
// ---------------------------------------------------------------------------

// Purple (#f067f0) strokes, as canvas cells along each stroke.
const RENBAN = [
  [[13, 12], [12, 13], [11, 14]],
  [[13, 11], [14, 11], [15, 12]],
  [[14, 13], [13, 14], [13, 15]],
  [[16, 12], [16, 13], [15, 14]],
];
const renbans = RENBAN.map(line => new Renban(...cellsOn(P2, line)));

// ---------------------------------------------------------------------------
// 3. Wheels
// ---------------------------------------------------------------------------

// Each wheel is a grey ring of diameter 1.525 drawn centred on a cell, so it
// crosses that cell's four borders and reaches into the four orthogonal
// neighbours. Its digits sit on white dots drawn on those four borders, which is
// what ties each digit to a compass direction; a direction with no dot carries no
// digit. Ring order below is N, E, S, W -- clockwise, as drawn.
const WHEELS = [
  { centre: [16, 18], ring: [3, 2, null, 5] },
  { centre: [18, 16], ring: [2, 6, null, 4] },
  { centre: [19, 19], ring: [6, null, null, 4] },
];
const STEP = [[-1, 0], [0, 1], [1, 0], [0, -1]];  // N, E, S, W
const wheels = WHEELS.map(({ centre: [r, c], ring }) => new Or(
  // Rotating the wheel through 90 degrees k times sends the digit written at
  // position p to the neighbour at position p + k.
  [0, 1, 2, 3].map(k => new And(ring.flatMap((digit, p) => {
    if (digit === null) return [];
    const [dr, dc] = STEP[(p + k) % 4];
    return [new Given(at(P3, r + dr, c + dc), digit)];
  })))));

// ---------------------------------------------------------------------------
// 4. Arrow Sudoku
// ---------------------------------------------------------------------------

// [circle, ...arm], the arm read from the circle outwards along the drawn stroke.
const ARROWS = [
  [[20, 12], [21, 13], [21, 14]],
  [[22, 16], [23, 15], [24, 14]],
  [[20, 11], [21, 11], [22, 11]],
  [[22, 13], [23, 12]],
  [[23, 14], [24, 13]],
];
const arrows = ARROWS.map(cells => new Arrow(...cellsOn(P4, cells)));

// ---------------------------------------------------------------------------
// 5. Metamorphosnipe
// ---------------------------------------------------------------------------

// "Select exactly 6 digits from 1-9 and place them exactly once in every row,
// column and 2x3 box": the AllDifferent groups above already place six distinct
// digits per house, and this makes all eighteen houses agree on which six.
const metaHouses = housesOf(P5);
const unknownDigitSet = new SameValues(metaHouses.length, ...metaHouses.flat());

// [[target cells], [arm cells]] in canvas coordinates. A two-cell target is a
// pill, read left to right or top to bottom, so its digits are the tens and units
// of one number; a one-cell target is a circle.
const MULT_ARROWS = [
  [[[28, 20]], [[27, 20], [26, 20], [25, 19]]],
  [[[27, 16], [27, 17]], [[28, 18], [28, 19]]],
  [[[23, 18], [23, 19]], [[24, 18], [25, 17], [25, 16]]],
];
// Reads [target digits..., arm digits...]. The state builds the target as a
// decimal number while `read` counts its cells, then divides it by each arm digit
// in turn; a digit that does not divide what is left is rejected, so accepting
// means the arm's product is exactly the target.
const multArrow = (targetLen) => NFA.encodeSpec({
  startState: { read: 0, rem: 0 },
  transition: ({ read, rem }, value) => {
    if (read < targetLen) return { read: read + 1, rem: rem * 10 + value };
    if (rem % value !== 0) return undefined;
    return { read, rem: rem / value };
  },
  accept: ({ read, rem }) => read === targetLen && rem === 1,
}, shape);
const multArrows = MULT_ARROWS.map(([target, arm], i) => new NFA(
  multArrow(target.length), `multiplicative arrow ${i + 1}`,
  ...cellsOn(P5, [...target, ...arm])));

// ---------------------------------------------------------------------------
// 7. Double or Nothin' -- garden path lines
// ---------------------------------------------------------------------------

// Blue (#1f8ce6) strokes, as canvas cells along each stroke. The closed one is
// listed rotated to start inside one box, so walking the list never splits a
// box's visit across the ends. Lines 3 and 4 share r34c19 but are drawn as two
// strokes with a visible break inside it, and taken separately each crosses
// exactly one box border, as "the sum of one segment ... the other segment"
// requires of a line.
const GARDEN_PATHS = [
  [[32, 15], [32, 16], [33, 16], [33, 17]],
  [[34, 16], [34, 17], [34, 18]],
  [[32, 19], [33, 20], [34, 20], [34, 19]],
  [[34, 19], [35, 19]],
  [[36, 19], [35, 18], [36, 17], [35, 16]],
  [[32, 17], [31, 17], [31, 18], [32, 18]],
];
// Which of puzzle 7's boxes a canvas cell lies in.
const boxKey = ([r, c]) => `${Math.floor((r - P7.top) / P7.box[0])},`
  + `${Math.floor((c - P7.left) / P7.box[1])}`;
const gardenPaths = GARDEN_PATHS.map(path => {
  const segments = [];
  for (const cell of path) {
    const last = segments[segments.length - 1];
    if (!last || boxKey(last[0]) !== boxKey(cell)) segments.push([]);
    segments[segments.length - 1].push(cell);
  }
  const [a, b] = segments.map(segment => cellsOn(P7, segment));
  const doubles = (x, y) => new Sum(0, ...x, ...y.map(cell => [cell, -2]));
  return new Or([doubles(a, b), doubles(b, a)]);
});

return [
  shape,
  new Given('R1C1', 1),
  ...groups,
  shades.toVar('shade'),
  ...digitRanges,
  shadeRange,
  ...sudoku,
  ...carriedOver,
  ...japaneseLines,
  ...renbans,
  ...wheels,
  ...arrows,
  unknownDigitSet,
  ...multArrows,
  ...gardenPaths,
];
