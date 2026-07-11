// Title: Triangular Cages
// Author: JV
// Video: https://www.youtube.com/watch?v=i_LrY6Kc7pU
// Source: https://sudokupad.app/6mrbdq236r

// Normal sudoku rules apply.
//
// Triangular Cages: each cage must sum to a triangular number (1, 3, 6, 10,
// 15, 21, ...), and no two cages share the same triangular total. Digits may
// repeat within a cage, but every digit that appears must appear the same
// number of times as every other digit that appears in that cage (a 10-cage
// could be 2,3,2,3 but not 1,1,1,7). A cage may not be built as the plain
// ascending run 1+2+...+k when its size is exactly k and its target is the
// matching triangular number (a 10-cage of size 4 must not be 1,2,3,4); one
// cage is marked as an ordinary killer cage (all digits distinct) instead of
// allowing repeats.
//
// Thermometers: digits increase away from the bulb (the two short
// thermometers each bend once, from the bulb to one neighbour, then
// diagonally to a second cell).
//
// Encoding: each cage gets an extra Var holding the *index* k of its
// triangular target (T_k = k(k+1)/2), restricted to the indices that cage
// could actually reach (after removing the banned ascending-run value where
// relevant). AllDifferent over those index Vars forces the chosen triangular
// numbers to be mutually distinct. For each feasible index, an Or branch
// pins the cage to that exact target: `Cage(T_k, ...)` for the one
// all-different cage, or `ContainExact(...)` for a repeat-allowed cage,
// enumerating every way to split it into equally sized groups of repeated
// digits that sum to T_k (which simultaneously pins the sum and the
// equal-count structure).

const MAX_INDEX = 16; // largest triangular index any cage here can reach.
const constraints = [new Shape('9x9', MAX_INDEX)];
function add(c) { constraints.push(c); }

// Restrict the real grid back to ordinary Sudoku digits (the extra index
// Vars use the same extended range, up to MAX_INDEX).
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    add(new Given(makeCellId(r, c), 1, 2, 3, 4, 5, 6, 7, 8, 9));
  }
}

// Thermometers.
add(new Thermo('R3C3', 'R2C3', 'R3C2'));
add(new Thermo('R3C7', 'R2C7', 'R3C8'));
add(new Thermo('R8C3', 'R9C3', 'R8C4'));

// --- Triangular-cage machinery -----------------------------------------

const TRIANGULAR = [];
for (let k = 1; k <= MAX_INDEX; k++) TRIANGULAR.push(k * (k + 1) / 2);
const TRIANGULAR_SET = new Set(TRIANGULAR);
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function triangularIndex(sum) {
  return TRIANGULAR.indexOf(sum) + 1; // 1-based k with T_k === sum.
}

function combinations(pool, k) {
  if (k === 0) return [[]];
  if (pool.length < k) return [];
  const [first, ...rest] = pool;
  return [
    ...combinations(rest, k - 1).map(c => [first, ...c]),
    ...combinations(rest, k),
  ];
}

function isAscendingRun(combo) {
  return combo.every((v, i) => v === i + 1);
}

// Every (distinctDigitCount k, perDigitRepeatCount c) split of an n-cell
// repeat-allowed cage, for every choice of k digits, kept only when the
// resulting sum is triangular and it isn't the banned ascending run.
function repeatCageBranches(n) {
  const branches = [];
  for (let k = 1; k <= Math.min(9, n); k++) {
    if (n % k !== 0) continue;
    const c = n / k;
    for (const combo of combinations(DIGITS, k)) {
      const sum = c * combo.reduce((a, b) => a + b, 0);
      if (!TRIANGULAR_SET.has(sum)) continue;
      if (k === n && c === 1 && isAscendingRun(combo)) continue;
      const values = [];
      for (const v of combo) for (let i = 0; i < c; i++) values.push(v);
      branches.push({ idx: triangularIndex(sum), values });
    }
  }
  return branches;
}

// Triangular sums reachable by n *distinct* digits (for the one killer-style
// cage), excluding the banned ascending run.
function uniqueCageIndices(n) {
  const idxs = new Set();
  for (const combo of combinations(DIGITS, n)) {
    const sum = combo.reduce((a, b) => a + b, 0);
    if (!TRIANGULAR_SET.has(sum)) continue;
    if (isAscendingRun(combo)) continue;
    idxs.add(triangularIndex(sum));
  }
  return [...idxs].sort((a, b) => a - b);
}

const CAGE_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
let indexVarCounter = 0;
function indexVar(label) {
  const name = 'K' + CAGE_LETTERS[indexVarCounter++];
  add(new Var(name, label, 1));
  return 'V' + name;
}

const cages = [
  {
    cells: ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R3C1'],
    unique: true,
  },
  {
    cells: [
      'R1C4', 'R1C5', 'R1C6', 'R2C2', 'R2C3', 'R2C4', 'R3C2', 'R3C3',
      'R3C4', 'R4C1', 'R4C2', 'R4C3', 'R4C4', 'R5C2', 'R5C3',
    ],
  },
  { cells: ['R4C5', 'R5C5'] },
  {
    cells: [
      'R2C6', 'R2C7', 'R2C8', 'R3C5', 'R3C6', 'R3C8', 'R4C7', 'R4C8', 'R5C7',
    ],
  },
  { cells: ['R1C9', 'R2C9'] },
  { cells: ['R6C7', 'R6C8', 'R6C9', 'R7C7', 'R7C8', 'R8C7'] },
  {
    cells: [
      'R7C3', 'R7C9', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C8',
      'R8C9', 'R9C1', 'R9C2', 'R9C3', 'R9C6', 'R9C7', 'R9C8', 'R9C9',
    ],
  },
  { cells: ['R6C2', 'R6C3', 'R6C4'] },
  { cells: ['R7C5', 'R7C6'] },
];

const indexCells = [];
for (const cage of cages) {
  const n = cage.cells.length;
  const idxCell = indexVar(`triangular index (${n}-cell cage)`);
  indexCells.push(idxCell);

  if (cage.unique) {
    add(new AllDifferent(...cage.cells));
    const idxs = uniqueCageIndices(n);
    add(new Given(idxCell, ...idxs));
    add(new Or(idxs.map(idx => new And([
      new Given(idxCell, idx),
      new Cage(TRIANGULAR[idx - 1], ...cage.cells),
    ]))));
  } else {
    const branches = repeatCageBranches(n);
    const idxs = [...new Set(branches.map(b => b.idx))].sort((a, b) => a - b);
    add(new Given(idxCell, ...idxs));
    add(new Or(branches.map(b => new And([
      new Given(idxCell, b.idx),
      new ContainExact(b.values.join('_'), ...cage.cells),
    ]))));
  }
}

// Every cage's triangular total must be unique across the puzzle.
add(new AllDifferent(...indexCells));

return constraints;
