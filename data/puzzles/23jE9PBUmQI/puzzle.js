// Title: Limbo
// Author: Testarossa
// Video: https://www.youtube.com/watch?v=23jE9PBUmQI
// Source: https://sudokupad.app/n4qHMLbtTd

// Four stacked pencil puzzles share one 9x9 grid. The 18 printed digits are both
// the sudoku givens and the stage-1 clues.
//
// 1) Shikaku: divide the grid into rectangles; each holds exactly one printed
//    digit, which is its area.
// 2) Star battle: one star per shikaku rectangle, two per row, column and box;
//    stars are never king-adjacent.
// 3) Masyu: each star is a circle -- black on a printed-digit cell, white
//    otherwise. A single non-branching, non-crossing loop through cell centres
//    passes through every circle; it goes straight through a white circle and
//    turns in at least one of that circle's two loop neighbours; it turns on a
//    black circle and goes straight through both of that circle's loop
//    neighbours.
// 4) Killer: normal sudoku. Each orthogonally-connected group of cells the loop
//    does not visit is a killer cage, and those groups plus the two drawn cages
//    all sum to the same total.
//
// Omitted: the loop is only required to be a single *connected* set of loop
// cells (ConnectedValues below), not a single loop. Two separate loops running
// alongside each other share no used edge yet remain cell-connected, so this
// relaxation admits them.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// Printed digits, transcribed from the grid's 18 given cells. Each is a sudoku
// given and the area of the shikaku rectangle that contains it.
const clues = {
  R1C3: 8, R1C9: 4, R2C1: 4, R2C7: 2, R3C3: 3, R3C4: 5,
  R3C9: 6, R4C3: 6, R4C4: 2, R4C8: 4, R5C6: 3, R7C1: 8,
  R7C5: 3, R8C1: 2, R8C6: 4, R8C7: 8, R9C1: 5, R9C7: 4,
};
const clueCells = Object.keys(clues);

// Cages drawn in the grid, both without a printed total.
const drawnCages = [['R5C5', 'R6C5'], ['R6C7']];

// --- Overlays -------------------------------------------------------------
// VS: which of a cell's four edges the loop uses. Encoding degree per cell as a
// shape code rather than counting on-loop neighbours is what lets the loop run
// alongside itself, which masyu allows.
const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
const ON_SHAPES = [HORIZ, VERT, UL, UR, DL, DR];
const TURNS = [UL, UR, DL, DR];
const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;

// VP: star placement. VA/VB: which shikaku rectangle covers the cell.
const NOSTAR = 1, STAR = 2;
const loop = graph.makeOverlay('VS');
const star = graph.makeOverlay('VP');
const labelA = graph.makeOverlay('VA');
const labelB = graph.makeOverlay('VB');
// VK holds the shared cage total, which the drawn single-cell cage fixes.
const totalVar = new Var('K', 'cage total', 1);
const TOTAL = totalVar.cell(1);

// 18 rectangles need 18 labels but one overlay holds at most 15, so the label is
// a digit pair (VA, VB) read as a 5x4 table; two rectangles overlapping a cell
// would demand two different pairs there.
const labelOf = i => [1 + Math.floor(i / 4), 1 + (i % 4)];

// --- Stage 1: shikaku -----------------------------------------------------
// Every axis-aligned rectangle of the clue's area that covers the clue and no
// other printed digit. The whole-grid partition then follows: the areas total 81,
// each cell carries one label pair, so the 18 chosen rectangles cannot overlap
// and must tile the grid.
const rectanglesFor = (cell, area) => {
  const { row, col } = parseCellId(cell);
  const rects = [];
  for (let h = 1; h <= geometry.numRows; h++) {
    if (area % h) continue;
    const w = area / h;
    if (w > geometry.numCols) continue;
    for (let r0 = Math.max(1, row - h + 1); r0 <= Math.min(row, geometry.numRows - h + 1); r0++) {
      for (let c0 = Math.max(1, col - w + 1); c0 <= Math.min(col, geometry.numCols - w + 1); c0++) {
        const cells = graph.block(makeCellId(r0, c0), h, w);
        if (cells.filter(x => x in clues).length === 1) rects.push(cells);
      }
    }
  }
  return rects;
};

