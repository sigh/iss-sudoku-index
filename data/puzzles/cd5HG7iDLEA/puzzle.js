// Title: BYOK - Build Your Own Killer
// Author: Qinlux
// Video: https://www.youtube.com/watch?v=cd5HG7iDLEA
// Source: https://app.crackingthecryptic.com/sudoku/FFQPhjnBrM

// Rules (from the video description): normal sudoku rules apply. There are
// 13 cages with no printed total. Within each cage digits do not repeat, and
// somewhere in the cage two orthogonally adjacent cells, read either left to
// right or top to bottom, spell the cage's own sum as a two-digit number
// (e.g. a 1 then a 4 read left-to-right means the cage sums to 14). Which
// pair of cells (and which of the two reading directions) carries the total
// is for the solver to find, so it is encoded as a disjunction over every
// adjacent in-cage pair in both directions -- not chosen up front.
// Additionally, two cages that share a border edge may not have totals that
// add up to 63.
//
// Cage cell membership below is transcribed from the puzzle's drawn cage
// outlines (13 cages; a 14th metadata entry carries no cells and is not a
// real cage).

const cageCellLists = [
  ['R2C1', 'R1C1', 'R1C2', 'R1C3', 'R1C4'],
  ['R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6'],
  ['R1C5', 'R1C6', 'R1C7', 'R2C7', 'R3C7'],
  ['R3C3', 'R4C3', 'R4C2', 'R5C3', 'R5C4', 'R6C4', 'R7C4'],
  ['R6C2', 'R7C2', 'R7C3'],
  ['R9C2', 'R9C3', 'R8C4', 'R9C4', 'R9C5'],
  ['R3C4', 'R4C5', 'R3C5', 'R4C4'],
  ['R4C6', 'R4C7', 'R4C8', 'R5C8', 'R3C8', 'R2C8', 'R1C8', 'R1C9', 'R2C9'],
  ['R4C9', 'R5C9', 'R6C9'],
  ['R6C6', 'R7C6', 'R8C6', 'R9C6'],
  ['R5C5', 'R5C6', 'R5C7', 'R6C7', 'R6C8'],
  ['R7C8', 'R8C8', 'R9C8', 'R9C9', 'R7C9', 'R8C9'],
  ['R7C7', 'R8C7', 'R9C7'],
];

// Every cage's own AllDifferent (a no-total killer cage is exactly this).
const cageAllDifferents = cageCellLists.map(
  (cells) => new AllDifferent(...cells)
);

// Achievable arithmetic-sum range for a cage of n cells under all-different
// 1-9 digits: n distinct digits' minimum is 1+2+...+n, maximum is the top n
// digits (9+8+...+(10-n)).
function sumRange(n) {
  let min = 0;
  let max = 0;
  for (let k = 0; k < n; k++) {
    min += k + 1;
    max += 9 - k;
  }
  return [min, max];
}

// Candidate self-clue pairs within a cage: every ordered pair of cells that
// are both cage members and orthogonally adjacent, oriented as the rule
// reads them (left cell before right cell; top cell before bottom cell).
// Computed from the cage's own cell list, not hand-picked.
function selfCluePairs(cells) {
  const set = new Set(cells);
  const pairs = [];
  for (const cell of cells) {
    const { row, col } = parseCellId(cell);
    const right = makeCellId(row, col + 1);
    if (set.has(right)) pairs.push([cell, right]);
    const down = makeCellId(row + 1, col);
    if (set.has(down)) pairs.push([cell, down]);
  }
  return pairs;
}

// For each cage: the cage's arithmetic total equals the two-digit number
// spelled by at least one in-cage adjacent pair. 10*tens + ones == sum(cage)
// is `Sum(0, ...cells, [tens, -10], [ones, -1])` (tens/ones are cage members
// too, so their own +1 contribution combines with the -10/-1 offsets).
const selfClueConstraints = cageCellLists.map((cells) => {
  const pairs = selfCluePairs(cells);
  return new Or(
    pairs.map(([tens, ones]) => new Sum(0, ...cells, [tens, -10], [ones, -1]))
  );
});

// Cages that share a border edge: any cell of one orthogonally adjacent to
// any cell of the other. Computed from the same cage cell lists.
function adjacentCagePairs(cageLists) {
  const cellSets = cageLists.map((cells) => new Set(cells));
  const result = [];
  for (let i = 0; i < cageLists.length; i++) {
    for (let j = i + 1; j < cageLists.length; j++) {
      let touch = false;
      for (const cell of cageLists[i]) {
        const { row, col } = parseCellId(cell);
        const neighbours = [
          makeCellId(row - 1, col),
          makeCellId(row + 1, col),
          makeCellId(row, col - 1),
          makeCellId(row, col + 1),
        ];
        if (neighbours.some((n) => cellSets[j].has(n))) {
          touch = true;
          break;
        }
      }
      if (touch) result.push([i, j]);
    }
  }
  return result;
}

// "Consecutive cages (share an edge) cannot sum to 63": for every such pair,
// the combined arithmetic total of both cages is not 63. Encoded as an
// equality Or over every other achievable combined value (Sum has no native
// inequality), ranged from each cage's own min/max distinct-digit sum.
const noSharedSixtyThree = adjacentCagePairs(cageCellLists).map(([i, j]) => {
  const cellsI = cageCellLists[i];
  const cellsJ = cageCellLists[j];
  const [minI, maxI] = sumRange(cellsI.length);
  const [minJ, maxJ] = sumRange(cellsJ.length);
  const lo = minI + minJ;
  const hi = maxI + maxJ;
  const arms = [];
  for (let v = lo; v <= hi; v++) {
    if (v === 63) continue;
    arms.push(new Sum(v, ...cellsI, ...cellsJ));
  }
  return new Or(arms);
});

return [
  new Shape('9x9'),
  ...cageAllDifferents,
  ...selfClueConstraints,
  ...noSharedSixtyThree,
];
