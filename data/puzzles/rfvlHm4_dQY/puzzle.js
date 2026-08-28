// Title: Snake-Sums Sudoku
// Author: Willy Wonka
// Video: https://www.youtube.com/watch?v=rfvlHm4_dQY
// Source: https://cracking-the-cryptic.web.app/sudoku/GhjdhB6MNM

// Rules encoded here:
//  - Normal sudoku rules apply.
//  - Each clue outside the grid is the sum of the digits of one snake. That
//    snake starts in the cell directly next to the clue and its length is the
//    digit in that cell.
//  - A snake is a one-cell-wide region of orthogonally connected cells with no
//    repeated digit; it may not touch itself orthogonally and may not branch in
//    two directions. Its cells therefore induce a simple path, with the clued
//    cell at one end.
//  - No cell may belong to more than one snake.
// Nothing is omitted.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// Clue transcription: the twelve numbers printed around the grid, each paired
// with the grid cell it sits against -- that cell is its snake's first cell.
const CLUES = [
  { head: 'R1C2', total: 12 },
  { head: 'R1C4', total: 10 },
  { head: 'R1C7', total: 9 },
  { head: 'R2C1', total: 12 },
  { head: 'R2C9', total: 22 },
  { head: 'R4C1', total: 15 },
  { head: 'R4C9', total: 3 },
  { head: 'R5C1', total: 15 },
  { head: 'R7C1', total: 30 },
  { head: 'R9C4', total: 10 },
  { head: 'R9C6', total: 20 },
  { head: 'R9C8', total: 11 },
];

// Every cell sequence that could be a snake of this length starting at `head`:
// each further cell is orthogonally adjacent to the previous one and to none of
// the earlier ones. Adjacency to the previous cell makes the region connected
// and one cell wide; non-adjacency to the earlier ones is "cannot touch itself
// orthogonally and cannot branch in 2 directions".
const snakePaths = (head, length) => {
  const results = [];
  const walk = (path) => {
    if (path.length === length) return void results.push(path);
    const earlier = path.slice(0, -1);
    for (const next of graph.neighbours(path[path.length - 1])) {
      if (path.includes(next)) continue;
      const touches = graph.neighbours(next);
      if (earlier.some(cell => touches.includes(cell))) continue;
      walk([...path, next]);
    }
  };
  walk([head]);
  return results;
};

// The head digit is the snake's length, so a length is only reachable when some
// `length` distinct digits, one of them `length` itself, add up to the clue.
// Lengths that fail this carry no digits and so contribute no branches; the
// per-branch Sum and AllDifferent below are what actually state the rule.
const lengthIsPossible = (length, total) => {
  const pick = (digit, remaining, sum) => {
    if (remaining === 0) return sum === total;
    if (digit > 9) return false;
    return (digit !== length && pick(digit + 1, remaining - 1, sum + digit))
      || pick(digit + 1, remaining, sum);
  };
  return pick(1, length - 1, length);
};

const VAR_PREFIXES = 'ABCDEFGHIJKL';

const clues = CLUES.map(({ head, total }, index) => {
  const paths = [];
  for (let length = 1; length <= geometry.numValues; length++) {
    if (lengthIsPossible(length, total)) paths.push(...snakePaths(head, length));
  }
  const cells = [...new Set(paths.flat())];
  // One membership flag per cell this snake could reach.
  const flags = new Var('S' + VAR_PREFIXES[index], `snake at ${head}`, cells.length);
  const flagOf = new Map(cells.map((cell, i) => [cell, flags.cell(i + 1)]));
  return { head, total, paths, cells, flags, flagOf };
});

const OUT = 1;
const IN = 2;

const flagDomains = clues.flatMap(
  clue => clue.cells.map(cell => new Given(clue.flagOf.get(cell), OUT, IN)));

// The snake holds exactly as many cells as the head digit: the flags sum to one
// per candidate cell plus one more for each cell that is IN.
const flagCounts = clues.map(clue => new Sum(
  clue.cells.length,
  ...clue.cells.map(cell => clue.flagOf.get(cell)),
  [clue.head, -1]));

// One branch per candidate snake. The branch fixes the head digit to the snake's
// length, sums the snake to the clue, keeps its digits distinct, and flags its
// cells IN; the flag count above then forces every other candidate cell OUT.
const snakeChoices = clues.map(clue => new Or(
  clue.paths.map(path => new And([
    new Given(clue.head, path.length),
    new Sum(clue.total, ...path),
    new AllDifferent(...path),
    ...path.map(cell => new Given(clue.flagOf.get(cell), IN)),
  ]))));

// No cell belongs to more than one snake: wherever two clues' snakes could both
// reach a cell, at most one of their flags there is IN.
const notBothIn = PairX.fnToKey((a, b) => !(a === IN && b === IN), geometry);
const oneSnakePerCell = graph.cells().flatMap(cell => {
  const flags = clues.filter(clue => clue.flagOf.has(cell))
    .map(clue => clue.flagOf.get(cell));
  return flags.length > 1
    ? [new PairX(notBothIn, 'one snake per cell', ...flags)] : [];
});

return [
  new Shape('9x9'),
  ...clues.map(clue => clue.flags),
  ...flagDomains,
  ...flagCounts,
  ...snakeChoices,
  ...oneSnakePerCell,
];
