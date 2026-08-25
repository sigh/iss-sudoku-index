// Title: Sequential Killer Sudoku
// Author: SenatorGronk
// Video: https://www.youtube.com/watch?v=fN2WjrDbpMI
// Source: https://app.crackingthecryptic.com/webapp/mf8tfG3jjP
//
// Normal sudoku. The grid is partitioned into 18 killer cages (no printed
// totals) -- AllDifferent per cage below. Anti-knight and one 2-cell
// thermometer (bulb R6C6 -> R6C5) are stated rules too.
//
// The cage-sum rule ("each cage has a different sum; let X/Y be the
// smallest/largest cage sum; the X-cage is adjacent to the Y-cage; every
// integer between X and Y is some cage's sum; two cages with consecutive
// sums must be adjacent") is encoded as a per-pair constraint on the raw
// difference of two cages' sums, without ever materializing a cage total as
// a cell (sums range 3-42, far past the 16-value cell/Var domain cap):
//
//   Given AllDifferent-sums plus every pairwise |sum difference| <= 17, the
//   18 (distinct) sums are pigeonholed into exactly a run of 18 consecutive
//   integers, which forces the "every integer between X and Y occurs" clause
//   for free. The X/Y-adjacency and consecutive-adjacency clauses then reduce
//   to: for any cage pair that is NOT orthogonally adjacent, forbid a sum
//   difference of 0, +-1 or +-17. (Exactly one pair has |diff| = 17 -- the
//   true X/Y pair -- and exactly one pair per consecutive rank has |diff| =
//   1, so forbidding those values on every non-adjacent pair is equivalent to
//   requiring them on some adjacent pair.) This is a reformulation, not a
//   relaxation of the four rule clauses above.
//
// Each pairwise check is a 2-segment NFA: segment 1 (cage i's cells) adds to
// an accumulator, segment 2 (cage j's cells) subtracts from it; the final
// accumulator is sum(i) - sum(j), tested against the allowed-difference set
// for that pair's adjacency.

// Cage cells, row-major reading order off the drawn cage outlines
// (the puzzle's own cage array, cell coordinates converted to R#C#).
const CAGES = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R2C1', 'R3C1'],           // 0
  ['R1C6', 'R2C6', 'R3C6', 'R4C6', 'R5C6'],                           // 1
  ['R1C7', 'R2C7', 'R3C7'],                                           // 2
  ['R1C8', 'R1C9', 'R2C8', 'R2C9'],                                   // 3
  ['R3C8', 'R3C9'],                                                   // 4
  ['R4C8', 'R4C9', 'R5C9', 'R6C9'],                                   // 5
  ['R5C8', 'R6C8', 'R7C8'],                                           // 6
  ['R4C7', 'R5C7', 'R6C4', 'R6C5', 'R6C6', 'R6C7'],                   // 7
  ['R3C2', 'R3C3', 'R3C4', 'R3C5', 'R4C4', 'R4C5', 'R5C5'],           // 8
  ['R2C2', 'R2C3', 'R2C4', 'R2C5'],                                   // 9
  ['R4C1', 'R4C2', 'R4C3', 'R5C1', 'R5C2', 'R6C1'],                   // 10
  ['R5C3', 'R5C4', 'R6C2', 'R6C3'],                                   // 11
  ['R7C1', 'R8C1', 'R8C3', 'R9C1', 'R9C2', 'R9C3'],                   // 12
  ['R7C2', 'R7C3', 'R8C2'],                                           // 13
  ['R7C4', 'R8C4', 'R8C5'],                                           // 14
  ['R7C5', 'R7C6', 'R8C6', 'R9C4', 'R9C5', 'R9C6'],                   // 15
  ['R7C7', 'R7C9', 'R8C7', 'R8C8', 'R8C9'],                           // 16
  ['R9C7', 'R9C8', 'R9C9'],                                           // 17
];

// Orthogonal cage-to-cage adjacency, derived from the cage cell lists above
// (shared grid edge between a cell of one cage and a cell of the other).
function cagesAdjacent(cellsA, cellsB) {
  const key = ({ row, col }) => row * 100 + col;
  const setA = new Set(cellsA.map(c => key(parseCellId(c))));
  for (const cell of cellsB) {
    const { row, col } = parseCellId(cell);
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      if (setA.has(key({ row: row + dr, col: col + dc }))) return true;
    }
  }
  return false;
}

// diff = sum(cageI) - sum(cageJ). Forbidding 0 gives distinct sums; +-17 and
// +-1 are only forbidden for a non-adjacent pair (see header derivation).
function diffAllowed(diff, adjacent) {
  if (diff === 0) return false;
  if (diff < -17 || diff > 17) return false;
  if (!adjacent) {
    if (diff === 1 || diff === -1) return false;
    if (diff === 17 || diff === -17) return false;
  }
  return true;
}

// This one spec is reused for every pair (only cell arguments differ), so
// maxDepth must cover the longest possible pair: two 7-cell cages plus the
// one SEGMENT_BREAK between them = 15 symbols.
const MAX_PAIR_DEPTH = 7 + 7 + 1;

function cageDiffMachine(adjacent) {
  return NFA.encodeSpec({
    startState: { phase: 1, acc: 0 },
    transition: ({ phase, acc }, value) => {
      if (value === SEGMENT_BREAK) return { phase: 2, acc };
      return phase === 1
        ? { phase: 1, acc: acc + value }
        : { phase: 2, acc: acc - value };
    },
    accept: ({ phase, acc }) => phase === 2 && diffAllowed(acc, adjacent),
    maxDepth: MAX_PAIR_DEPTH,
  }, 9, { multiSegment: true });
}

const adjacentMachine = cageDiffMachine(true);
const nonAdjacentMachine = cageDiffMachine(false);

const cageSumConstraints = [];
for (let i = 0; i < CAGES.length; i++) {
  for (let j = i + 1; j < CAGES.length; j++) {
    const adjacent = cagesAdjacent(CAGES[i], CAGES[j]);
    const machine = adjacent ? adjacentMachine : nonAdjacentMachine;
    // Shared name across all 153 pairs: it's one check (two spec variants)
    // applied to every cage pair, not 153 distinct rule types.
    cageSumConstraints.push(new NFA(machine, 'cageDiff', CAGES[i], CAGES[j]));
  }
}

return [
  new Shape('9x9'),

  ...CAGES.map(cells => new AllDifferent(...cells)),
  ...cageSumConstraints,

  new AntiKnight(),

  new Thermo('R6C6', 'R6C5'),
];
