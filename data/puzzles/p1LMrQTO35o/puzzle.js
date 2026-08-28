// Title: Spelunker
// Author: KNT
// Video: https://www.youtube.com/watch?v=p1LMrQTO35o
// Source: https://tinyurl.com/k3j46ntb

// Rules encoded:
// - Normal sudoku rules (rows, columns, boxes all-different; boxes are the
//   default 3x3 tiling -- no region overrides are drawn).
// - Every cell is coloured WALL or CAVE. All CAVE cells form exactly one
//   orthogonally-connected region (the cave); every WALL cell has an orthogonal
//   path to the grid edge through WALL cells only (WALL cells need not form one
//   region themselves -- several separate wall blobs, each touching the edge,
//   are legal). WALL cells may not form a 2x2 block. A clue cell must be CAVE.
// - A clue's printed value is the sum of the digits seen from its cell looking
//   N/S/E/W, counting its own digit once. Walls obstruct the view: a ray runs
//   over CAVE cells only, stopping at (and excluding) the first WALL cell or the
//   grid edge. Digits seen from one clue (any direction, including its own
//   cell) may not repeat -- same-row/-column repeats are already excluded by
//   normal sudoku, so the added constraint is only cross-axis (a north/south
//   digit vs an east/west digit).
// - Two orthogonally adjacent WALL cells must differ by >= 5; an isolated WALL
//   cell (no WALL neighbour) is unconstrained.
// - Several clue cells (R1C7, R7C8, R7C4, R8C3, R5C2, R4C5) are printed as an
//   inequality ("<N"/">N") rather than an exact total -- read literally as a
//   strict bound on the same visible-sum total (the drawn mark), since the
//   ruleset gives no other reading for a printed relational sign.

// --- Wall-to-edge connectivity, and why it needs a widened grid --------------
// ConnectedValues proves a SINGLE var-group region connected; it cannot express
// "each wall blob independently touches the edge" directly, and a wall region
// need not be one component. The fix: surround the real 9x9 with a fixed ring
// of WALL cells, and require the WHOLE wall value set (ring + interior) to be
// ONE ConnectedValues region. The ring is itself one connected loop, so any
// interior wall cell with a wall-only path to the true grid edge necessarily
// merges into the ring's component; an interior wall blob that does not reach
// the edge stays a separate component and is correctly rejected (checked
// against a small accept/reject fixture before use here).
// ConnectedValues' overlay must be paired to real cell geometry (not free
// Vars), so the ring has to be actual grid cells: the whole puzzle is built on
// an 11x11 Raw grid (no implicit rules at all), with the true 9x9 sudoku living
// at offset (1,1) and every real sudoku rule (rows, columns, boxes, digit
// range) stated explicitly over just those cells. The ring cells carry no
// puzzle meaning; their own "digit" is pinned to a constant so it cannot
// inflate the solution count.

const WALL = 1, CAVE = 2;
const HIDDEN = 1, VISIBLE = 2;

// 0 is used only by the masked-digit overlay (a digit cell's value when it is
// not seen from a clue); real sudoku digits stay 1-9, enforced with an
// explicit Given below since a Raw grid states every rule itself.
const shape = new Shape('11x11', '0-9', 'Raw');
const graph = cellGraph(shape);
const shade = graph.makeOverlay('VS');

// True 9x9 (row, col), both 1-indexed as printed -> its cell id on the widened
// 11x11 grid, offset by the 1-cell ring added on every side (not a 0-indexed
// payload conversion).
const RING_WIDTH = 1;
function cellAt(row, col) { return makeCellId(row + RING_WIDTH, col + RING_WIDTH); }

const allWidenedCells = graph.cells();
const trueCells = [];
for (let r = 1; r <= 9; r++) for (let c = 1; c <= 9; c++) trueCells.push(cellAt(r, c));
const trueCellSet = new Set(trueCells);
const ringCells = allWidenedCells.filter(c => !trueCellSet.has(c));

// Real sudoku rules, confined to the true 9x9 (Raw grid adds nothing itself).
const trueRows = [];
for (let r = 1; r <= 9; r++) {
  const row = [];
  for (let c = 1; c <= 9; c++) row.push(cellAt(r, c));
  trueRows.push(row);
}
const trueCols = [];
for (let c = 1; c <= 9; c++) {
  const col = [];
  for (let r = 1; r <= 9; r++) col.push(cellAt(r, c));
  trueCols.push(col);
}
const trueBoxes = [];
for (let br = 0; br < 3; br++) for (let bc = 0; bc < 3; bc++) {
  const box = [];
  for (let dr = 1; dr <= 3; dr++) for (let dc = 1; dc <= 3; dc++) {
    box.push(cellAt(br * 3 + dr, bc * 3 + dc));
  }
  trueBoxes.push(box);
}
const sudokuGroups = [...trueRows, ...trueCols, ...trueBoxes]
  .map(cells => new AllDifferent(...cells));
