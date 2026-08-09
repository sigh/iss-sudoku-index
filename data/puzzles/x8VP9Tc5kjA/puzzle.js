// Title: Shimadoku
// Author: rockratzero and Agent
// Video: https://www.youtube.com/watch?v=x8VP9Tc5kjA
// Source: https://app.crackingthecryptic.com/sudoku/mJ3HbD6n9p

// Normal sudoku rules apply. Each dashed cage holds a single orthogonally
// connected group of shaded cells (any shape, at least one cell); shaded
// groups in different cages may never touch orthogonally across a border,
// and any two cages that share a border must have different shaded-cell
// counts. Digits inside a cage may repeat (no cage all-different). Where a
// cage shows one or two totals, the first is the sum of digits in its
// shaded cells and the second (if present) the sum of digits in its
// unshaded cells; every "X" total, wherever it appears, is the same
// solver-found value.

// Cage cells and totals transcribed from the drawn dashed cages; '' means
// no total is drawn for that cage.
const cageData = [
  { total: '23/30', cells: ['R1C4', 'R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1', 'R4C1', 'R4C2'] },
  { total: '6', cells: ['R1C5'] },
  { total: 'X', cells: ['R1C6', 'R2C6', 'R3C6', 'R4C6'] },
  { total: '17', cells: ['R2C4', 'R3C4', 'R3C5', 'R2C5'] },
  { total: '7/7', cells: ['R2C2', 'R3C2', 'R3C3', 'R2C3'] },
  { total: '17', cells: ['R4C3', 'R5C3', 'R5C4', 'R4C4'] },
  { total: '39/41', cells: ['R5C2', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R8C3', 'R7C3', 'R9C4', 'R9C5', 'R9C6', 'R8C6', 'R8C5', 'R7C5', 'R7C6', 'R8C7', 'R9C7'] },
  { total: '21', cells: ['R9C8', 'R9C9', 'R8C9', 'R7C9', 'R6C9', 'R6C8'] },
  { total: '', cells: ['R7C7', 'R7C8', 'R8C8'] },
  { total: 'X/X', cells: ['R6C3', 'R6C4', 'R7C4', 'R8C4'] },
  { total: 'X', cells: ['R6C2', 'R7C2', 'R8C2'] },
  { total: 'X', cells: ['R4C5', 'R5C5', 'R6C5'] },
  { total: '15/11', cells: ['R5C6', 'R6C6', 'R6C7', 'R5C7'] },
  { total: '10/X', cells: ['R4C8', 'R5C8', 'R5C9', 'R4C9', 'R3C9'] },
  { total: '8', cells: ['R4C7', 'R3C7', 'R2C7', 'R1C7', 'R1C8', 'R2C8', 'R3C8', 'R2C9', 'R1C9'] },
];

const shape = new Shape('9x9', 16);
const graph = cellGraph(shape);
const gridCells = graph.cells();

// Real grid cells hold ordinary digits 1-9; values 10-16 are reserved for
// the shading overlay below.
const digitDomain = graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9));

// Shading overlay: a cell's value is its own cage's index (1-15, "shaded")
// or UNSHADED (16). A cell's cage is fixed geometry, so this one layer both
// records shading and, via the disjoint per-cage value sets below, keeps
// each cage's connected shaded component separate from every other cage's.
const UNSHADED = 16;
const shade = graph.makeOverlay('VS');
const shadeVar = shade.toVar('shading: cage index (1-15) if shaded, 16 if unshaded');

const cellCage = {};
cageData.forEach((cage, i) => cage.cells.forEach(cell => { cellCage[cell] = i; }));

// Each cage cell may only be UNSHADED or its own cage's index. The domain
// differs per cage, so this is a plain per-cell Given rather than a
// Replicate (Replicate broadcasts one shifted template from the graph's own
// origin cell -- it does not fit a domain that varies cage by cage).
const shadingDomain = gridCells.map(
  cell => new Given(shade.at(cell), UNSHADED, cellCage[cell] + 1));

// "Shade a single group of orthogonally connected cells in each dashed
// cage": one single-valued ConnectedValues constraint per cage index, all
// on the shared overlay (a single constraint given an array of value-arrays
// does not keep the sets disjoint through serialization -- one instance per
// value is required). ConnectedValues' non-empty-region requirement also
// gives "each cage must contain at least one shaded cell" for free.
const cageConnectivity = cageData.map((_, i) => new ConnectedValues('VS', i + 1));

