// Title: Fillomenon
// Author: Darth Paradox
// Video: https://www.youtube.com/watch?v=SBK2grkjTzU
// Source: https://sudokupad.app/darth-paradox/fillomenon

// 13x13, no givens, every cell holds a digit 1-9.
//
// Encoded here:
//  - Nine disjoint 3x3 boxes are drawn anywhere in the grid and each holds the
//    digits 1-9 once. The 81 cells they cover hold the Sudoku digits; the other
//    88 hold the Fillomino digits.
//  - Sudoku digits do not repeat in any row or column of the grid.
//  - Each outside clue is the sum of the Fillomino digits in its row or column,
//    Sudoku digits contributing nothing. ">" and "<" are strict.
//  - A Fillomino digit is never orthogonally adjacent to an identical Sudoku
//    digit.
//  - Arrows: the bulb digit is the sum of the arm digits.
//  - White dot: consecutive. Black dot: 1:2 ratio. Not all dots are given, so
//    unmarked neighbours are unconstrained.
//  - Purple lines: a set of consecutive, non-repeating digits in any order.
//
// Omitted: the Fillomino rule itself -- that the cells outside the boxes divide
// into orthogonally contiguous regions, that every such cell holds the size of
// its own region, that no two orthogonally adjacent regions share a size, and
// that no region exceeds nine cells. The digits outside the boxes are therefore
// constrained here only by the outside sums, the no-equal-neighbour rule and the
// drawn arrow/dot/line clues.
//
// Fog is a solving aid; it constrains nothing in the final grid.

// Raw: only the Sudoku digits are restricted in a row or column, so the grid
// carries no latin rule of its own. The value range starts at 0 because the
// three overlays below use 0 as a marker value; the grid cells are pinned back
// to 1-9.
const shape = new Shape('13x13', '0-9', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// VP: 0 if the cell is in no box, else its reading-order position 1-9 inside its
//     own box, so p = 3 * boxRow + boxCol + 1.
// VS: the cell's digit if it is a box cell, else 0.
// VF: the cell's digit if it is not a box cell, else 0.
const pos = graph.makeOverlay('VP');
const sud = graph.makeOverlay('VS');
const fil = graph.makeOverlay('VF');

const boxRow = p => ((p - 1) / 3) | 0;
const boxCol = p => (p - 1) % 3;

// Stepping right inside a box takes p to p + 1 until the box's rightmost column;
// after that column, and after any non-box cell, the next cell must be a non-box
// cell or the leftmost column of some box. Stepping down does the same with
// p + 3 and box rows. Together these make every VP = 1 cell the top-left corner
// of a full 3x3 block of box cells, and give every box cell exactly one corner;
// boxes cannot overlap because a cell has a single VP value.
const rightStep = Pair.fnToKey(
  (p, q) => (p !== 0 && boxCol(p) < 2) ? q === p + 1 : (q === 0 || boxCol(q) === 0),
  shape);
const downStep = Pair.fnToKey(
  (p, q) => (p !== 0 && boxRow(p) < 2) ? q === p + 3 : (q === 0 || boxRow(q) === 0),
  shape);

const boxLattice = [
  pos.makeReplicate(
    new Pair(rightStep, 'box lattice', pos.at('R1C1'), pos.at('R1C2')),
    pos.at(cells.filter(cell => graph.step(cell, 0, 1)))),
  pos.makeReplicate(
    new Pair(downStep, 'box lattice', pos.at('R1C1'), pos.at('R2C1')),
    pos.at(cells.filter(cell => graph.step(cell, 1, 0)))),
];

// A cell at (row, col) can carry position p only if its whole box fits on the
// grid: the corner (row - boxRow(p), col - boxCol(p)) must be within R1C1..R11C11.
const posDomains = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  const allowed = [0];
  for (let p = 1; p <= 9; p++) {
    const top = row - boxRow(p);
    const left = col - boxCol(p);
    if (top >= 1 && top <= 11 && left >= 1 && left <= 11) allowed.push(p);
  }
  return allowed.length === 10 ? null : new Given(pos.at(cell), ...allowed);
}).filter(c => c);

// Nine boxes: exactly nine cells are a box's top-left corner.
const boxCount = new ContainExact('1_1_1_1_1_1_1_1_1', ...pos.cells());

// "Place the digits 1-9 once into each box": at each of the 121 corners a box
// could occupy, either no box starts there or its nine cells are all different,
// which over nine cells drawn from 1-9 is once each.
const corners = cells.filter(cell => graph.block(cell, 3, 3));
const boxContents = corners.map(corner => new Or([
  new Given(pos.at(corner), 0, 2, 3, 4, 5, 6, 7, 8, 9),
  new AllDifferent(...graph.block(corner, 3, 3)),
]));

