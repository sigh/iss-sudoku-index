// Title: River Sudoku
// Author: Xailran
// Video: https://www.youtube.com/watch?v=6aWnf5X8wec
// Source: https://app.crackingthecryptic.com/sudoku/t9h6rqDj64

// Rules encoded below, in full:
//   Normal sudoku rules apply.
//   Each of the thirteen single-cell cages anchors one river: a path of
//   orthogonally connected cells whose first cell is orthogonally adjacent to
//   the cage cell.
//   The digit in the cage cell is the number of cells in that river.
//   The number printed in the cage's top-left corner is the sum of the river's
//   digits. It is not a killer total for the caged cell: six of the printed
//   numbers exceed 9, so no single-cell killer reading exists.
//   The river digits strictly decrease from the cell next to the cage onwards.
//   No river uses a cage cell.
//   A river may run orthogonally alongside itself and two rivers may share
//   cells; both are permissions, so nothing is added for them.

const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);

// Value 0 exists only so the river overlays below can mark "not on this river";
// the playable grid keeps the ordinary 1-9 digits.
const gridDigits = graph.makeReplicate(
  new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9));

const givens = [
  new Given('R1C8', 4),
  new Given('R6C9', 2),
  new Given('R7C8', 7),
  new Given('R8C8', 1),
];

// Drawn cages: every cage is a single cell, with its number printed in the
// top-left corner.
const CAGES = [
  ['R1C1', 14], ['R2C1', 3], ['R1C5', 7], ['R2C4', 7], ['R5C7', 11],
  ['R6C7', 9], ['R7C1', 10], ['R8C3', 5], ['R9C3', 3], ['R7C5', 15],
  ['R8C6', 11], ['R9C7', 4], ['R9C9', 30],
];
const cageCells = new Set(CAGES.map(([cell]) => cell));

// A river of L cells carries L distinct digits, because they strictly decrease.
// So its printed total T must satisfy 1+..+L <= T <= 9+..+(10-L).
const lengthsFor = (total) => {
  const lengths = [];
  for (let len = 1; len <= 9; len++) {
    if (len * (len + 1) / 2 <= total && total <= len * (19 - len) / 2) {
      lengths.push(len);
    }
  }
  return lengths;
};

// Each river is carried by three overlay cells per candidate cell:
//   VA - the cell's contribution to its river's total: its digit when the cell
//        is on the river, 0 when it is not.
//   VM - 1 on the river, 0 off it, so the river's length is a plain Sum.
//   VB - a pointer naming the direction of the cell's predecessor along the
//        river, or HEAD for the river's first cell, or OFF.
// The pointers make the path model sound for a route that may touch itself:
// degree counted over neighbours cannot tell a self-touch from a branch, but a
// predecessor pointer can. Each river cell other than the head points at a
// neighbour with a strictly larger VA, so pointer chains strictly increase and
// cannot cycle; with exactly one HEAD every river cell therefore hangs off that
// one head, and "at most one cell points back at me" turns that tree into a
// single path.
const OFF = 0;
const HEAD = 1;
const DIRS = [
  { code: 2, dr: -1, dc: 0, back: 3 },  // predecessor is the cell above
  { code: 3, dr: 1, dc: 0, back: 2 },   // predecessor is the cell below
  { code: 4, dr: 0, dc: -1, back: 5 },  // predecessor is the cell to the left
  { code: 5, dr: 0, dc: 1, back: 4 },   // predecessor is the cell to the right
];

// Cells a river can reach: breadth-first from the cells next to the cage,
// through cage-free cells only, out to maxLen - 1 steps. A cell d steps out
// cannot sit earlier than path position d + 1.
const reachableFrom = (cageCell, maxLen) => {
  const starts = graph.neighbours(cageCell).filter(c => !cageCells.has(c));
  const distance = new Map(starts.map(cell => [cell, 0]));
  let frontier = starts;
  for (let step = 1; step <= maxLen - 1; step++) {
    const next = [];
    for (const cell of frontier) {
      for (const nb of graph.neighbours(cell)) {
        if (cageCells.has(nb) || distance.has(nb)) continue;
        distance.set(nb, step);
        next.push(nb);
      }
    }
    frontier = next;
  }
  return distance;
};

let overlaySize = 0;
const rivers = CAGES.map(([cageCell, total]) => {
  const lengths = lengthsFor(total);
  const distance = reachableFrom(cageCell, lengths[lengths.length - 1]);
  const index = new Map(
    [...distance.keys()].map((cell, i) => [cell, overlaySize + i + 1]));
  overlaySize += distance.size;
  return { cageCell, total, lengths, distance, index };
});

const vaVar = new Var('A', 'river-digit', overlaySize);
const vmVar = new Var('M', 'river-member', overlaySize);
const vbVar = new Var('B', 'river-pointer', overlaySize);
const va = (river, cell) => vaVar.cell(river.index.get(cell));
const vm = (river, cell) => vmVar.cell(river.index.get(cell));
const vb = (river, cell) => vbVar.cell(river.index.get(cell));

const keyCache = new Map();
const cachedKey = (name, build) => {
  if (!keyCache.has(name)) keyCache.set(name, build());
  return keyCache.get(name);
};

