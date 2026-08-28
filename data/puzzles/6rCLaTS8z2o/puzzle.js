// Title: Tumbleweed Sudoku
// Author: Simon Ferre
// Video: https://www.youtube.com/watch?v=6rCLaTS8z2o
// Source: https://cracking-the-cryptic.web.app/sudoku/jF9RR248G2

// Normal sudoku rules apply; the payload's own regions equal the default
// 3x3 boxes, so no explicit region constraint is needed.
//
// EITHER all even-valued cells or all odd-valued cells form a single
// orthogonally-connected region (not necessarily both). `ConnectedValues`
// cannot be nested inside `Or`/`And`, so this is modelled with a
// solver-chosen branch cell (VBR: 1 = even is the active parity, 2 = odd is)
// plus a derived whole-grid layer (VAL) that is ACTIVE on a cell iff that
// cell's digit matches the branch's chosen parity. `ConnectedValues` then
// applies unconditionally to VAL's ACTIVE cells.
//
// Wherever a 2x2 block is all-odd or all-even, a circled number sums the
// DIFFERENT digits in the block (repeats may occur in the block but count
// once). Read as exhaustive: every 2x2 block without a circle must NOT be
// all-odd or all-even. Marked blocks use one NFA each, reading the 4 cells
// in a fixed order and rejecting on a parity mismatch while accumulating a
// seen-digit-restricted running sum; unmarked blocks use an `Or` of three
// `Pair` "differs in parity" checks from one hub cell to the other three,
// which is equivalent to "not all four share the hub's parity".
//
// Sandwich clues total the digits between the 1 and the 9 in that row/column.
// The little killer clue sums its indicated diagonal (repeats allowed).

const shape = new Shape('9x9');
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const EVEN_BRANCH = 1;
const ODD_BRANCH = 2;
const ACTIVE = 1;
const INACTIVE = 2;

// Single solver-chosen cell: which parity's cells must connect.
const branchVar = new Var(
  'BR', 'chosen tumbleweed parity: 1 = even cells connect, 2 = odd cells connect', 1);
const branchCell = branchVar.cell(1);

// One Var per grid cell: ACTIVE iff that cell's digit matches the branch's
// chosen parity.
const al = graph.makeOverlay('VAL');
const alVar = al.toVar('active tumbleweed cell (matches the branch-selected parity)');

const domainGivens = [
  new Given(branchCell, EVEN_BRANCH, ODD_BRANCH),
  al.makeReplicate(new Given(al.cells()[0], ACTIVE, INACTIVE)),
];

// Reads [branch, digit, activeFlag] for one grid cell and rejects any
// assignment where activeFlag disagrees with whether digit's parity matches
// the branch.
function parityLinkSpec() {
  return NFA.encodeSpec({
    startState: { phase: 0 },
    transition: (state, value) => {
      if (state.phase === 0) return { phase: 1, branch: value };
      if (state.phase === 1) {
        const isEven = value % 2 === 0;
        const active = (state.branch === EVEN_BRANCH) === isEven;
        return { phase: 2, expect: active ? ACTIVE : INACTIVE };
      }
      // phase 2: value must equal the expected active/inactive code.
      return value === state.expect ? { phase: 3 } : undefined;
    },
    accept: (state) => state.phase === 3,
  }, 9);
}
const linkSpec = parityLinkSpec();
const parityLinks = graph.cells().map(
  cell => new NFA(linkSpec, 'parity-link', branchCell, cell, al.at(cell)));

const tumbleweed = new ConnectedValues('VAL', ACTIVE);

