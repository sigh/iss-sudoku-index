// Title: Maximal Anti-Killer
// Author: MadMahogany
// Video: https://www.youtube.com/watch?v=guBRvJk2RYY
// Source: https://cracking-the-cryptic.web.app/sudoku/JTRBpnJgp2

// Normal sudoku rules apply. The digits in each outlined cage sum to 10 with no
// repeat within the cage. The outlined set of cages is maximal: no other
// 10-cage can be created in the grid, although each outlined cage has at least
// one other potential 10-cage overlapping it.
//
// Two cages may not overlap, so a further cage could only be drawn on cells no
// outlined cage covers: the maximality clause forbids any orthogonally
// connected group of uncaged cells from holding all-different digits summing to
// 10. The concession is what scopes it that way -- potential 10-cages that
// overlap an outlined cage are not ruled out, and the "other" of the first
// clause carries into the second, so each outlined cage needs a potential
// 10-cage besides itself among the groups that meet it.
//
// Nothing is omitted.

const shape = new Shape('9x9');
const graph = cellGraph(shape);

// The eleven outlined cages, transcribed from the cage outlines; every one is
// labelled 10.
const cageCells = [
  ['R1C9', 'R2C9'],
  ['R3C8', 'R3C9', 'R4C8', 'R4C9'],
  ['R1C6', 'R2C6', 'R2C7'],
  ['R1C3', 'R1C4', 'R1C5'],
  ['R1C1', 'R2C1', 'R3C1', 'R4C1'],
  ['R6C6', 'R6C7', 'R7C6'],
  ['R3C4', 'R3C5'],
  ['R7C2', 'R8C2', 'R8C3', 'R9C2'],
  ['R9C4', 'R9C5', 'R9C6'],
  ['R7C5', 'R8C5'],
  ['R7C8', 'R8C7', 'R8C8', 'R9C7'],
];

// The nine printed digits.
const givens = [
  new Given('R1C8', 7),
  new Given('R4C5', 6),
  new Given('R5C2', 6),
  new Given('R5C6', 3),
  new Given('R5C8', 8),
  new Given('R5C9', 9),
  new Given('R6C4', 9),
  new Given('R8C2', 2),
  new Given('R8C9', 5),
];

const cages = cageCells.map(cells => new Cage(10, ...cells));

// Every orthogonally connected group of 2 to 4 cells drawn from `cells`, grown
// one neighbour at a time from the single cells and de-duplicated by sorted
// cell list. One cell cannot reach 10, and five or more all-different digits
// total at least 1+2+3+4+5 = 15, so no other size can be a 10-cage.
const connectedGroups = (cells) => {
  const allowed = new Set(cells);
  const groups = [];
  let frontier = cells.map(cell => [cell]);
  for (let size = 2; size <= 4; size++) {
    const seen = new Set();
    const grown = [];
    for (const group of frontier) {
      for (const cell of group) {
        for (const neighbour of graph.neighbours(cell)) {
          if (!allowed.has(neighbour) || group.includes(neighbour)) continue;
          const next = [...group, neighbour].sort();
          const key = next.join(',');
          if (seen.has(key)) continue;
          seen.add(key);
          grown.push(next);
        }
      }
    }
    groups.push(...grown);
    frontier = grown;
  }
  return groups;
};

const caged = new Set(cageCells.flat());
const uncaged = graph.cells().filter(cell => !caged.has(cell));

// "These cells are not a potential 10-cage": their digits repeat, or they do
// not total 10. The state is the distinct digits read so far, held only while
// they still total 10 or less; a repeated digit or a total past 10 puts the
// group beyond reach of being a 10-cage, so it moves to the sink OK, which
// every later digit keeps. accept() then refuses exactly the runs that ended
// all-different totalling 10. Digits are sorted into the state so that runs
// reading the same digits in a different order share one compiled state.
const OK = 'ok';
const digitSum = (digits) => digits.reduce((a, b) => a + b, 0);
const notTenCage = NFA.encodeSpec({
  startState: { seen: [] },
  transition: (state, value) => {
    if (state === OK || state.seen.includes(value)) return OK;
    const seen = [...state.seen, value].sort((a, b) => a - b);
    return digitSum(seen) > 10 ? OK : { seen };
  },
  accept: (state) => state === OK || digitSum(state.seen) !== 10,
}, shape);

const antiCages = connectedGroups(uncaged).map(cells => (
  cells.length === 2
    // Two orthogonally adjacent cells always share a row or a column, so sudoku
    // already forbids the repeat and only the total is left to rule out.
    ? new Pair(Pair.fnToKey((a, b) => a + b !== 10, shape), 'no10', ...cells)
    : new NFA(notTenCage, 'no10', ...cells)));

// The concession, one Or per outlined cage: some connected group that meets the
// cage, other than the cage itself, is a potential 10-cage. A cage's own cells
// are open to the disjunction as much as any others, since a potential cage
// here is only a group of cells whose digits could be cage digits, not a cage
// that could be drawn alongside the outlined ones.
const allGroups = connectedGroups(graph.cells());
const cageWitnesses = cageCells.map(cells => {
  const cage = new Set(cells);
  const ownKey = [...cells].sort().join(',');
  return new Or(allGroups
    .filter(group => group.join(',') !== ownKey && group.some(c => cage.has(c)))
    .map(group => new Cage(10, ...group)));
});

return [
  shape,
  ...givens,
  ...cages,
  ...antiCages,
  ...cageWitnesses,
];