// VS is the digit or 0; VS is 0 exactly when VP is 0; VF is what is left of the
// digit, so exactly one of VS and VF is 0 and the other is the digit.
const digitOrZero = Pair.fnToKey((s, d) => s === 0 || s === d, shape);
const zeroTogether = Pair.fnToKey((p, s) => (p === 0) === (s === 0), shape);
const overlayLinks = cells.flatMap(cell => [
  new Pair(digitOrZero, 'sudoku digit', sud.at(cell), cell),
  new Pair(zeroTogether, 'box cell', pos.at(cell), sud.at(cell)),
  new EqualSum([cell], [sud.at(cell), fil.at(cell)]),
]);
const gridDigits = graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9));

// Sudoku digits do not repeat in a row or column of the grid; the 0s that stand
// for the Fillomino cells are exempt.
const distinctSudoku = PairX.fnToKey((a, b) => a === 0 || a !== b, shape);
const sudokuHouses = [...graph.rows(), ...graph.columns()].map(
  house => new PairX(distinctSudoku, 'sudoku house', ...sud.at(house)));

// A Fillomino digit must not be orthogonally adjacent to an identical Sudoku
// digit. VF is 0 on box cells and VS is 0 off them, so the rule is exactly "one
// cell's VF differs from its neighbour's VS unless both are 0" -- applied in
// both directions across each edge.
const noEqualNeighbour = Pair.fnToKey((f, s) => f === 0 || f !== s, shape);
const edges = cells.flatMap(cell => [graph.step(cell, 0, 1), graph.step(cell, 1, 0)]
  .filter(other => other).map(other => [cell, other]));
const separation = edges.flatMap(([a, b]) => [
  new Pair(noEqualNeighbour, 'fillomino beside sudoku', fil.at(a), sud.at(b)),
  new Pair(noEqualNeighbour, 'fillomino beside sudoku', fil.at(b), sud.at(a)),
]);

// The eight margin labels: three to the left of rows, five above columns.
const rowClues = [[1, '>83'], [4, '=36'], [13, '>82']];
const colClues = [[1, '>90'], [5, '=24'], [6, '=6'], [7, '=4'], [8, '<15']];

// A strict inequality becomes an equality once the shortfall is a variable. A
// line of 13 cells can carry a Fillomino total anywhere in 0..117, wider than
// one cell's range, so each slack is carried as a tens digit and a ones digit.
const slack = new Var('K', 'outside clue slack', 8);
let slackUsed = 0;
const outsideClue = (clue, line) => {
  const target = parseInt(clue.slice(1), 10);
  const total = fil.at(line);
  if (clue[0] === '=') return new Sum(target, ...total);
  const tens = slack.cell(++slackUsed);
  const ones = slack.cell(++slackUsed);
  return clue[0] === '>'
    ? new Sum(target + 1, ...total, [tens, -10], [ones, -1])   // total >= target + 1
    : new Sum(target - 1, ...total, [tens, 10], [ones, 1]);    // total <= target - 1
};
const outsideClues = [
  ...rowClues.map(([row, clue]) => outsideClue(clue, graph.row(row))),
  ...colClues.map(([col, clue]) => outsideClue(clue, graph.column(col))),
];

const id = ([row, col]) => makeCellId(row, col);

// The nine drawn arrows, bulb first then the arm cells in order out from the
// bulb. Most of the strokes bend; the cells listed are the ones the drawn stroke
// runs through, which for a bend includes cells its waypoints only pass over.
const arrows = [
  [[3, 8], [2, 7], [3, 7], [4, 7]],
  [[9, 3], [10, 3], [11, 4], [12, 4]],
  [[5, 11], [5, 10], [5, 9], [4, 8]],
  [[6, 12], [7, 13]],
  [[8, 9], [8, 10], [8, 11]],
  [[10, 13], [9, 12], [9, 11]],
  [[4, 3], [5, 4], [5, 5]],
  [[3, 4], [4, 4], [4, 5]],
  [[9, 5], [10, 5], [9, 4]],
].map(path => new Arrow(...path.map(id)));

// The ten drawn white dots and the three drawn black dots.
const whiteDots = [
  [[1, 8], [2, 8]], [[2, 8], [3, 8]], [[5, 1], [6, 1]], [[9, 2], [10, 2]],
  [[10, 4], [11, 4]], [[11, 3], [12, 3]], [[11, 5], [12, 5]], [[4, 3], [4, 4]],
  [[6, 11], [6, 12]], [[8, 5], [8, 6]],
].map(dot => new WhiteDot(...dot.map(id)));
const blackDots = [
  [[5, 5], [6, 5]], [[7, 6], [7, 7]], [[7, 7], [7, 8]],
].map(dot => new BlackDot(...dot.map(id)));

// The two drawn purple lines; the last step of the first one is diagonal.
const purpleLines = [
  [[9, 12], [10, 12], [11, 11]],
  [[10, 2], [11, 2], [12, 2]],
].map(line => new Renban(...line.map(id)));

return [
  shape,
  pos.toVar('box position'),
  sud.toVar('sudoku digit'),
  fil.toVar('fillomino digit'),
  slack,
  gridDigits,
  ...overlayLinks,
  ...posDomains,
  ...boxLattice,
  boxCount,
  ...boxContents,
  ...sudokuHouses,
  ...separation,
  ...outsideClues,
  ...arrows,
  ...whiteDots,
  ...blackDots,
  ...purpleLines,
];
