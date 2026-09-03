// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=SNAh_k16Aos
// Source: https://cracking-the-cryptic.web.app/sudoku/NHpMRLJHpP

// A star battle laid over a 9x9 sudoku, with outside clues that sandwich
// between the stars.
//
// Rules encoded:
//  - Normal sudoku: each row, column and 3x3 box holds 1-9 once.
//  - Two given digits, R5C4 = 1 and R5C6 = 2.
//  - Star battle: exactly two stars in each row, each column and each 3x3
//    box, and no two stars touch, not even diagonally. A star cell still
//    holds an ordinary digit.
//  - The number printed left of a row or above a column is the sum of the
//    digits strictly between that line's two stars; the starred cells
//    themselves are not counted.
//
// Stars are not drawn -- the solver places them -- so they live on a Var
// overlay VS1..VS81, one flag cell per grid cell, with 1 = no star and
// 2 = star (values chosen inside the 1-9 shape range so no widened Shape is
// needed). The flag values carry no arithmetic meaning of their own.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const NOT_STAR = 1;
const STAR = 2;

const star = graph.makeOverlay('VS');
const starAt = cell => star.at(cell);

// A star flag is only ever NOT_STAR or STAR; the overlay would otherwise take
// any digit in the shape range.
const starDomain = star.makeReplicate(
  new Given(star.cells()[0], NOT_STAR, STAR));

const starCount = graph.rowsColumnsBoxes().map(
  house => new ContainExact(`${STAR}_${STAR}`, ...star.at(house)));

// No two stars touch: one relation per unordered king-move adjacency.
const noTouchKey = Pair.fnToKey((a, b) => !(a === STAR && b === STAR), 9);
const kingPairs = [];
const seenPair = new Set();
for (const cell of gridCells) {
  for (const nb of graph.kingNeighbours(cell)) {
    const key = [cell, nb].sort().join('_');
    if (seenPair.has(key)) continue;
    seenPair.add(key);
    kingPairs.push([cell, nb]);
  }
}
// One Replicate per offset. The anti-diagonal template is anchored one cell
// left of its first flag, because a Replicate's anchor must stay on the board
// for every stamp and R1C2->R2C1 shifted from R1C1 would leave it.
const noTouchSpecs = [
  { offset: [0, 1], template: ['R1C1', 'R1C2'], anchor: ([a]) => a },
  { offset: [1, -1], template: ['R1C2', 'R2C1'], anchor: ([a]) => graph.step(a, 0, -1) },
  { offset: [1, 0], template: ['R1C1', 'R2C1'], anchor: ([a]) => a },
  { offset: [1, 1], template: ['R1C1', 'R2C2'], anchor: ([a]) => a },
];
const noTouch = noTouchSpecs.map(({ offset: [dRow, dCol], template, anchor }) => {
  const pairs = kingPairs.filter(([a, b]) => {
    const from = parseCellId(a), to = parseCellId(b);
    return to.row - from.row === dRow && to.col - from.col === dCol;
  });
  const [origin, adjacent] = template;
  const constraint = new Pair(
    noTouchKey, 'star no-touch', starAt(origin), starAt(adjacent));
  return star.makeReplicate(constraint, pairs.map(pair => starAt(anchor(pair))));
});

// Scans a line as interleaved [flag, digit] values. `starsSeen` counts the
// stars passed so far; a cell is "between" when exactly one star precedes it
// and the cell is not itself a star, and only a between cell's digit is added
// to the running sum. The sum saturates at target+1, a sink meaning "already
// too high", which bounds the compiled state count. maxDepth 18 is the
// longest line: 9 cells, two scanned values each. Accept requires both stars
// seen and the sum to equal the clue.
function betweenStarsMachine(target) {
  return NFA.encodeSpec({
    startState: { phase: 'flag', starsSeen: 0, sum: 0, between: false },
    transition: ({ phase, starsSeen, sum, between }, value) => {
      if (phase === 'flag') {
        const isStar = value === STAR;
        return {
          phase: 'digit',
          starsSeen: Math.min(starsSeen + (isStar ? 1 : 0), 2),
          sum,
          between: starsSeen === 1 && !isStar,
        };
      }
      return {
        phase: 'flag',
        starsSeen,
        sum: Math.min(sum + (between ? value : 0), target + 1),
        between: false,
      };
    },
    accept: ({ phase, starsSeen, sum }) => phase === 'flag' && starsSeen === 2 && sum === target,
    maxDepth: 18,
  }, geometry.numValues);
}

// The eighteen bordered numbers printed outside the frame: one to the left of
// each row, top to bottom, and one above each column, left to right.
const ROW_CLUES = [17, 3, 24, 4, 6, 6, 23, 12, 6];
const COL_CLUES = [12, 28, 3, 23, 7, 21, 4, 7, 9];

const rowClues = graph.rows().map((line, i) => new NFA(
  betweenStarsMachine(ROW_CLUES[i]), `between-stars-row-${i + 1}`,
  ...line.flatMap(cell => [starAt(cell), cell])));
const colClues = graph.columns().map((line, i) => new NFA(
  betweenStarsMachine(COL_CLUES[i]), `between-stars-col-${i + 1}`,
  ...line.flatMap(cell => [starAt(cell), cell])));

return [
  new Shape('9x9'),
  new Given('R5C4', 1),
  new Given('R5C6', 2),
  star.toVar('star'),
  starDomain,
  ...starCount,
  ...noTouch,
  ...rowClues,
  ...colClues,
];