// A second, 2-valued overlay mirrors `shade` as a plain shaded/unshaded
// flag, coupled 1:1 to it below. The NFAs further down (no cross-cage
// adjacency, shaded-count comparison, cage sums) only ever need this
// boolean, not which specific cage a cell belongs to.
const SHADED = 1;
const UNSHADED_FLAG = 2;
const shaded = graph.makeOverlay('VF');
const shadedVar = shaded.toVar('shaded (1) / unshaded (2) flag, mirrors VS');
const flagDomainConstraint = shaded.makeReplicate(
  new Given(shaded.cells()[0], SHADED, UNSHADED_FLAG));
const flagCouplingKey = Pair.fnToKey(
  (cageVal, flag) => (cageVal === UNSHADED) === (flag === UNSHADED_FLAG), shape);
const flagCoupling = gridCells.map(
  cell => new Pair(flagCouplingKey, 'shading/flag coupling', shade.at(cell), shaded.at(cell)));

// Cross-cage adjacency, derived from the cage cell lists rather than
// hand-enumerated: every orthogonal grid edge whose two cells belong to
// different cages, plus the set of cage-index pairs that border at all.
const crossCageEdges = [];
const adjacentCagePairs = new Map(); // "i_j" -> [i, j]
for (const cell of gridCells) {
  const cageIndex = cellCage[cell];
  for (const [dR, dC] of [[0, 1], [1, 0]]) {
    const other = graph.step(cell, dR, dC);
    if (!other) continue;
    const otherCage = cellCage[other];
    if (otherCage === cageIndex) continue;
    crossCageEdges.push([cell, other]);
    const lo = Math.min(cageIndex, otherCage);
    const hi = Math.max(cageIndex, otherCage);
    adjacentCagePairs.set(`${lo}_${hi}`, [lo, hi]);
  }
}

// "Shaded groups may not share a dashed border": every cage boundary is
// dashed, so no cross-cage edge may have both cells shaded.
const noCrossShadeKey = Pair.fnToKey(
  (a, b) => !(a === SHADED && b === SHADED), shape);
const noCrossShadeAdjacency = crossCageEdges.map(
  ([a, b]) => new Pair(noCrossShadeKey, 'no cross-cage shaded adjacency',
    shaded.at(a), shaded.at(b)));

// "Two cages which share a border cannot contain the same number of
// shaded cells": one NFA per bordering cage pair, reading cage A's cells
// then cage B's as a single concatenated list (a `pos` counter, clamped at
// sizeA, tells the transition which cage it is currently in -- multi-segment
// NFAs are unavailable here since their SEGMENT_BREAK symbol would need a
// 17th value and the alphabet is capped at 16), keeping a running
// (countA so far - countB so far); accepts only when that is non-zero once
// both cages have been read.
const countDiffSpec = (sizeA, sizeB) => NFA.encodeSpec({
  startState: { pos: 0, diff: 0 },
  transition: (state, value) => {
    const inA = state.pos < sizeA;
    const step = value === SHADED ? 1 : 0;
    const diff = inA ? state.diff + step : state.diff - step;
    return { pos: Math.min(state.pos + 1, sizeA + sizeB), diff };
  },
  accept: (state) => state.diff !== 0,
  maxDepth: sizeA + sizeB,
}, shape);
const shadedCountDiffers = [...adjacentCagePairs.values()].map(
  ([i, j]) => new NFA(
    countDiffSpec(cageData[i].cells.length, cageData[j].cells.length),
    'shaded-count-differs',
    [...shaded.at(cageData[i].cells), ...shaded.at(cageData[j].cells)]));

// Interleave a cage's shaded-flag and digit cells for the sum machines
// below: [flag1, digit1, flag2, digit2, ...].
const interleave = (cage) => cage.cells.flatMap(cell => [shaded.at(cell), cell]);

