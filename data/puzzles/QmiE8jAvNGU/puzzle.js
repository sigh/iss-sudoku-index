// Title: Skyscraper Sudoku
// Author: Hans van Stippent
// Video: https://www.youtube.com/watch?v=QmiE8jAvNGU
// Source: https://cracking-the-cryptic.web.app/sudoku/39j3M9MMPb

// Normal sudoku (default row/column/box all-different, standard boxes; the
// payload's regions array is exactly the nine default 3x3 boxes) plus
// Skyscraper outside clues: an outside clue counts the buildings (digit
// heights) visible from that side of the grid, taller buildings blocking
// shorter ones behind them.
//
// Four corner triangles (6 cells each) are shaded grey and are "underground":
// no outside skyscraper clue can see into them, in either direction. A grey
// cell's digit is never counted as a visible building and never blocks the
// view of a building behind it -- the rules' own worked example says the "2"
// clue on row 2 only looks at columns 3-7, ignoring a 9 in columns 1 or 2.
// This is encoded by simply excluding grey cells from the lane an affected
// clue's visibility NFA scans, rather than by including them as invisible
// (never-blocking) obstacles.

const graph = cellGraph('9x9');

// Grey ("underground") cells, transcribed from the 24 drawn grey underlay
// shapes -- the anti-diagonal half of each corner 3x3 box.
const greyCells = new Set([
  'R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R3C1',
  'R1C7', 'R1C8', 'R1C9', 'R2C8', 'R2C9', 'R3C9',
  'R7C1', 'R8C1', 'R8C2', 'R9C1', 'R9C2', 'R9C3',
  'R7C9', 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9',
]);

// Standard skyscraper-visibility NFA: scan a lane nearest-clue-cell first,
// track the tallest building seen so far and how many "new tallest" (visible)
// buildings have appeared; accept when that count equals the clue's target.
// One spec per distinct clue value (only 2 and 5 appear).
const skyscraperSpec = (target) => NFA.encodeSpec({
  startState: { tallest: 0, visible: 0 },
  transition: ({ tallest, visible }, value) => ({
    tallest: Math.max(tallest, value),
    visible: visible + (value > tallest ? 1 : 0),
  }),
  accept: ({ visible }) => visible === target,
  maxDepth: 9,
}, 9);
const sky2 = skyscraperSpec(2);
const sky5 = skyscraperSpec(5);

// Outside clues, transcribed from the drawn overlay digits and the printed
// side they sit on (overlay indices from the payload's overlays array).
// [row, fromLeft, value, overlay index]
const rowClues = [
  [2, true, 2, 12],
  [3, false, 2, 13],
  [5, false, 5, 3],
  [6, true, 5, 4],
  [8, false, 5, 7],
  [9, true, 2, 14],
  [9, false, 2, 15],
];
// [col, fromTop, value, overlay index]
const colClues = [
  [2, true, 5, 0],
  [3, true, 2, 11],
  [4, true, 2, 10],
  [5, true, 5, 1],
  [5, false, 5, 5],
  [6, true, 2, 9],
  [6, false, 5, 6],
  [8, true, 5, 2],
  [9, true, 2, 8],
  [9, false, 2, 16],
];

// The lane in nearest-to-clue order, with grey cells dropped entirely (not
// counted, not blocking). graph.row()/column() already run in the natural
// (left-to-right / top-to-bottom) direction, so a "from the far side" clue
// just reverses it after filtering.
function visibleLane(cells, nearNaturalStart) {
  const visible = cells.filter(cell => !greyCells.has(cell));
  return nearNaturalStart ? visible : visible.slice().reverse();
}

const rowSkyscrapers = rowClues.map(([row, fromLeft, value]) =>
  new NFA(
    value === 2 ? sky2 : sky5,
    `sky_row${row}_${fromLeft ? 'left' : 'right'}`,
    ...visibleLane(graph.row(row), fromLeft)));

const colSkyscrapers = colClues.map(([col, fromTop, value]) =>
  new NFA(
    value === 2 ? sky2 : sky5,
    `sky_col${col}_${fromTop ? 'top' : 'bottom'}`,
    ...visibleLane(graph.column(col), fromTop)));

return [
  new Shape('9x9'),
  ...rowSkyscrapers,
  ...colSkyscrapers,
];