// One flat domain restriction stamped over a whole cell group is a one-cell
// Replicate template; avoids 80+ shifted-copy Givens for the same value set.
// Stamp the digit domain over *every* widened
// grid cell (true + ring) so the ring's narrower {1} pin below simply
// intersects with it, rather than leaving the ring "skipped" by the domain
// replicate (lint_constraints.js: replicated-domain-skips-clue-cells).
const digitDomainGivens = [new Replicate(
  [new Given(allWidenedCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)],
  Replicate.encodeTargetCells(allWidenedCells, allWidenedCells[0], graph),
  allWidenedCells[0])];
// Ring cells are not real sudoku cells; pin their incidental digit so it can't
// multiply the search space.
const ringDigitGivens = [new Replicate(
  [new Given(ringCells[0], 1)],
  Replicate.encodeTargetCells(ringCells, ringCells[0], graph),
  ringCells[0])];

// Shading: WALL/CAVE per cell, ring pinned to WALL so it acts as the border
// anchor described above. Same whole-group-domain-then-narrow shape as the
// digit domain above.
const shadeVar = shade.toVar('shade');
const allShadeVarCells = shade.at(allWidenedCells);
const shadeDomainGivens = [new Replicate(
  [new Given(allShadeVarCells[0], WALL, CAVE)],
  Replicate.encodeTargetCells(allShadeVarCells, allShadeVarCells[0], shade),
  allShadeVarCells[0])];
const ringShadeVarCells = shade.at(ringCells);
const ringShadeGivens = [new Replicate(
  [new Given(ringShadeVarCells[0], WALL)],
  Replicate.encodeTargetCells(ringShadeVarCells, ringShadeVarCells[0], shade),
  ringShadeVarCells[0])];
const connectivity = [
  new ConnectedValues('VS', WALL),
  new ConnectedValues('VS', CAVE),
];

// No 2x2 all-WALL block, checked over the true 9x9 only (the ring is a modelling
// device, not part of the drawn puzzle).
const no2x2Wall = [];
for (let r = 1; r <= 8; r++) for (let c = 1; c <= 8; c++) {
  const block = [cellAt(r, c), cellAt(r, c + 1), cellAt(r + 1, c), cellAt(r + 1, c + 1)];
  no2x2Wall.push(new Or(block.map(cell => new Given(shade.at(cell), CAVE))));
}

// Adjacent WALL cells differ by >= 5 (a whisper-style rule scoped to WALL/WALL
// edges only).
const diff5Key = Pair.fnToKey((a, b) => Math.abs(a - b) >= 5, shape);
const wallDiff5 = [];
for (let r = 1; r <= 9; r++) for (let c = 1; c <= 9; c++) {
  if (c < 9) {
    const a = cellAt(r, c), b = cellAt(r, c + 1);
    wallDiff5.push(new Or([
      new Given(shade.at(a), CAVE), new Given(shade.at(b), CAVE),
      new Pair(diff5Key, 'wall-diff5', a, b)]));
  }
  if (r < 9) {
    const a = cellAt(r, c), b = cellAt(r + 1, c);
    wallDiff5.push(new Or([
      new Given(shade.at(a), CAVE), new Given(shade.at(b), CAVE),
      new Pair(diff5Key, 'wall-diff5', a, b)]));
  }
}

// Sight-sum clues. `value` is either an exact total (a plain number) or a
// printed inequality bound ('>N' / '<N'); coordinates are 1-indexed (row, col),
// transcribed from the puzzle's own drawn clue cages.
const clues = [
  { cell: [2, 2], value: '5' },
  { cell: [1, 3], value: '14' },
  { cell: [1, 5], value: '7' },
  { cell: [1, 7], value: '>11' },
  { cell: [9, 5], value: '18' },
  { cell: [7, 8], value: '<20' },
  { cell: [7, 4], value: '<13' },
  { cell: [8, 3], value: '<23' },
  { cell: [9, 2], value: '29' },
  { cell: [6, 1], value: '7' },
  { cell: [4, 1], value: '11' },
  { cell: [5, 2], value: '>0' },
  { cell: [4, 5], value: '>0' },
];
const clueGivens = clues.map(({ cell: [r, c] }) => new Given(shade.at(cellAt(r, c)), CAVE));

const DIRS = [
  { name: 'N', dr: -1, dc: 0 },
  { name: 'S', dr: 1, dc: 0 },
  { name: 'E', dr: 0, dc: 1 },
  { name: 'W', dr: 0, dc: -1 },
];

function rayCells(r, c, dr, dc) {
  const cells = [];
  let rr = r + dr, cc = c + dc;
  while (rr >= 1 && rr <= 9 && cc >= 1 && cc <= 9) {
    cells.push(cellAt(rr, cc));
    rr += dr; cc += dc;
  }
  return cells;
}