// Each branch labels the rectangle's cells and gives it its single star; the star
// sum is `area` cells of value NOSTAR=1 plus one extra for the STAR=2.
const shikaku = clueCells.map((cell, i) => {
  const [la, lb] = labelOf(i);
  const area = clues[cell];
  return new Or(rectanglesFor(cell, area).map(rect => new And([
    ...rect.map(x => new Given(labelA.at(x), la)),
    ...rect.map(x => new Given(labelB.at(x), lb)),
    new Sum(area + 1, ...star.at(rect))])));
});

// --- Stage 2: star battle -------------------------------------------------
const starCounts = graph.rowsColumnsBoxes().map(
  line => new Sum(line.length + 2, ...star.at(line)));

// Two stars are never king-adjacent. Every king-adjacent pair lies in some 2x2
// block and all six pairs inside a block are king-adjacent, so one all-pairs
// relation per block is exactly the rule. Stamped onto each block's top-left.
const noAdjacentStars = PairX.fnToKey(
  (a, b) => !(a === STAR && b === STAR), geometry);
const starBlocks = star.cells().filter(c => star.block(c, 2, 2) !== null);
const starSpacing = star.makeReplicate(
  new PairX(noAdjacentStars, 'no-adjacent-stars',
    ...star.block(starBlocks[0], 2, 2)),
  starBlocks);

// --- Stage 3: masyu -------------------------------------------------------
// A cell may only use an edge that has a neighbour behind it.
const shapeDomains = gridCells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new Given(loop.at(cell), ...[OFF, ...ON_SHAPES].filter(s =>
    !(row === 1 && usesUp(s)) && !(row === geometry.numRows && usesDown(s)) &&
    !(col === 1 && usesLeft(s)) && !(col === geometry.numCols && usesRight(s))));
});

// Neighbours must agree about their shared edge: the first cell uses the edge
// towards the second iff the second uses it back. The relation is ordered, so
// Pair.fnToKey (which does not symmetrize) is the right key builder.
const edgeRight = Pair.fnToKey((a, b) => usesRight(a) === usesLeft(b), geometry);
const edgeDown = Pair.fnToKey((a, b) => usesDown(a) === usesUp(b), geometry);
// One stamped pair per direction; taking only right and down covers each
// orthogonal pair exactly once.
const edgeGroup = (key, label, dRow, dCol) => {
  const targets = loop.cells().filter(c => loop.step(c, dRow, dCol) !== null);
  return loop.makeReplicate(
    new Pair(key, label, targets[0], loop.step(targets[0], dRow, dCol)), targets);
};
const edgeAgreement = [
  edgeGroup(edgeRight, 'edge-h', 0, 1),
  edgeGroup(edgeDown, 'edge-v', 1, 0),
];

// The two edges each turn code uses, and the straight code a neighbour reached
// through that edge must take to be travelled straight through.
const TURN_EDGES = {
  [UL]: [[-1, 0], [0, -1]],
  [UR]: [[-1, 0], [0, 1]],
  [DL]: [[1, 0], [0, -1]],
  [DR]: [[1, 0], [0, 1]],
};
const straightFor = ([dR]) => (dR === 0 ? HORIZ : VERT);

