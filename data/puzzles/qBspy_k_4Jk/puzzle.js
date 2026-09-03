// Title: Arrow Canal View
// Author: Abed Hawila
// Video: https://www.youtube.com/watch?v=qBspy_k_4Jk
// Source: https://app.crackingthecryptic.com/sudoku/m23L8jF87m

// Rules encoded here, in full:
//  * Normal sudoku: 1-9 once per row, column and box.
//  * Ten arrows: the digit in the circled cell is the sum of the digits on
//    that arrow's shaft.
//  * Some cells are shaded; all shaded cells form one orthogonally connected
//    area, and no 2x2 block of the grid is entirely shaded.
//  * The ten arrow circles are Canal View clues: a circle is never shaded,
//    and its digit -- the same digit the arrow sums to -- is the total number
//    of shaded cells reached from it by running outward along its own row and
//    its own column in all four directions, each run stopping at the first
//    unshaded cell or the grid edge.
//  * Digits do not repeat inside an orthogonally connected area of unshaded
//    cells. ("No 2x2 region may be entirely shaded" shows the rules text uses
//    "region" for an area of the board, so "unshaded regions" are the
//    connected unshaded areas, and "additionally" adds this on top of normal
//    sudoku rather than replacing part of it.)
//
// Four Var overlays carry the shading and the unshaded areas. VS is the
// shading itself. The other three name, for each unshaded cell, the connected
// unshaded area it belongs to: VR/VC hold the row and column of that area's
// anchor cell, and VD holds one plus the number of steps from the anchor.
// The anchor is the area's first cell in reading order, so the name is unique
// and two unshaded cells lie in the same area exactly when their VR/VC agree
// -- which turns "no repeats inside an area" into a condition on cell pairs.
// Shaded cells are pinned to VD=VR=VC=1 so they carry no free choice.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const numValues = geometry.numValues;
const gridCells = graph.cells();

const shade = graph.makeOverlay('VS');
const depth = graph.makeOverlay('VD');
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VC');

// Every shade Var is shaded or unshaded, nothing else.
const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], SHADED, UNSHADED));

// Drawn arrows: the circled cell first, then the shaft cells in drawn order.
// Taken from the ten arrow strokes and the ten circle underlays of the source
// artwork; each stroke leaves its own circle's rim, so the circled cell is
// not part of the shaft.
const ARROWS = [
  ['R3C4', 'R3C3', 'R2C2', 'R1C2'],
  ['R1C8', 'R1C7', 'R2C6'],
  ['R3C7', 'R4C8', 'R5C9'],
  ['R5C7', 'R4C6', 'R3C5'],
  ['R6C9', 'R7C8'],
  ['R8C7', 'R7C6'],
  ['R9C6', 'R9C7', 'R8C6'],
  ['R8C4', 'R9C3'],
  ['R9C1', 'R8C2', 'R7C2', 'R7C3'],
  ['R5C1', 'R6C2', 'R6C3', 'R5C3'],
];
const CIRCLES = ARROWS.map(cells => cells[0]);

const arrows = ARROWS.map(cells => new Arrow(...cells));
const circlesUnshaded = CIRCLES.map(cell => new Given(shade.at(cell), UNSHADED));

// --- Canal View counts --------------------------------------------------
// One machine per circle, reading the circle's digit and then the shade Vars
// of its four rays, each ray ordered outward from the circle. `rem` counts the
// clue digit down as shaded cells are met; `blocked` records that this ray has
// already met an unshaded cell, and is cleared at the start of each new ray,
// so only the unbroken run next to the circle counts. Accepting exactly when
// `rem` reaches 0 at the end of the last ray makes the digit the total of the
// four run lengths.
const canalSpec = (rayStart, total) => NFA.encodeSpec({
  startState: { p: -1 },
  transition: (state, value) => {
    if (state.p < 0) return { p: 0, rem: value, blocked: false };
    if (state.p >= total) return undefined;
    const blocked = rayStart[state.p] ? false : state.blocked;
    if (value === UNSHADED) {
      return { p: state.p + 1, rem: state.rem, blocked: true };
    }
    if (value !== SHADED) return undefined;
    const rem = blocked ? state.rem : state.rem - 1;
    if (rem < 0) return undefined;
    return { p: state.p + 1, rem, blocked };
  },
  accept: (state) => state.p === total && state.rem === 0,
}, numValues);