// VA is either 0 (this cell is off the river) or a copy of the cell's own
// digit. `cap` is the largest digit this cell could contribute: a cell that is
// `d` cage-free steps away from the cells next to its cage cannot sit earlier
// than path position d + 1, and the digits strictly decrease from at most 9, so
// it is at most 9 - d; nor can any one digit exceed the whole river's total.
const contributionKey = (cap) => cachedKey('contribution:' + cap, () =>
  Pair.fnToKey((a, digit) => a === 0 || (a === digit && digit <= cap), shape));
// VM is the 0/1 membership flag VA implies, and gets its domain from this key.
const KEY_MEMBERSHIP = Pair.fnToKey((m, a) => m === (a > 0 ? 1 : 0), shape);
// A cell carries a pointer exactly when it is on the river.
const KEY_POINTED = Pair.fnToKey((b, m) => (b === OFF) === (m === 0), shape);

const specCache = new Map();
const cachedSpec = (key, build) => {
  if (!specCache.has(key)) specCache.set(key, build());
  return specCache.get(key);
};

// Scans [VB(cell), VA(cell), VA(neighbour) ...] in the order of `codes`.
// `need` remembers which neighbour the cell's pointer named and `prev` its own
// river digit, so the named neighbour can be required to hold a strictly larger
// river digit. That single test also forces the neighbour onto the river: only
// river cells have a VA above 0.
const predecessorSpec = (codes) => cachedSpec('pred:' + codes.join(','), () =>
  NFA.encodeSpec({
    startState: { pos: 0, need: OFF, prev: 0 },
    transition: ({ pos, need, prev }, value) => {
      if (pos === 0) {
        return { pos: 1, need: value > HEAD ? value : OFF, prev: 0 };
      }
      if (pos === 1) {
        return { pos: 2, need, prev: need === OFF ? 0 : value };
      }
      if (need !== codes[pos - 2]) return { pos: pos + 1, need, prev };
      return value > prev ? { pos: pos + 1, need: OFF, prev: 0 } : undefined;
    },
    accept: ({ pos, need }) => pos === codes.length + 2 && need === OFF,
    maxDepth: codes.length + 2,
  }, shape));

// Scans the VB cells of a cell's neighbours. `backCodes[i]` is the pointer
// value neighbour i would hold if it pointed back at this cell, so the count is
// this cell's successors along the river, which a path caps at one.
const successorSpec = (backCodes) => cachedSpec('succ:' + backCodes.join(','), () =>
  NFA.encodeSpec({
    startState: { pos: 0, count: 0 },
    transition: ({ pos, count }, value) => {
      const total = count + (value === backCodes[pos] ? 1 : 0);
      return total > 1 ? undefined : { pos: pos + 1, count: total };
    },
    accept: ({ pos }) => pos === backCodes.length,
    maxDepth: backCodes.length,
  }, shape));

// The same "at most one successor" test over exactly two neighbours.
const successorKey = (backCodes) => cachedKey('successor:' + backCodes.join(','), () =>
  Pair.fnToKey(
    (first, second) => first !== backCodes[0] || second !== backCodes[1], shape));

const riverConstraints = rivers.flatMap((river) => {
  const cells = [...river.index.keys()];
  const neighbourhood = new Map(cells.map(cell => [
    cell,
    DIRS.map(dir => ({ dir, nb: graph.step(cell, dir.dr, dir.dc) }))
      .filter(({ nb }) => nb !== null && river.index.has(nb)),
  ]));
  const nextTo = new Set(graph.neighbours(river.cageCell));

  return [
    // The caged digit is the river's length, so it is one of the lengths the
    // printed total admits.
    new Given(river.cageCell, ...river.lengths),
    // The printed number is the sum of the digits along the river.
    new Sum(river.total, ...cells.map(cell => va(river, cell))),
    // The digit in the cage cell is the number of cells in the river.
    new EqualSum(cells.map(cell => vm(river, cell)), [river.cageCell]),
    // Exactly one river cell is the one next to the cage.
    new ContainExact(String(HEAD), ...cells.map(cell => vb(river, cell))),
    ...cells.flatMap((cell) => {
      const around = neighbourhood.get(cell);
      const cap = Math.min(9 - river.distance.get(cell), river.total);
      const pointers = [OFF, ...(nextTo.has(cell) ? [HEAD] : []),
                        ...around.map(({ dir }) => dir.code)];
      const backCodes = around.map(({ dir }) => dir.back);
      const pointerCells = around.map(({ nb }) => vb(river, nb));
      return [
        new Given(vb(river, cell), ...pointers),
        new Pair(contributionKey(cap), 'river-digit', va(river, cell), cell),
        new Pair(KEY_MEMBERSHIP, 'river-member', vm(river, cell), va(river, cell)),
        new Pair(KEY_POINTED, 'river-pointer', vb(river, cell), vm(river, cell)),
        // With no neighbour to point at, the pointer domain above is already the
        // whole rule, so the machine would be vacuous.
        ...(around.length ? [new NFA(
          predecessorSpec(around.map(({ dir }) => dir.code)),
          'river-decreases',
          vb(river, cell), va(river, cell),
          ...around.map(({ nb }) => va(river, nb)))] : []),
        // Fewer than two neighbours cannot hold two successors.
        ...(around.length === 2 ? [new Pair(
          successorKey(backCodes), 'river-is-a-path', ...pointerCells)] : []),
        ...(around.length > 2 ? [new NFA(
          successorSpec(backCodes), 'river-is-a-path', ...pointerCells)] : []),
      ];
    }),
  ];
});

return [
  shape,
  gridDigits,
  ...givens,
  vaVar,
  vmVar,
  vbVar,
  ...riverConstraints,
];
