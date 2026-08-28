// Title: Tilting
// Author: SSG
// Video: https://www.youtube.com/watch?v=ibBeK-9FgJ8
// Source: https://tinyurl.com/2cdw5pcp
//
// Normal sudoku rules apply.
//
// Quadruple circles: the two printed values (6 and 8) must each appear at
// least once among the circle's surrounding four cells (`Quad`).
//
// Giant Killer cages: digits inside a cage may not repeat (`AllDifferent`).
// The cage's cells are grouped into pairs of orthogonally-adjacent cells,
// each cell used in exactly one pair; a horizontally-adjacent pair reads
// left-to-right and a vertically-adjacent pair reads top-to-bottom as a
// two-digit number, and the cage's printed total is the sum of those
// two-digit numbers. Which cells pair together is not drawn -- only the
// cage's cell set and total are -- so `giantKillerCage` below disjoins the
// sum equation over every perfect matching of the cage's internal
// orthogonal-adjacency graph (every way to tile the cage with dominoes).

function cagePairs(cells) {
  // Every orthogonally-adjacent cell pair inside the cage, tens cell first:
  // the left cell of a horizontal pair, the top cell of a vertical pair.
  const cellSet = new Set(cells);
  const pairs = [];
  for (const c of cells) {
    const { row, col } = parseCellId(c);
    const right = makeCellId(row, col + 1);
    const down = makeCellId(row + 1, col);
    if (cellSet.has(right)) pairs.push([c, right]);
    if (cellSet.has(down)) pairs.push([c, down]);
  }
  return pairs;
}

function perfectMatchings(cells, pairs) {
  // All ways to partition `cells` into disjoint pairs drawn from `pairs`.
  const order = [...cells];
  const remaining = new Set(cells);
  const found = [];
  function backtrack(chosen) {
    if (remaining.size === 0) {
      found.push(chosen.slice());
      return;
    }
    const next = order.find(c => remaining.has(c));
    for (const [a, b] of pairs) {
      if (a !== next && b !== next) continue;
      if (!remaining.has(a) || !remaining.has(b)) continue;
      remaining.delete(a);
      remaining.delete(b);
      chosen.push([a, b]);
      backtrack(chosen);
      chosen.pop();
      remaining.add(a);
      remaining.add(b);
    }
  }
  backtrack([]);
  return found;
}

function giantKillerCage(total, cells) {
  const matchings = perfectMatchings(cells, cagePairs(cells));
  const options = matchings.map(matching => new Sum(
    total,
    ...cells,
    // Each pair contributes 10*tens + 1*ones; the `cells` above already
    // contribute 1*tens + 1*ones, so add the remaining +9*tens per pair.
    ...matching.map(([tens]) => [tens, 9]),
  ));
  return new And([
    new AllDifferent(...cells),
    options.length === 1 ? options[0] : new Or(options),
  ]);
}

// Cage cell sets and printed totals, from the killer cages / cage labels.
const giantKillerCages = [
  [248, ['R2C2', 'R2C3', 'R2C4', 'R3C2', 'R3C3', 'R3C4']],
  [248, ['R2C7', 'R2C8', 'R3C7', 'R3C8', 'R4C7', 'R4C8']],
  [248, ['R7C6', 'R7C7', 'R7C8', 'R8C6', 'R8C7', 'R8C8']],
  [248, ['R6C2', 'R6C3', 'R7C2', 'R7C3', 'R8C2', 'R8C3']],
  [120, ['R1C6', 'R1C7', 'R2C5', 'R2C6']],
  [120, ['R5C8', 'R6C8', 'R6C9', 'R7C9']],
  [120, ['R3C1', 'R4C1', 'R4C2', 'R5C2']],
  [120, ['R8C4', 'R8C5', 'R9C3', 'R9C4']],
];

// Quadruple circles: top-left cell of each 2x2 square, from the quadruple
// clue geometry; every circle prints the same two values, 6 and 8.
const quadruples = [
  'R1C3',
  'R3C8',
  'R8C6',
  'R6C1',
];

return [
  new Shape('9x9'),
  new Given('R5C5', 9),
  ...giantKillerCages.map(([total, cells]) => giantKillerCage(total, cells)),
  ...quadruples.map(topLeft => new Quad(topLeft, 6, 8)),
];