// Reads one cage's interleaved (flag, digit) stream and accepts when the
// digits in cells matching `mode` ('shaded' or 'unshaded') sum to `target`.
// Clamped at target+1 so the state stays bounded regardless of cage size.
const fixedSumSpec = (mode, target) => NFA.encodeSpec({
  startState: { phase: 'flag', sum: 0 },
  transition: (state, value) => {
    if (state.phase === 'flag') {
      const included = mode === 'shaded' ? value === SHADED : value === UNSHADED_FLAG;
      return { phase: 'digit', sum: state.sum, included };
    }
    const sum = state.included ? Math.min(state.sum + value, target + 1) : state.sum;
    return { phase: 'flag', sum };
  },
  accept: (state) => state.phase === 'flag' && state.sum === target,
}, shape);

// Reads two cages' interleaved (flag, digit) streams concatenated into one
// list (segment A's `sizeA` cells, then segment B's) and accepts when side
// A's `modeA` digit-sum equals side B's `modeB` digit-sum. Used to chain
// every "X" appearance to the same value without needing a widened aux Var
// (max 16 values) to hold the sum itself. As with countDiffSpec above, a
// clamped cell-position counter (not a multi-segment break) marks the
// segment boundary.
const linkedSumSpec = (modeA, modeB, sizeA, sizeB) => NFA.encodeSpec({
  startState: { pos: 0, phase: 'flag', diff: 0 },
  transition: (state, value) => {
    const side = state.pos < sizeA ? 'A' : 'B';
    const mode = side === 'A' ? modeA : modeB;
    if (state.phase === 'flag') {
      const included = mode === 'shaded' ? value === SHADED : value === UNSHADED_FLAG;
      return { pos: state.pos, phase: 'digit', diff: state.diff, included };
    }
    const sign = side === 'A' ? 1 : -1;
    const diff = state.included ? state.diff + sign * value : state.diff;
    return { pos: Math.min(state.pos + 1, sizeA + sizeB), phase: 'flag', diff };
  },
  accept: (state) => state.phase === 'flag' && state.diff === 0,
  maxDepth: 2 * (sizeA + sizeB),
}, shape);

// Fixed numeric totals (transcribed above): [cage index, mode, target].
// Cage 1 is a single cell, so ConnectedValues' non-empty requirement
// already forces it shaded; its "shaded sum = 6" is just that cell's
// digit, given directly below rather than through a 2-cell NFA.
const fixedTotals = [
  [0, 'shaded', 23], [0, 'unshaded', 30],
  [3, 'shaded', 17],
  [4, 'shaded', 7], [4, 'unshaded', 7],
  [5, 'shaded', 17],
  [6, 'shaded', 39], [6, 'unshaded', 41],
  [7, 'shaded', 21],
  [12, 'shaded', 15], [12, 'unshaded', 11],
  [13, 'shaded', 10],
  [14, 'shaded', 8],
];
const fixedSumConstraints = [
  new Given(cageData[1].cells[0], 6),
  ...fixedTotals.map(([i, mode, target]) =>
    new NFA(fixedSumSpec(mode, target), `cage ${i} ${mode} sum = ${target}`,
      interleave(cageData[i]))),
];

// "X" appearances, chained pairwise equal (transitively all equal):
// cage2.shaded = cage9.shaded = cage9.unshaded = cage10.shaded
//   = cage11.shaded = cage13.unshaded.
const xChain = [
  [[2, 'shaded'], [9, 'shaded']],
  [[9, 'shaded'], [9, 'unshaded']],
  [[9, 'unshaded'], [10, 'shaded']],
  [[10, 'shaded'], [11, 'shaded']],
  [[11, 'shaded'], [13, 'unshaded']],
];
const xLinkConstraints = xChain.map(([[i, modeA], [j, modeB]]) =>
  new NFA(
    linkedSumSpec(modeA, modeB, cageData[i].cells.length, cageData[j].cells.length),
    `cage ${i} ${modeA} = cage ${j} ${modeB} (shared X)`,
    [...interleave(cageData[i]), ...interleave(cageData[j])]));

return [
  shape,
  digitDomain,
  shadeVar,
  ...shadingDomain,
  ...cageConnectivity,
  shadedVar,
  flagDomainConstraint,
  ...flagCoupling,
  ...noCrossShadeAdjacency,
  ...shadedCountDiffers,
  ...fixedSumConstraints,
  ...xLinkConstraints,
];
