// Title: Counting Calories
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=dnj0fsDTUyg
// Source: https://sudokupad.app/meq4crszcg

// Rules encoded here:
//   1. Normal sudoku.
//   2. Every cell is yellow (banana) or brown (chocolate). A "region" is a
//      maximal orthogonally-connected block of one colour; that definition is
//      what makes the rules' "each region is orthogonally connected" and "two
//      regions of the same colour may not share an orthogonal edge" hold, since
//      two same-colour regions sharing an edge would be one region.
//   3. Every brown region is a rectangle (squares included).
//   4. No yellow region is a rectangle.
//   5. A digit in a yellow cell d occurs in exactly d yellow cells.
//   6. A digit in a brown diamond gives the cell count of its brown rectangle.
//   7. No two brown rectangles have the same cell count.
//   8. An arrow cell's digit is the sum of its immediate neighbours in the
//      drawn directions.
// "Digits may repeat within regions" adds nothing over 1-8: no constraint here
// makes a region's digits distinct. Nothing is omitted.

const shape = new Shape('9x9');
const graph = cellGraph(shape);

const BROWN = 1;
const YELLOW = 2;
const NO = 1;    // flag overlays: 1 = false, 2 = true
const YES = 2;

// VS  colour of each cell (BROWN / YELLOW).
// VW  length of the maximal horizontal run of same-coloured cells through the
//     cell; VH the same vertically. On a brown cell these are its rectangle's
//     width and height, because a rectangle spans its full width in each of its
//     rows and no same-coloured cell may sit beside it.
// VT  YES on the top-left cell of a brown rectangle (the only cell of a
//     rectangle with no brown cell above and none to its left).
// VL  YES on cell (r,c) when (r,c) and (r,c+1) are yellow, agree on VH, and
//     (r-1,c+1) is not yellow. VM is the downward analogue. See the yellow
//     rectangle machine below for what these chains certify.
const shade = graph.makeOverlay('VS');
const hRun = graph.makeOverlay('VW');
const vRun = graph.makeOverlay('VH');
const barCorner = graph.makeOverlay('VT');
const rightLink = graph.makeOverlay('VL');
const downLink = graph.makeOverlay('VM');

const cells = graph.cells();
const at = (row, col) => makeCellId(row, col);
const shiftOf = (cell, dRow, dCol) => graph.step(cell, dRow, dCol);

// --- Drawn clues -----------------------------------------------------------

// Brown diamonds: the 12 rotated saddlebrown underlays, one per cell centre.
const diamondCells = [
  'R8C1', 'R6C1', 'R5C3', 'R3C3', 'R7C4', 'R9C4',
  'R6C5', 'R3C6', 'R8C6', 'R1C8', 'R9C7', 'R6C7',
];

// Arrow clues: each cell carries short arrows drawn from its centre, one per
// listed [dRow, dCol] direction; the summed cells are the single neighbours
// those arrows point at.
const arrowClues = [
  ['R7C1', [[1, 1], [1, 0]]],
  ['R8C4', [[1, 0], [0, -1], [-1, -1], [-1, 1]]],
  ['R7C8', [[0, 1], [1, -1]]],
];

// --- State machines --------------------------------------------------------

// A brown region is a rectangle exactly when no 2x2 window holds three brown
// cells: three cells of a 2x2 are orthogonally connected, so they lie in one
// region, and a reflex corner of a polyomino is precisely such a window. A
// polyomino with no reflex corner (and hence no hole) is a rectangle.
const noBrownCorner = NFA.encodeSpec({
  startState: { n: 0 },
  transition: ({ n }, value) => {
    if (value === BROWN) return { n: Math.min(n + 1, 4) };
    if (value === YELLOW) return { n };
    return undefined;
  },
  accept: ({ n }) => n !== 3,
}, shape);

