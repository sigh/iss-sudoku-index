// Title: The Lost Killer Islands
// Author: Patrick Junke
// Video: https://www.youtube.com/watch?v=oW7lNJCC0mw
// Source: https://sudokupad.app/gssntzkary

// Normal sudoku rules apply. Every cell is sea or land; no 2x2 block is all
// sea or all land. All sea cells are orthogonally connected (one region).
// Arrows mark sea "dead ends": a sea cell whose only other adjacent sea cell
// is the one the arrow points to. On an X, the two cells are the same kind
// (both sea or both land) and their digits sum to 10; on a red dot, the two
// digits sum to 12 with no kind restriction.
//
// Omitted here: the "land cells form four-different-digit, sum-14 islands
// that don't touch diagonally" rule. This requires the solver to discover
// multiple components of unknown identity/size (land split into many
// disjoint 4-cell components), which ISS has no primitive for. Only the
// local sea/land facts and the global sea-connectivity rule below are
// encoded.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shading = graph.makeOverlay('VS');
const shadingCell = cell => shading.at(cell);

const SEA = 1;
const LAND = 2;

// --- No 2x2 block is entirely sea or entirely land. ---
const noMonoMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, value) => {
    if (block === null) return { block: null };
    const next = [...block, value];
    if (next.length < 4) return { block: next };
    const allSame = next.every(v => v === next[0]);
    return allSame ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
// Every 2x2 block is a uniform-offset shift of the top-left block, so encode
// it once and replicate it over every anchor cell whose block stays on-grid.
const monoBlockOrigin = shadingCell('R1C1');
const monoBlockTemplate = new NFA(noMonoMachine, 'no-mono-2x2',
  shadingCell('R1C1'), shadingCell('R1C2'), shadingCell('R2C1'), shadingCell('R2C2'));
const monoBlockAnchors = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 8; c++) {
    monoBlockAnchors.push(shadingCell(makeCellId(r, c)));
  }
}

// --- X marks: same kind, digits sum to 10. ---
const xMachine = NFA.encodeSpec({
  startState: { phase: 'shade1' },
  transition: (state, value) => {
    if (state.phase === 'shade1') return { phase: 'digit1', shade1: value };
    if (state.phase === 'digit1') return { phase: 'shade2', shade1: state.shade1, digit1: value };
    if (state.phase === 'shade2') {
      return value === state.shade1
        ? { phase: 'digit2', digit1: state.digit1 }
        : undefined;
    }
    // phase === 'digit2'
    return state.digit1 + value === 10 ? { phase: 'done' } : undefined;
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const xPairs = [['R7C3', 'R7C4'], ['R1C5', 'R2C5']];

// --- Red dots: digits sum to 12, no kind restriction. ---
const dotPairs = [
  ['R3C6', 'R3C7'],
  ['R8C2', 'R8C3'],
  ['R6C5', 'R7C5'],
  ['R7C2', 'R7C3'],
  ['R9C7', 'R9C8'],
  ['R7C7', 'R8C7'],
  ['R8C5', 'R9C5'],
];

// --- Every cell is sea or land. --- One Given template stamped over the
// whole grid via Replicate instead of 81 identical Givens.
const seaOrLandCells = Array.from(graph.cells()).map(cell => shadingCell(cell));
const eachCellSeaOrLand = shading.makeReplicate(
  new Given(seaOrLandCells[0], SEA, LAND), seaOrLandCells);

// --- Arrows: fixed sea dead ends (positions confirmed from source geometry). ---
// R1C9 is sea; its only other adjacent sea cell is R1C8 (points left).
const arrowConstraints = [
  new Given(shadingCell('R1C9'), SEA),
  new Given(shadingCell('R1C8'), SEA),
  new Given(shadingCell('R2C9'), LAND),
  // R9C4 is sea; its only other adjacent sea cell is R8C4 (points up).
  new Given(shadingCell('R9C4'), SEA),
  new Given(shadingCell('R8C4'), SEA),
  new Given(shadingCell('R9C3'), LAND),
  new Given(shadingCell('R9C5'), LAND),
];

// --- X marks ---
const xMarks = xPairs.map(([a, b]) =>
  new NFA(xMachine, 'x-mark', shadingCell(a), a, shadingCell(b), b));

// --- Red dots ---
const redDots = dotPairs.map(([a, b]) =>
  new Sum(12, a, b));

return [
  new Shape('9x9'),
  shading.toVar('shading'),
  eachCellSeaOrLand,
  shading.makeReplicate(monoBlockTemplate, monoBlockAnchors),
  // --- All sea cells are one orthogonally-connected region. ---
  // (Land is NOT given ConnectedValues: land forms several disjoint islands,
  // so forcing it into one region would be an unsound over-constraint.)
  new ConnectedValues('VS', SEA),
  ...arrowConstraints,
  ...xMarks,
  ...redDots,
];