const canalCounts = CIRCLES.map(cell => {
  // Each ray runs outward from the circle, excluding the circle itself.
  const rays = [[-1, 0], [1, 0], [0, -1], [0, 1]]
    .map(([dRow, dCol]) => graph.ray(cell, dRow, dCol).slice(1));
  const rayStart = rays.flatMap(ray => ray.map((_, i) => i === 0));
  const total = rayStart.length;
  return new NFA(canalSpec(rayStart, total), 'canal-view',
    cell, ...shade.at(rays.flat()));
});

// Shaded cells form exactly one orthogonally connected area.
const shadedConnectivity = new ConnectedValues('VS', SHADED);

// No 2x2 block is entirely shaded: one of its four cells is unshaded.
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noShaded2x2 = shade.makeReplicate(
  new Or(shade.at(graph.block(gridCells[0], 2, 2))
    .map(cell => new Given(cell, UNSHADED))),
  shade.at(blockOrigins));

// --- Naming each unshaded area ------------------------------------------
// Per cell, read as [VS, VD, VR, VC]. A shaded cell is pinned to 1/1/1. An
// unshaded cell names an anchor at (VR, VC) that must not come after the cell
// itself in reading order, and VD = 1 marks the cell as its own anchor. Since
// the anchor of an area is shared by all its cells (see `anchorAgreement`) and
// cannot come after any of them, it is the area's first cell in reading order.
const anchorDomainSpec = (row, col) => NFA.encodeSpec({
  startState: { k: 'shade' },
  transition: (state, value) => {
    switch (state.k) {
      case 'shade':
        if (value === SHADED) return { k: 'pinD' };
        if (value === UNSHADED) return { k: 'depth' };
        return undefined;
      case 'pinD': return value === 1 ? { k: 'pinR' } : undefined;
      case 'pinR': return value === 1 ? { k: 'pinC' } : undefined;
      case 'pinC': return value === 1 ? { k: 'done' } : undefined;
      case 'depth': return { k: 'row', self: value === 1 };
      case 'row':
        if (state.self) return value === row ? { k: 'col', self: true } : undefined;
        return value <= row ? { k: 'col', self: false, r: value } : undefined;
      case 'col':
        if (state.self) return value === col ? { k: 'done' } : undefined;
        // A cell that is not its own anchor sits strictly after the anchor.
        return (state.r < row || value < col) ? { k: 'done' } : undefined;
      default: return undefined;
    }
  },
  accept: (state) => state.k === 'done',
}, numValues);

const anchorDomain = gridCells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new NFA(anchorDomainSpec(row, col), 'anchor-domain',
    shade.at(cell), depth.at(cell), rootRow.at(cell), rootCol.at(cell));
});

// Per cell, read as [VS, VD, then VS, VD of each orthogonal neighbour]. An
// unshaded cell that is not its own anchor (VD > 1) must have an unshaded
// neighbour one step nearer the anchor (VD - 1), and no unshaded neighbour may
// be more than one step nearer. That makes VD the step count from the anchor,
// which also caps an unshaded area at nine cells across -- an area cannot hold
// more than nine cells anyway, since its digits are distinct.
const depthStepSpec = NFA.encodeSpec({
  startState: { k: 'shade' },
  transition: (state, value) => {
    switch (state.k) {
      case 'shade':
        if (value === SHADED) return { k: 'skip' };
        if (value === UNSHADED) return { k: 'depth' };
        return undefined;
      case 'skip': return { k: 'skip' };
      case 'depth': return { k: 'nShade', d: value, found: value === 1 };
      case 'nShade':
        return { k: 'nDepth', d: state.d, found: state.found, on: value === UNSHADED };
      case 'nDepth':
        if (!state.on) return { k: 'nShade', d: state.d, found: state.found };
        if (value < state.d - 1) return undefined;
        return {
          k: 'nShade', d: state.d,
          found: state.found || value === state.d - 1,
        };
      default: return undefined;
    }
  },
  accept: (state) => state.k === 'skip' || (state.k === 'nShade' && state.found),
}, numValues);

const depthSteps = gridCells.map(cell => new NFA(
  depthStepSpec, 'anchor-step',
  shade.at(cell), depth.at(cell),
  ...graph.neighbours(cell).flatMap(n => [shade.at(n), depth.at(n)])));