// Scans a row (or column) as [colour, run, colour, run, ...]: each maximal
// same-colour run must be exactly as long as the run value every one of its
// cells carries. `dec` is the length the run's first cell declared.
const runLengths = NFA.encodeSpec({
  startState: { sh: 0, cnt: 0, dec: 0, onColour: true },
  transition: ({ sh, cnt, dec, onColour }, value) => {
    if (onColour) {
      if (value !== BROWN && value !== YELLOW) return undefined;
      if (sh === 0 || value !== sh) {
        if (sh !== 0 && cnt !== dec) return undefined;   // previous run short
        return { sh: value, cnt: 1, dec: 0, onColour: false };
      }
      return { sh, cnt: cnt + 1, dec, onColour: false };
    }
    if (dec === 0) return { sh, cnt, dec: value, onColour: true };
    if (value !== dec || cnt > dec) return undefined;
    return { sh, cnt, dec, onColour: true };
  },
  accept: ({ cnt, dec, onColour }) => onColour && cnt === dec,
}, shape);

// Flag definitions. `tests` reads one cell each, the last cell is the flag, and
// the flag must be YES exactly when every test passed. `carryAt` names the step
// whose value is remembered so a later test can compare against it.
const flagSpec = (tests, carryAt) => NFA.encodeSpec({
  startState: { k: 0, ok: true, held: 0 },
  transition: ({ k, ok, held }, value) => {
    if (k === tests.length) {
      return { k: k + 1, ok: value === (ok ? YES : NO), held: 0 };
    }
    if (k > tests.length) return undefined;
    const next = tests[k](value, held) ? ok : false;
    return { k: k + 1, ok: next, held: k === carryAt ? value : held };
  },
  accept: ({ k, ok }) => k === tests.length + 1 && ok,
}, shape);

const isYellow = (value) => value === YELLOW;
const isBrown = (value) => value === BROWN;
const hold = (_value) => true;
const matchesHeld = (value, held) => value === held;

// VT: brown, with no brown cell above and none to the left. At R1C1 there is
// neither neighbour, so the rule is a two-cell relation and needs no machine.
const cornerIsBrown = Pair.fnToKey(
  (colour, flag) => flag === (colour === BROWN ? YES : NO), shape);
const cornerSpec = (hasUp, hasLeft) => flagSpec([
  isBrown,
  ...(hasUp ? [isYellow] : []),
  ...(hasLeft ? [isYellow] : []),
], -1);

// VL / VM: both cells yellow, equal run length across the step, and the cell
// diagonally back from the second one (above for VL, left for VM) not yellow.
const linkSpec = (hasSide) => flagSpec([
  isYellow, isYellow, hold, matchesHeld,
  ...(hasSide ? [isBrown] : []),
], 2);

// Rejects exactly the configurations in which the yellow region containing the
// scanned cell is a rectangle with that cell as its top-left corner; applied at
// every cell, that forbids every rectangular yellow region.
//
// Segment 1 is [own colour, (above), (left), VW, VH]; the cell starts a yellow
// rectangle candidate of width w and height h. Because the cells above and to
// the left are not yellow, the two runs start here: row r holds yellow in
// columns c..c+w-1 only, column c holds yellow in rows r..r+h-1 only.
// Segment 2 is VL from (r,c) rightwards. w-1 consecutive YES flags say that
// columns c+1..c+w-1 each hold yellow in exactly rows r..r+h-1 as well, so the
// whole w x h block is yellow and closed above and below.
// Segment 3 is VM from (r,c) downwards. h-1 consecutive YES flags say that rows
// r+1..r+h-1 each hold yellow in exactly columns c..c+w-1, closing the block
// left and right. A closed block is the whole region, so it is a rectangle.
const SAFE = { p: 'safe' };
const rectangleYellow = (hasUp, hasLeft) => NFA.encodeSpec({
  startState: { p: 'own' },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      if (state.p === 'preRow') {
        return { p: 'row', need: state.w - 1, h: state.h };
      }
      if (state.p === 'row') {
        return state.need > 0 ? SAFE : { p: 'col', need: state.h - 1 };
      }
      return state.p === 'safe' ? SAFE : undefined;
    }
    switch (state.p) {
      case 'own':
        if (value !== YELLOW) return SAFE;
        return { p: hasUp ? 'above' : (hasLeft ? 'left' : 'width') };
      case 'above':
        if (value !== BROWN) return SAFE;
        return { p: hasLeft ? 'left' : 'width' };
      case 'left':
        return value === BROWN ? { p: 'width' } : SAFE;
      case 'width':
        return { p: 'height', w: value };
      case 'height':
        return { p: 'preRow', w: state.w, h: value };
      case 'row':
        if (state.need === 0) return state;
        return value === YES
          ? { p: 'row', need: state.need - 1, h: state.h } : SAFE;
      case 'col':
        if (state.need === 0) return state;
        return value === YES ? { p: 'col', need: state.need - 1 } : SAFE;
      default:
        return SAFE;
    }
  },
  accept: (state) => !(state.p === 'col' && state.need === 0),
}, shape, { multiSegment: true });

