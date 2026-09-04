// Title: Inset
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=0DAobcSV_78
// Source: https://sudokupad.app/nlmbdwt4wn

// Five Latin squares (N = 6, 5, 4, 3, 2) cascade down the main diagonal of a
// 12x12 canvas; each square's top-left corner lands inside the previous
// square's footprint, so each adjacent pair shares a corner block (3x3, 2x2,
// 2x2, 1x1 respectively). Rule 1: each N-by-N Latin Square holds 1..N once
// per row and column. Rule 2: each circle sums to an odd number. Rule 3:
// each square sums to an even number. The rest of the 12x12 canvas carries
// no clue at all -- only the union of the five squares (72 of the 144
// cells) is modelled; the remaining cells are not part of the puzzle.
//
// The 6x6 is the main grid (Shape + NoBoxes -- the rules never mention
// boxes). Every smaller square's cells that are not already covered by a
// larger square become a Var group (B=5x5, C=4x4, D=3x3, E=2x2); a shared
// corner cell keeps the id the larger square gave it, so a smaller square's
// row/column groups reference the same cell either way. `cid(r, c)`
// resolves either kind of id uniformly (0-indexed [row, col], matching the
// payload's own convention).

// Square footprints: provenance is the payload's hidden row/column Cage
// sets (all-different, sum = 1+...+N, which is only satisfiable by exactly
// {1..N}) plus the drawn ring outline round the 6x6.
const GRIDS = [
  { N: 6, r0: 0, c0: 0 },   // R1-6,   C1-6   -- cages #33-44, sum 21; ring outline
  { N: 5, r0: 3, c0: 3 },   // R4-8,   C4-8   -- cages #18-27, sum 15 (duplicated at #28-32)
  { N: 4, r0: 6, c0: 6 },   // R7-10,  C7-10  -- cages #10-17, sum 10
  { N: 3, r0: 8, c0: 8 },   // R9-11,  C9-11  -- cages #4-9,   sum 6
  { N: 2, r0: 10, c0: 10 }, // R11-12, C11-12 -- cages #0-3,   sum 3
];

function rect(r0, r1, c0, c1) {
  const out = [];
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) out.push([r, c]);
  return out;
}

const key = (r, c) => `${r},${c}`;
// The owning grid of a cell is the first (largest) grid in GRIDS whose
// footprint covers it, so an overlap keeps a single id.
const ownerIndex = (r, c) =>
  GRIDS.findIndex(g => r >= g.r0 && r < g.r0 + g.N && c >= g.c0 && c < g.c0 + g.N);
// The smallest N among every grid covering a cell: the true digit ceiling
// for a shared corner, since the smallest covering square's own row/column
// rule forces its cells into {1..N}.
const minN = (r, c) => Math.min(...GRIDS
  .filter(g => r >= g.r0 && r < g.r0 + g.N && c >= g.c0 && c < g.c0 + g.N)
  .map(g => g.N));

const LETTER = ['A', 'B', 'C', 'D', 'E'];
const LABEL = ['6x6', '5x5', '4x4', '3x3', '2x2'];
const idOf = new Map();
const varCounts = [0, 0, 0, 0, 0];
for (const g of GRIDS) {
  for (let i = 0; i < g.N; i++) {
    for (let j = 0; j < g.N; j++) {
      const r = g.r0 + i, c = g.c0 + j;
      const k = key(r, c);
      if (idOf.has(k)) continue;
      const oi = ownerIndex(r, c);
      idOf.set(k, oi === 0
        ? makeCellId(r + 1, c + 1)
        : [oi, ++varCounts[oi]]);  // resolved to a Var cell below
    }
  }
}
// vars[0] is the main 6x6 grid, which needs no Var group of its own.
const vars = GRIDS.map((_, i) => i === 0 ? null : new Var(LETTER[i], LABEL[i], varCounts[i]));
for (const [k, id] of idOf) {
  if (Array.isArray(id)) idOf.set(k, vars[id[0]].cell(id[1]));
}
const cid = (r, c) => idOf.get(key(r, c));