// Per orthogonally adjacent pair, read as [VS, VS, VR, VR, VC, VC]. Two
// unshaded neighbours are in the same unshaded area, so they name the same
// anchor; that spreads one anchor over the whole area.
const anchorAgreementSpec = NFA.encodeSpec({
  startState: { k: 'shadeA' },
  transition: (state, value) => {
    switch (state.k) {
      case 'shadeA':
        if (value === SHADED) return { k: 'skip' };
        if (value === UNSHADED) return { k: 'shadeB' };
        return undefined;
      case 'shadeB':
        if (value === SHADED) return { k: 'skip' };
        if (value === UNSHADED) return { k: 'rowA' };
        return undefined;
      case 'skip': return { k: 'skip' };
      case 'rowA': return { k: 'rowB', r: value };
      case 'rowB': return value === state.r ? { k: 'colA' } : undefined;
      case 'colA': return { k: 'colB', c: value };
      case 'colB': return value === state.c ? { k: 'done' } : undefined;
      default: return undefined;
    }
  },
  accept: (state) => state.k === 'skip' || state.k === 'done',
}, numValues);

const anchorAgreement = gridCells.flatMap(cell => [[0, 1], [1, 0]].flatMap(
  ([dRow, dCol]) => {
    const other = graph.step(cell, dRow, dCol);
    if (!other) return [];
    return [new NFA(anchorAgreementSpec, 'anchor-agree',
      shade.at(cell), shade.at(other),
      rootRow.at(cell), rootRow.at(other),
      rootCol.at(cell), rootCol.at(other))];
  }));

// --- No repeats inside an unshaded area ---------------------------------
// Per cell pair, read as [VS, VS, digit, digit, VR, VR, VC, VC]: two unshaded
// cells naming the same anchor are in the same unshaded area, so their digits
// differ. The machine stops caring as soon as any of shading, digits or anchor
// separates the two cells. Rows, columns and boxes are already all-different,
// so only pairs that share none of the three need a machine.
const noRepeatSpec = NFA.encodeSpec({
  startState: { k: 'shadeA' },
  transition: (state, value) => {
    switch (state.k) {
      case 'shadeA':
        if (value === SHADED) return { k: 'skip' };
        if (value === UNSHADED) return { k: 'shadeB' };
        return undefined;
      case 'shadeB':
        if (value === SHADED) return { k: 'skip' };
        if (value === UNSHADED) return { k: 'digitA' };
        return undefined;
      case 'skip': return { k: 'skip' };
      case 'digitA': return { k: 'digitB', d: value };
      case 'digitB': return value === state.d ? { k: 'rowA' } : { k: 'skip' };
      case 'rowA': return { k: 'rowB', r: value };
      case 'rowB': return value === state.r ? { k: 'colA' } : { k: 'skip' };
      case 'colA': return { k: 'colB', c: value };
      case 'colB': return value === state.c ? undefined : { k: 'skip' };
      default: return undefined;
    }
  },
  accept: (state) => state.k === 'skip',
}, numValues);

const sameBox = (a, b) =>
  ((a.row - 1) / 3 | 0) === ((b.row - 1) / 3 | 0) &&
  ((a.col - 1) / 3 | 0) === ((b.col - 1) / 3 | 0);

const noRepeatPairs = gridCells.flatMap((cell, i) => {
  const a = parseCellId(cell);
  return gridCells.slice(i + 1).filter(other => {
    const b = parseCellId(other);
    return a.row !== b.row && a.col !== b.col && !sameBox(a, b);
  }).map(other => new NFA(noRepeatSpec, 'area-no-repeat',
    shade.at(cell), shade.at(other),
    cell, other,
    rootRow.at(cell), rootRow.at(other),
    rootCol.at(cell), rootCol.at(other)));
});

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  depth.toVar('anchorStep'),
  rootRow.toVar('anchorRow'),
  rootCol.toVar('anchorCol'),
  shadeDomain,
  ...arrows,
  ...circlesUnshaded,
  ...canalCounts,
  shadedConnectivity,
  noShaded2x2,
  ...anchorDomain,
  ...depthSteps,
  ...anchorAgreement,
  ...noRepeatPairs,
];