// A diamond's digit is the cell count of its rectangle: [digit, VW, VH].
const diamondSize = NFA.encodeSpec({
  startState: { k: 0 },
  transition: ({ k, d, w }, value) => {
    if (k === 0) return { k: 1, d: value };
    if (k === 1) return { k: 2, d, w: value };
    if (k === 2) return { k: 3, ok: d === w * value };
    return undefined;
  },
  accept: ({ k, ok }) => k === 3 && ok,
}, shape);

// Distinct rectangle sizes: scanning [VT, VW, VH] over every cell, no two
// top-left corners may report the same cell count. `areas` is a subset of the
// achievable counts; one machine per subset keeps the seen-set bitmask small.
const distinctSizes = (areas) => NFA.encodeSpec({
  startState: { k: 0, seen: 0 },
  transition: ({ k, seen, t, w }, value) => {
    if (k === 0) {
      if (value !== NO && value !== YES) return undefined;
      return { k: 1, seen, t: value };
    }
    if (k === 1) return { k: 2, seen, t, w: value };
    if (t !== YES) return { k: 0, seen };
    const index = areas.indexOf(w * value);
    if (index < 0) return { k: 0, seen };
    const bit = 1 << index;
    if (seen & bit) return undefined;    // this size is already taken
    return { k: 0, seen: seen | bit };
  },
  accept: ({ k }) => k === 0,
}, shape);

// Yellow self-count for one digit, scanning [digit, colour] over every cell:
// the digit appears in either no yellow cell or exactly `digit` of them.
const yellowCount = (digit) => NFA.encodeSpec({
  startState: { k: 0, n: 0 },
  transition: ({ k, n, v }, value) => {
    if (k === 0) return { k: 1, n, v: value };
    if (value !== BROWN && value !== YELLOW) return undefined;
    if (value !== YELLOW || v !== digit) return { k: 0, n };
    return n + 1 > digit ? undefined : { k: 0, n: n + 1 };
  },
  accept: ({ k, n }) => k === 0 && (n === 0 || n === digit),
}, shape);

// --- Constraint groups -----------------------------------------------------

const flagDomain = (overlay) =>
  overlay.makeReplicate(new Given(overlay.cells()[0], NO, YES));

const twoByTwoCorners = shade.makeReplicate(
  new NFA(noBrownCorner, 'brown rectangles',
    ...shade.at([at(1, 1), at(1, 2), at(2, 1), at(2, 2)])),
  shade.at(cells.filter(cell => shiftOf(cell, 1, 1) !== null)));

const rowRuns = graph.rows().map((row, i) => new NFA(
  runLengths, `row ${i + 1} runs`,
  ...row.flatMap(cell => [shade.at(cell), hRun.at(cell)])));

const columnRuns = graph.columns().map((column, i) => new NFA(
  runLengths, `column ${i + 1} runs`,
  ...column.flatMap(cell => [shade.at(cell), vRun.at(cell)])));

const cornerFlags = cells.map(cell => {
  const up = shiftOf(cell, -1, 0);
  const left = shiftOf(cell, 0, -1);
  if (up === null && left === null) {
    return new Pair(
      cornerIsBrown, 'bar corner', shade.at(cell), barCorner.at(cell));
  }
  return new NFA(
    cornerSpec(up !== null, left !== null), 'bar corner',
    shade.at(cell),
    ...(up ? [shade.at(up)] : []),
    ...(left ? [shade.at(left)] : []),
    barCorner.at(cell));
});