// Only a starred cell is a circle, so each cell's masyu rule is "no star here, or
// the circle rule for this cell's colour". A printed digit makes it black.
const masyu = gridCells.map(cell => {
  const branches = [];
  if (cell in clues) {
    for (const [code, edges] of Object.entries(TURN_EDGES)) {
      const neighbours = edges.map(([dR, dC]) => graph.step(cell, dR, dC));
      if (neighbours.some(n => n === null)) continue;
      branches.push(new And([
        new Given(loop.at(cell), Number(code)),
        ...neighbours.map((n, k) => new Given(loop.at(n), straightFor(edges[k])))]));
    }
  } else {
    for (const [code, edges] of [[HORIZ, [[0, -1], [0, 1]]], [VERT, [[-1, 0], [1, 0]]]]) {
      const neighbours = edges.map(([dR, dC]) => graph.step(cell, dR, dC));
      if (neighbours.some(n => n === null)) continue;
      branches.push(new And([
        new Given(loop.at(cell), code),
        new Or(neighbours.map(n => new Given(loop.at(n), ...TURNS)))]));
    }
  }
  const noStar = new Given(star.at(cell), NOSTAR);
  return branches.length ? new Or([noStar, ...branches]) : noStar;
});

// --- Stage 4: killer ------------------------------------------------------
// The drawn cages fix the shared total; the single-cell one caps it at 9, which
// is what bounds every off-loop group to three cells below.
const totalRules = drawnCages.map(cage => new EqualSum(cage, [TOTAL]));

// Every orthogonally-connected cell set up to size 4, built by growing from each
// cell and deduplicating.
const connectedSets = (maxSize) => {
  const seen = new Set();
  const sets = [];
  const grow = (cells) => {
    const sorted = cells.slice().sort();
    const key = sorted.join('_');
    if (seen.has(key)) return;
    seen.add(key);
    sets.push(sorted);
    if (sorted.length === maxSize) return;
    for (const c of sorted) {
      for (const n of graph.neighbours(c)) {
        if (!sorted.includes(n)) grow([...sorted, n]);
      }
    }
  };
  for (const cell of gridCells) grow([cell]);
  return sets;
};
const allSets = connectedSets(4);
const borderOf = (cells) => [...new Set(cells.flatMap(c => graph.neighbours(c)))]
  .filter(c => !cells.includes(c));
const collinear = (cells) => {
  const parsed = cells.map(parseCellId);
  return parsed.every(p => p.row === parsed[0].row) ||
    parsed.every(p => p.col === parsed[0].col);
};

// No group has four cells: a killer cage's digits are distinct, so a four-cell
// group sums to at least 1+2+3+4 = 10, above the total the one-cell drawn cage
// caps at 9. Stated as: every connected four-set holds a loop cell.
const groupSizeBound = allSets.filter(s => s.length === 4).map(
  cells => new Or(cells.map(c => new Given(loop.at(c), ...ON_SHAPES))));

// For a set of at most three cells: unless some cell of it is on the loop, or
// some cell around it is off the loop -- i.e. unless it fails to be exactly one
// off-loop group -- it is a killer cage summing to the shared total.
const groupSums = allSets.filter(s => s.length <= 3).map(cells => {
  const cage = cells.length > 1 && !collinear(cells)
    ? new And([new EqualSum(cells, [TOTAL]), new AllDifferent(...cells)])
    : new EqualSum(cells, [TOTAL]);
  return new Or([
    ...cells.map(c => new Given(loop.at(c), ...ON_SHAPES)),
    ...borderOf(cells).map(c => new Given(loop.at(c), OFF)),
    cage]);
});

return [
  new Shape('9x9'),
  ...clueCells.map(cell => new Given(cell, clues[cell])),
  loop.toVar('loop'),
  star.toVar('star'),
  labelA.toVar('rectangle label A'),
  labelB.toVar('rectangle label B'),
  totalVar,
  star.makeReplicate(new Given(star.cells()[0], NOSTAR, STAR)),
  labelA.makeReplicate(new Given(labelA.cells()[0], 1, 2, 3, 4, 5)),
  labelB.makeReplicate(new Given(labelB.cells()[0], 1, 2, 3, 4)),
  new Given(TOTAL, 1, 2, 3, 4, 5, 6, 7, 8, 9),
  ...shikaku,
  ...starCounts,
  starSpacing,
  ...shapeDomains,
  ...edgeAgreement,
  ...masyu,
  new ConnectedValues('VS', ON_SHAPES),
  ...totalRules,
  ...groupSizeBound,
  ...groupSums,
];
