// Title: Po-Boy
// Author: Sniglett & cornishjohn
// Video: https://www.youtube.com/watch?v=0KYJrcoksbE
// Source: https://sudokupad.app/h8znpkd7qs

// Rules encoded here:
//  - Normal sudoku.
//  - Coral: every odd digit is coral, every even digit is water. All coral
//    cells are orthogonally connected. Water may form several bodies, and
//    every body is orthogonally connected to the edge of the grid. No 2x2
//    area is entirely coral or entirely water.
//  - Coral clues: the clues outside a row/column give the lengths of its
//    continuous runs of coral/water in reading order (left to right for a
//    row, top to bottom for a column); '*' stands for any positive number of
//    runs. Where a row/column is clued, all of its clues are shown; unclued
//    rows/columns are unrestricted.
//  - Sandwich: the same printed clue digits, concatenated in that same
//    reading order into an n-digit number, give the sum of the digits between
//    the 1 and the 9 of that row/column.
//  - Little killer: the digits on the marked main diagonal sum to 43, and may
//    repeat.
// Nothing is omitted.

const CORAL = 1;
const WATER = 2;

const shape = new Shape('9x9');
const geometry = cellGeometry(shape);
const graph = cellGraph(geometry);

// The coral/water shading lives on a layer one cell larger than the grid on
// every side; grid cell RrCc is shading cell (r+1, c+1). The ring is pinned to
// water and is connected all the way around, so asserting a single connected
// water region on this layer says exactly "every body of water reaches the
// edge of the grid" rather than "there is only one body". Coral occupies only
// interior cells, so a single connected coral region on the same layer is the
// coral rule unchanged. No clue below reads a ring cell.
const shade = new Var('S', 'coral/water shading', '11x11');
const shadeAt = cell => {
  const { row, col } = parseCellId(cell);
  return shade.cell(row + 1, col + 1);
};
const layerLine = Array.from({ length: 11 }, (_, i) => i + 1);
const ringPins = layerLine.flatMap(
  row => layerLine
    .filter(col => row === 1 || row === 11 || col === 1 || col === 11)
    .map(col => new Given(shade.cell(row, col), WATER)));

// Odd digit <-> coral, even digit <-> water. The key also confines the
// shading cells to the two shading values, which the connectivity sets need.
const parityKey = Pair.fnToKey(
  (digit, shading) =>
    (shading === CORAL || shading === WATER) &&
    ((digit % 2 === 1) === (shading === CORAL)),
  shape);
const shadeLinks = graph.cells().map(
  cell => new Pair(parityKey, 'shading', cell, shadeAt(cell)));

// No 2x2 area is entirely coral or entirely water: each 2x2 block of the grid
// holds at least one cell of each shade.
const noMono2x2 = graph.cells()
  .map(cell => graph.block(cell, 2, 2))
  .filter(block => block !== null)
  .map(block => new ContainAtLeast(
    `${CORAL}_${WATER}`, ...block.map(shadeAt)));

// Outside clues, transcribed from the text drawn beside each row/column in
// printed reading order (left to right beside a row, top to bottom above a
// column). `runs` is that printed sequence; `sandwich` is the same digits
// concatenated as an n-digit number.
const laneClues = [
  { cells: graph.row(3), runs: ['*', 2, 1], sandwich: 21 },
  { cells: graph.row(5), runs: ['*', 2, 3], sandwich: 23 },
  { cells: graph.row(7), runs: ['*', 1, 1], sandwich: 11 },
  { cells: graph.row(9), runs: ['*', 2], sandwich: 2 },
  { cells: graph.column(1), runs: ['*', 1, 3, '*'], sandwich: 13 },
  { cells: graph.column(4), runs: ['*', 3], sandwich: 3 },
  { cells: graph.column(7), runs: ['*', 1, 2], sandwich: 12 },
  { cells: graph.column(9), runs: ['*', 5], sandwich: 5 },
];

const ODD = '[13579]';
const EVEN = '[2468]';

// One alternative of a run-length clue, given the parity of its first
// numbered run; consecutive runs alternate parity from there. A numbered run
// is made maximal by naming the single opposite-parity cell on each side of
// the numbered block that is not a lane end: that cell is the last (or first)
// cell of the neighbouring '*' runs, whose remaining cells are free. The
// drawn clues only ever carry '*' at the ends.
const laneAlternative = (runs, firstIsOdd) => {
  const cls = isOdd => (isOdd ? ODD : EVEN);
  const numbers = runs.filter(run => run !== '*');
  let isOdd = firstIsOdd;
  const head = runs[0] === '*' ? '.*' + cls(!isOdd) : '';
  const body = numbers.map(length => {
    const segment = cls(isOdd) + (length > 1 ? `{${length}}` : '');
    isOdd = !isOdd;
    return segment;
  }).join('');
  const tail = runs[runs.length - 1] === '*' ? cls(isOdd) + '.*' : '';
  return head + body + tail;
};

const coralClues = laneClues.map(({ cells, runs }) => new Regex(
  `(${laneAlternative(runs, true)}|${laneAlternative(runs, false)})`, ...cells));

const sandwiches = laneClues.map(
  ({ cells, sandwich }) => Sandwich.fromCells(sandwich, cells, geometry));

return [
  shape,
  shade,
  ...ringPins,
  ...shadeLinks,
  new ConnectedValues('VS', CORAL),
  new ConnectedValues('VS', WATER),
  ...noMono2x2,
  ...coralClues,
  ...sandwiches,
  // The circled 43 sits outside R1C1 on the drawn down-right diagonal.
  LittleKiller.fromCells(43, graph.ray('R1C1', 1, 1), geometry),
];