// Per-ray "still visible" flag chain: flag_i is VISIBLE iff every shade cell
// from the clue up to and including position i is CAVE. A tiny 2-state NFA
// (open/closed) scanning [shade_1, flag_1, shade_2, flag_2, ...] forces each
// flag cell to the correct value; the machine never has anything to reject
// beyond a mismatched flag, so `accept` is unconditional.
const visibilitySpec = NFA.encodeSpec({
  startState: { open: true, phase: 'shade' },
  transition: (state, value) => {
    if (state.phase === 'shade') {
      if (value !== WALL && value !== CAVE) return undefined;
      return { open: state.open && value === CAVE, phase: 'flag' };
    }
    // phase === 'flag'
    const expected = state.open ? VISIBLE : HIDDEN;
    if (value !== expected) return undefined;
    return { open: state.open, phase: 'shade' };
  },
  accept: () => true,
}, shape);

// Per-position mask: maskedCell equals the real digit when its flag is
// VISIBLE, else 0. Keeps the running sight-sum a plain linear Sum (fixed
// coefficient 1 per masked cell) with no combinatorial blow-up.
function maskConstraint(flagCell, digitCell, maskedCell) {
  return new Or([
    new And([new Given(flagCell, VISIBLE), new SameValues(2, maskedCell, digitCell)]),
    new And([new Given(flagCell, HIDDEN), new Given(maskedCell, 0)])]);
}

// Clamped running-sum NFA for an inequality clue: '>' needs the total to reach
// bound+1 (any higher collapses into that same sink state); '<' needs the
// total to stay below bound (reaching it collapses into a "failed" sink).
// Bounds come from the clue's own printed number, not the (unknown, unstored)
// solution.
function inequalitySumNFA(relation, bound) {
  const sink = relation === '>' ? bound + 1 : bound;
  const spec = NFA.encodeSpec({
    startState: { total: 0 },
    transition: (state, value) => {
      if (value < 0 || value > 9) return undefined;
      return { total: Math.min(state.total + value, sink) };
    },
    accept: (state) => relation === '>' ? state.total === sink : state.total < sink,
  }, shape);
  return spec;
}

let nextPrefixIndex = 0;
function nextPrefixLetters(n) {
  // Two-letter uppercase prefixes, generated in order (AA, AB, ..).
  const letters = [];
  let idx = nextPrefixIndex++;
  for (let i = 0; i < n; i++) {
    letters.unshift(String.fromCharCode(65 + (idx % 26)));
    idx = Math.floor(idx / 26);
  }
  return letters.join('').padStart(n, 'A');
}

const sightConstraints = [];
for (const { cell: [r, c], value } of clues) {
  const ownCell = cellAt(r, c);
  const axisCells = { row: [], col: [] }; // masked cells, for the cross-axis check
  const allMasked = [];

  for (const { name, dr, dc } of DIRS) {
    const ray = rayCells(r, c, dr, dc);
    if (ray.length === 0) continue;

    const tag = nextPrefixLetters(3);
    const flagVar = new Var(`F${tag}`, `visible flags ${ownCell} ${name}`, ray.length);
    const maskVar = new Var(`M${tag}`, `masked digits ${ownCell} ${name}`, ray.length);
    const flagCells = flagVar.cells();
    const maskCells = maskVar.cells();

    const scan = [];
    for (let i = 0; i < ray.length; i++) {
      scan.push(shade.at(ray[i]), flagCells[i]);
    }
    sightConstraints.push(
      flagVar, maskVar,
      new NFA(visibilitySpec, `visible-${tag}`, ...scan),
      ...flagCells.map(f => new Given(f, HIDDEN, VISIBLE)),
      ...ray.map((cell, i) => maskConstraint(flagCells[i], cell, maskCells[i])));

    allMasked.push(...maskCells);
    (name === 'N' || name === 'S' ? axisCells.col : axisCells.row).push(...maskCells);
  }

  // Cross-axis distinctness: same-row/-column repeats are already forbidden by
  // normal sudoku, so only a row-axis digit vs a column-axis digit needs an
  // explicit check. 0 (masked/hidden) never conflicts with anything.
  const neqOrZeroKey = Pair.fnToKey((a, b) => a === 0 || b === 0 || a !== b, shape);
  for (const rowCell of axisCells.row) {
    for (const colCell of axisCells.col) {
      sightConstraints.push(new Pair(neqOrZeroKey, 'sight-neq', rowCell, colCell));
    }
  }

  // Total = own digit (counted once) + every masked cell (0 when not seen).
  const m = /^([<>]?)(\d+)$/.exec(value);
  const relation = m[1], bound = +m[2];
  if (relation === '') {
    sightConstraints.push(new Sum(bound, ownCell, ...allMasked));
  } else {
    const spec = inequalitySumNFA(relation, bound);
    sightConstraints.push(new NFA(spec, `sum-${nextPrefixLetters(3)}`, ownCell, ...allMasked));
  }
}

return [
  shape,
  ...sudokuGroups,
  ...digitDomainGivens,
  ...ringDigitGivens,
  shadeVar,
  ...shadeDomainGivens,
  ...ringShadeGivens,
  ...connectivity,
  ...no2x2Wall,
  ...wallDiff5,
  ...clueGivens,
  ...sightConstraints,
];
