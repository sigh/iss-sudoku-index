// Title: Global Ocean
// Author: SamuPiano
// Video: https://www.youtube.com/watch?v=GVNCgFGMlFY
// Source: https://app.crackingthecryptic.com/sudoku/GQ4jnH2R6T

// Normal sudoku rules apply (rows, columns, boxes all different).
//
// 18 of the 81 cells are "island" cells -- exactly two per row, two per
// column and two per box -- and are not drawn; the solver discovers them.
// A parallel Var overlay (`flags`, domain 1 = ocean / 2 = island) tracks
// which is which; a group of 9 flags sums to 9 when all are ocean, +1 per
// island in that group, so `Sum(11, ...group)` over each row/column/box
// pins its island count at exactly two.
//
// Each cage's small clue is the sum of its ocean cells only; island cells
// (wherever they fall in the cage) contribute nothing. Because an island
// cell can duplicate another cell's digit without upsetting the total,
// "digits cannot repeat" is its own rule, stated for cages of nine or
// fewer (drawn) cells, over every cell of the cage -- ocean and island
// alike. The 30-cell/170 cage is exempt, as the rule anticipates (nine
// digits cannot fill 30 distinct cells).
//
// Each cage total is enforced by one NFA scanning `digit, flag, digit,
// flag, ...` down its cell list: `pending` holds the digit awaiting its
// flag, `sum` is the running ocean-only total, clamped at total+1 once it
// can only fail.
//
// One X is drawn, between R3C2 and R4C2: those two digits sum to 10. Not
// all Xs are marked, so no inference is drawn from an absent X elsewhere.

const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VF');
const flag = cell => flags.at(cell);

const cages = [
  { total: 9, cells: ['R3C1', 'R3C2', 'R3C3', 'R4C1'] },
  { total: 8, cells: ['R5C1', 'R5C2', 'R6C1', 'R6C2'] },
  { total: 9, cells: ['R5C3', 'R6C3', 'R7C2', 'R7C3'] },
  { total: 32, cells: ['R2C2', 'R2C3', 'R2C4', 'R3C4', 'R4C2', 'R4C3', 'R4C4'] },
  { total: 36, cells: ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R2C1', 'R2C5'] },
  { total: 30, cells: ['R1C6', 'R1C7', 'R1C8', 'R2C6', 'R3C5', 'R3C6'] },
  { total: 25, cells: ['R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C7', 'R4C7'] },
  { total: 21, cells: ['R3C8', 'R4C8', 'R5C7', 'R5C8', 'R6C6', 'R6C7'] },
  { total: 10, cells: ['R8C5', 'R9C5', 'R9C6'] },
  { total: 10, cells: ['R5C4', 'R6C4'] },
  { total: 16, cells: ['R9C2', 'R9C3'] },
  {
    total: 170,
    cells: [
      'R3C9', 'R4C5', 'R4C6', 'R4C9', 'R5C5', 'R5C6', 'R5C9', 'R6C5', 'R6C8',
      'R6C9', 'R7C1', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R7C9', 'R8C1',
      'R8C2', 'R8C3', 'R8C4', 'R8C6', 'R8C7', 'R8C8', 'R8C9', 'R9C1', 'R9C4',
      'R9C7', 'R9C8', 'R9C9',
    ],
  },
];

function cageTotalNFA(total) {
  return NFA.encodeSpec({
    startState: { pending: null, sum: 0 },
    transition: ({ pending, sum }, value) => {
      if (pending === null) return { pending: value, sum };
      const add = value === 1 ? pending : 0;   // 1 = ocean counts, 2 = island doesn't
      return { pending: null, sum: Math.min(sum + add, total + 1) };
    },
    accept: ({ pending, sum }) => pending === null && sum === total,
  }, 9);
}

const cageConstraints = cages.flatMap(({ total, cells }) => {
  const interleaved = cells.flatMap(cell => [cell, flag(cell)]);
  const result = [new NFA(cageTotalNFA(total), `cage-${total}`, ...interleaved)];
  if (cells.length <= 9) result.push(new AllDifferent(...cells));
  return result;
});

const islandCounts = [
  ...flags.rows(), ...flags.columns(), ...flags.boxes(),
].map(group => new Sum(11, ...group));

// Every flag cell shares the same 1-2 domain; stamp it once via Replicate
// instead of one Given per cell.
const flagDomain = flags.makeReplicate(new Given(flags.cells()[0], 1, 2));

return [
  new Shape('9x9'),
  flags.toVar('ocean(1) / island(2) flags'),
  flagDomain,
  ...islandCounts,
  ...cageConstraints,
  new X('R3C2', 'R4C2'),
];