// Circled 2x2 blocks: sum of the block's DISTINCT digits. Cell lists and
// totals transcribed from the drawn circled clues.
const circledBlocks = [
  { cells: ['R2C3', 'R2C4', 'R3C3', 'R3C4'], total: 14 },
  { cells: ['R3C2', 'R3C3', 'R4C2', 'R4C3'], total: 18 },
  { cells: ['R6C2', 'R6C3', 'R7C2', 'R7C3'], total: 21 },
  { cells: ['R8C1', 'R8C2', 'R9C1', 'R9C2'], total: 20 },
  { cells: ['R7C8', 'R7C9', 'R8C8', 'R8C9'], total: 20 },
  { cells: ['R6C8', 'R6C9', 'R7C8', 'R7C9'], total: 20 },
  { cells: ['R4C8', 'R4C9', 'R5C8', 'R5C9'], total: 24 },
  { cells: ['R4C6', 'R4C7', 'R5C6', 'R5C7'], total: 14 },
  { cells: ['R6C6', 'R6C7', 'R7C6', 'R7C7'], total: 4 },
  { cells: ['R7C6', 'R7C7', 'R8C6', 'R8C7'], total: 16 },
  { cells: ['R8C3', 'R8C4', 'R9C3', 'R9C4'], total: 11 },
];

// Tracks (parity established by the first cell read, bitmask of same-parity
// values seen so far, running sum of distinct values). Rejects on any
// parity mismatch between cells; accepts iff the final sum equals the
// clue's total. The sum is clamped at target+1 so it stays a bounded sink
// once a block can only fail.
function distinctSumSpec(target) {
  return NFA.encodeSpec({
    startState: { parity: null, mask: 0, sum: 0 },
    transition: ({ parity, mask, sum }, value) => {
      const p = value % 2 === 0 ? 'even' : 'odd';
      if (parity === null) parity = p;
      else if (parity !== p) return undefined;
      // Same-parity values are 2 apart, so this packs the seen-digit set
      // into a compact 0-4 bit index instead of a 9-bit bitmask.
      const bit = p === 'odd' ? (value - 1) / 2 : value / 2 - 1;
      const alreadySeen = (mask >> bit) & 1;
      const newMask = mask | (1 << bit);
      const newSum = alreadySeen ? sum : Math.min(sum + value, target + 1);
      return { parity, mask: newMask, sum: newSum };
    },
    accept: ({ sum }) => sum === target,
  }, 9);
}
const circledSumConstraints = circledBlocks.map(
  ({ cells, total }) => new NFA(distinctSumSpec(total), 'circled-sum', ...cells));

// Every 2x2 block in the grid, by its top-left cell.
const allBlockCells = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 8; c++) {
    allBlockCells.push(graph.block(makeCellId(r, c), 2, 2));
  }
}
const markedKeys = new Set(circledBlocks.map(b => b.cells.join(',')));
const unmarkedBlockCells = allBlockCells.filter(cells => !markedKeys.has(cells.join(',')));

// "Not all four cells share one parity" == at least one of cells 2-4 differs
// in parity from cell 1 (a hub comparison; if all three hub comparisons
// agreed, all four cells would share the hub's parity).
const parityDiffersKey = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);
const unmarkedBlockConstraints = unmarkedBlockCells.map(([hub, ...rest]) => new Or(
  rest.map(other => new Pair(parityDiffersKey, 'parity differs', hub, other))));

// Sandwich clues: sum of the digits strictly between the 1 and the 9.
const sandwiches = [
  Sandwich.fromCells(8, graph.row(1), geometry),
  Sandwich.fromCells(5, graph.row(3), geometry),
  Sandwich.fromCells(0, graph.row(5), geometry),
  Sandwich.fromCells(5, graph.row(9), geometry),
  Sandwich.fromCells(0, graph.column(8), geometry),
];

// Little killer: diagonal sum (repeats allowed), entering the grid at R5C9
// and running down-left.
const littleKiller = LittleKiller.fromCells(21, graph.ray('R5C9', 1, -1), geometry);

return [
  shape,
  branchVar,
  alVar,
  ...domainGivens,
  ...parityLinks,
  tumbleweed,
  ...circledSumConstraints,
  ...unmarkedBlockConstraints,
  ...sandwiches,
  littleKiller,
];