// Odd/even sum clues -- cell lists are 0-indexed [row, col], provenance
// named in R#C# (1-indexed).
// Circles (odd sum): overlays #2-4 (single cells), #0 (9-cell span), #1
// (4-cell corner span); plus two 4-cell corner-span circles drawn as
// underlays (rounded, 1.8x1.8) rather than overlays.
const ODD_SINGLES = [[2, 3], [0, 3], [0, 5]];               // R3C4, R1C4, R1C6
const ODD_SHAPES = [
  rect(3, 5, 0, 2),   // R4-6,   C1-3 -- overlay #0
  rect(3, 4, 6, 7),   // R4-5,   C7-8 -- overlay #1
  rect(7, 8, 7, 8),   // R8-9,   C8-9 -- underlay circle, corner(R8C8,R8C9,R9C8,R9C9)
  rect(9, 10, 9, 10), // R10-11, C10-11 -- underlay circle, corner(R10C10,R10C11,R11C10,R11C11)
];
// Squares (even sum): overlays #5-6 (4-cell corner spans, not rounded) and
// #7-8 (single cells, not rounded). Two single-cell white underlays at
// R8C8/R10C10 sit at the same spots as the odd-circle corners above and are
// a plain background fill, not a second clue.
const EVEN_SINGLES = [[4, 5], [2, 1]];                      // R5C6, R3C2
const EVEN_SHAPES = [
  rect(6, 7, 5, 6),   // R7-8, C6-7 -- overlay #5
  rect(0, 1, 1, 2),   // R1-2, C2-3 -- overlay #6
];

const parityAt = new Map([
  ...ODD_SINGLES.map(([r, c]) => [key(r, c), 1]),
  ...EVEN_SINGLES.map(([r, c]) => [key(r, c), 0]),
]);

// Every live cell's candidates are the values that fit the smallest grid
// covering it (minN), narrowed to one parity when it also carries a
// single-cell odd/even clue. A cell at the full 1-6 range with no parity
// clue needs no Given: the main grid's own Shape already allows 1-6, and the
// AllDifferent/default-Sudoku groups below do the rest.
const domains = [...idOf].flatMap(([k, id]) => {
  const [r, c] = k.split(',').map(Number);
  const hi = minN(r, c);
  const par = parityAt.get(k);
  if (hi === 6 && par === undefined) return [];
  const candidates = [];
  for (let v = 1; v <= hi; v++) if (par === undefined || v % 2 === par) candidates.push(v);
  return [new Given(id, ...candidates)];
});

// The main 6x6 grid gets its row/column all-different from Shape/Sudoku
// below; every smaller grid needs its own row and column groups stated
// explicitly, since Var cells carry no implicit geometry.
const insetGroups = GRIDS.filter(g => g.N !== 6).flatMap(g => {
  const line = (pick) => new AllDifferent(...Array.from({ length: g.N }, (_, i) => pick(i)));
  return [
    ...Array.from({ length: g.N }, (_, i) => line(j => cid(g.r0 + i, g.c0 + j))), // rows
    ...Array.from({ length: g.N }, (_, j) => line(i => cid(g.r0 + i, g.c0 + j))), // columns
  ];
});

// Parity NFA: track the running sum mod 2, accept on the target parity.
// numValues=6 covers every clue cell's true range (the largest owning grid
// is the 6x6); the states are just the residue seen so far.
const parityNFA = (parity) => NFA.encodeSpec({
  startState: 0,
  transition: (sum, v) => (sum + v) % 2,
  accept: (sum) => sum === parity,
}, 6);
const ODD = parityNFA(1);
const EVEN = parityNFA(0);
const paritySums = [
  ...ODD_SHAPES.map(cells => new NFA(ODD, 'odd sum', ...cells.map(([r, c]) => cid(r, c)))),
  ...EVEN_SHAPES.map(cells => new NFA(EVEN, 'even sum', ...cells.map(([r, c]) => cid(r, c)))),
];

return [
  new Shape('6x6'),
  new NoBoxes(),
  ...vars.slice(1),
  ...domains,
  ...insetGroups,
  ...paritySums,
];