const rightLinkFlags = cells.flatMap(cell => {
  const right = shiftOf(cell, 0, 1);
  if (right === null) return [new Given(rightLink.at(cell), NO)];
  const aboveRight = shiftOf(right, -1, 0);
  return [new NFA(
    linkSpec(aboveRight !== null), 'right link',
    shade.at(cell), shade.at(right), vRun.at(cell), vRun.at(right),
    ...(aboveRight ? [shade.at(aboveRight)] : []),
    rightLink.at(cell))];
});

const downLinkFlags = cells.flatMap(cell => {
  const down = shiftOf(cell, 1, 0);
  if (down === null) return [new Given(downLink.at(cell), NO)];
  const leftDown = shiftOf(down, 0, -1);
  return [new NFA(
    linkSpec(leftDown !== null), 'down link',
    shade.at(cell), shade.at(down), hRun.at(cell), hRun.at(down),
    ...(leftDown ? [shade.at(leftDown)] : []),
    downLink.at(cell))];
});

const yellowShapes = cells.map(cell => {
  const up = shiftOf(cell, -1, 0);
  const left = shiftOf(cell, 0, -1);
  return new NFA(
    rectangleYellow(up !== null, left !== null), 'no yellow rectangle',
    [shade.at(cell),
    ...(up ? [shade.at(up)] : []),
    ...(left ? [shade.at(left)] : []),
      hRun.at(cell), vRun.at(cell)],
    rightLink.at(graph.ray(cell, 0, 1)),
    downLink.at(graph.ray(cell, 1, 0)));
});

const diamondBrown = diamondCells.map(cell => new Given(shade.at(cell), BROWN));
const diamondSizes = diamondCells.map(cell => new NFA(
  diamondSize, 'diamond size', cell, hRun.at(cell), vRun.at(cell)));

const achievableAreas = [...new Set(
  cells.flatMap((_, i) => cells.map((_, j) => (i % 9 + 1) * (j % 9 + 1))))]
  .sort((a, b) => a - b);
const AREAS_PER_MACHINE = 4;   // 2^4 seen-set states, well inside the NFA cap
const sizeCells = cells.flatMap(
  cell => [barCorner.at(cell), hRun.at(cell), vRun.at(cell)]);
const distinctBarSizes = Array.from(
  { length: Math.ceil(achievableAreas.length / AREAS_PER_MACHINE) },
  (_, i) => {
    const areas = achievableAreas.slice(
      i * AREAS_PER_MACHINE, (i + 1) * AREAS_PER_MACHINE);
    return new NFA(
      distinctSizes(areas), `distinct sizes ${areas.join(',')}`, ...sizeCells);
  });

const countCells = cells.flatMap(cell => [cell, shade.at(cell)]);
const yellowCounts = Array.from({ length: 9 }, (_, i) => new NFA(
  yellowCount(i + 1), `yellow ${i + 1}s`, ...countCells));

const arrows = arrowClues.map(([cell, directions]) => new Arrow(
  cell, ...directions.map(([dRow, dCol]) => shiftOf(cell, dRow, dCol))));

return [
  shape,
  shade.toVar('colour'),
  hRun.toVar('horizontal run'),
  vRun.toVar('vertical run'),
  barCorner.toVar('bar top-left'),
  rightLink.toVar('right link'),
  downLink.toVar('down link'),
  flagDomain(shade),
  flagDomain(barCorner),
  flagDomain(rightLink),
  flagDomain(downLink),
  twoByTwoCorners,
  ...rowRuns,
  ...columnRuns,
  ...cornerFlags,
  ...rightLinkFlags,
  ...downLinkFlags,
  ...yellowShapes,
  ...diamondBrown,
  ...diamondSizes,
  ...distinctBarSizes,
  ...yellowCounts,
  ...arrows,
];
