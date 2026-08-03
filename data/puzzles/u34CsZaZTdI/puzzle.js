// Title: Star Battle Sandwich Sudoku
// Author: Panthera
// Video: https://www.youtube.com/watch?v=u34CsZaZTdI
// Source: https://app.crackingthecryptic.com/sudoku/g4RJBfh4BJ

// Normal Sudoku (default row/column/box all-different) plus:
//
// Antiknight: identical digits may not be a knight's move apart.
//
// Star Battle: a hidden per-cell "is this a star" flag (the VS overlay, value
// 1 = no star, 2 = star). Exactly two stars per row/column/box (ContainExact),
// and no two stars touch orthogonally or diagonally (king-move Pair over the
// flags). Stars are not a separate value domain -- "stars can have any value"
// -- so no extra digit constraint applies to a star cell beyond ordinary
// Sudoku/Antiknight.
//
// Sandwich: one clue per row and per column giving the sum of the digits
// strictly between that line's two stars (star cells themselves excluded from
// the sum, whatever digit they hold). Encoded as one NFA per row/column
// scanning interleaved [flag, digit] pairs along the line: it tracks how many
// stars have been seen so far, marks a cell as "between" only when exactly one
// star has been seen before it and the cell itself is not a star, and adds a
// cell's digit to the running sum only when marked "between". Accept requires
// exactly two stars seen and the final sum equal to the clue.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const NOT_STAR = 1;
const STAR = 2;

const star = graph.makeOverlay('VS');
const starAt = cell => star.at(cell);

// Every star-flag cell is either NOT_STAR or STAR.
const firstStar = star.cells()[0];
const starDomain = star.makeReplicate(
  new Given(firstStar, NOT_STAR, STAR));

// Star Battle: exactly two stars per row/column/box.
const starCount = graph.rowsColumnsBoxes().map(
  house => new ContainExact(`${STAR}_${STAR}`, ...star.at(house)));

// Star Battle: no two stars touch orthogonally or diagonally (king-move).
const noTouchKey = Pair.fnToKey((a, b) => !(a === STAR && b === STAR), 9);
const seenTouch = new Set();
const noTouchPairs = [];
for (const cell of gridCells) {
  for (const nb of graph.kingNeighbours(cell)) {
    const key = [cell, nb].sort().join('_');
    if (seenTouch.has(key)) continue;
    seenTouch.add(key);
    noTouchPairs.push([cell, nb]);
  }
}
const noTouchSpecs = [
  { offset: [0, 1], template: ['R1C1', 'R1C2'], anchor: ([a]) => a },
  { offset: [1, -1], template: ['R1C2', 'R2C1'], anchor: ([a]) => graph.step(a, 0, -1) },
  { offset: [1, 0], template: ['R1C1', 'R2C1'], anchor: ([a]) => a },
  { offset: [1, 1], template: ['R1C1', 'R2C2'], anchor: ([a]) => a },
];
const noTouch = noTouchSpecs.map(({ offset: [dRow, dCol], template, anchor }) => {
  const pairs = noTouchPairs.filter(([a, b]) => {
    const from = parseCellId(a), to = parseCellId(b);
    return to.row - from.row === dRow && to.col - from.col === dCol;
  });
  const [origin, adjacent] = template;
  const constraint = new Pair(
    noTouchKey, 'Star Battle: no touch', starAt(origin), starAt(adjacent));
  return star.makeReplicate(constraint, pairs.map(pair => starAt(anchor(pair))));
});

// Scans [flag1, digit1, flag2, digit2, ...] along a line, summing a cell's
// digit only when it lies strictly between the line's two stars (exactly one
// star seen so far, and this cell is not itself a star). Sum is clamped at
// target+1 (a sink meaning "already too high") to bound the compiled state
// count; maxDepth bounds it against the longest line (9 cells = 18 scanned
// [flag, digit] steps). Accept requires both stars seen and the sum to match.
function sandwichMachine(target) {
  return NFA.encodeSpec({
    startState: { phase: 'flag', starsSeen: 0, sum: 0, between: false },
    transition: ({ phase, starsSeen, sum, between }, value) => {
      if (phase === 'flag') {
        const isStar = value === STAR;
        const nowBetween = starsSeen === 1 && !isStar;
        const newStarsSeen = Math.min(starsSeen + (isStar ? 1 : 0), 2);
        return { phase: 'digit', starsSeen: newStarsSeen, sum, between: nowBetween };
      }
      const added = between ? value : 0;
      return { phase: 'flag', starsSeen, sum: Math.min(sum + added, target + 1), between: false };
    },
    accept: ({ phase, starsSeen, sum }) => phase === 'flag' && starsSeen === 2 && sum === target,
    maxDepth: 18,
  }, geometry.numValues);
}

// Sandwich clues, read from the outside-clue badges: left-of-grid badges give
// each row's sum, top-of-grid badges give each column's sum.
const rowSums = [10, 8, 1, 37, 4, 19, 2, 41, 20];
const colSums = [15, 13, 32, 2, 6, 5, 38, 2, 35];

const rowClues = graph.rows().map((line, i) => {
  const cells = line.flatMap(c => [starAt(c), c]);
  return new NFA(sandwichMachine(rowSums[i]), `sandwich-row-${i + 1}`, ...cells);
});
const colClues = graph.columns().map((line, i) => {
  const cells = line.flatMap(c => [starAt(c), c]);
  return new NFA(sandwichMachine(colSums[i]), `sandwich-col-${i + 1}`, ...cells);
});

return [
  new Shape('9x9'),
  new AntiKnight(),
  star.toVar('star'),
  starDomain,
  ...starCount,
  ...noTouch,
  ...rowClues,
  ...colClues,
];
