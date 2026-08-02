// Title: Crux
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=KJZlrqKGMb8
// Source: https://app.crackingthecryptic.com/sudoku/r89wh6qj90

// Normal Sudoku. Partition the board into 27 orthogonally connected 15-clumps:
// every clump has distinct digits summing to 15. An arrow's digit counts the
// distinct clumps in its ray, excluding its own cell.
//
// The labels are split across two 9x9 overlays because ISS values stop at 16.
// Code 1 is inactive; codes 2..16 in VA name clumps 1..15, and codes 2..13 in
// VB name clumps 16..27. Each cell has exactly one active overlay code.

const graph = cellGraph('9x9');
const va = graph.makeOverlay('VA');
const vb = graph.makeOverlay('VB');
const gridCells = graph.cells();
const vaCells = va.at(gridCells);
const vbCells = vb.at(gridCells);
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const INACTIVE = 1;

// The 19 drawn arrowheads, transcribed from the black shaft/head primitives.
const ARROWS = [
  ['R1C5', 0, -1], ['R1C5', 1, 0], ['R1C7', 0, 1], ['R2C3', 1, 0],
  ['R3C3', 0, 1], ['R4C3', -1, 0], ['R4C4', 0, 1], ['R5C1', -1, 0],
  ['R5C1', 0, 1], ['R5C7', 0, 1], ['R5C9', 0, -1], ['R5C9', 1, 0],
  ['R7C7', 0, -1], ['R8C5', -1, 0], ['R8C5', 0, 1], ['R9C1', -1, 0],
  ['R9C3', 0, 1], ['R9C5', 0, -1], ['R9C8', -1, 0],
];
const rays = ARROWS.map(([origin, dr, dc]) => graph.ray(origin, dr, dc).slice(1));

// A target label's selected digits are accumulated as a bit set and a sum.
// Rejecting a repeated bit implements the no-repeat condition within a clump.
const clumpNfa = (label) => NFA.encodeSpec({
  startState: { stage: 'label', sum: 0, mask: 0 },
  transition: ({ stage, sum, mask, take }, value) => {
    if (stage === 'label') return { stage: 'digit', sum, mask, take: value === label };
    if (!take) return { stage: 'label', sum, mask };
    const bit = 1 << (value - 1);
    if ((mask & bit) || sum + value > 15) return undefined;
    return { stage: 'label', sum: sum + value, mask: mask | bit };
  },
  accept: ({ stage, sum }) => stage === 'label' && sum === 15,
  maxDepth: 162,
}, 16);

// One flag per (arrow, clump) records whether that clump occurs anywhere in the
// arrow ray. Flag 1 means absent and flag 2 means present. The arrow-count NFA
// then compares its digit with the number of present flags.
const seenNfa = (label) => NFA.encodeSpec({
  startState: { mode: null, found: false },
  transition: ({ mode, found }, value) => {
    if (mode === null) return value === 1 || value === 2 ? { mode: value, found: false } : undefined;
    const nextFound = found || value === label;
    if (mode === 1 && nextFound) return undefined;
    return { mode, found: nextFound };
  },
  accept: ({ mode, found }) => (mode === 1 && !found) || (mode === 2 && found),
  maxDepth: 9,
}, 16);
const arrowCountNfa = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === 2 ? 1 : 0);
    return next <= target ? { target, count: next } : undefined;
  },
  accept: ({ target, count }) => target !== null && count === target,
  maxDepth: 28,
}, 16);

const flags = new Var('F', 'arrow clump visibility', '57x9');
const flagRows = Array.from({ length: 19 }, (_, i) => flags.cells().slice(i * 27, (i + 1) * 27));
const xorKey = Pair.fnToKey((a, b) =>
  (a === INACTIVE) !== (b === INACTIVE) && b <= 13, 16);
const clumpsA = Array.from({ length: 15 }, (_, i) => ({ overlay: va, prefix: 'VA', label: i + 2 }));
const clumpsB = Array.from({ length: 12 }, (_, i) => ({ overlay: vb, prefix: 'VB', label: i + 2 }));
const clumps = [...clumpsA, ...clumpsB];

const clumpConstraints = clumps.flatMap(({ overlay, prefix, label }) => [
  new ConnectedValues(prefix, label),
  new NFA(clumpNfa(label), '15-clump', ...gridCells.flatMap((cell, i) => [overlay.at(cell), cell])),
]);

const visibilityConstraints = ARROWS.flatMap((_, arrowIndex) => clumps.map(({ overlay, label }, clumpIndex) =>
  new NFA(seenNfa(label), 'clump visible in arrow ray', flagRows[arrowIndex][clumpIndex], ...overlay.at(rays[arrowIndex]))
));
const arrowCounts = ARROWS.map(([origin], arrowIndex) =>
  new NFA(arrowCountNfa, 'number of visible clumps', origin,
    ...flagRows[arrowIndex])
);

return [
  new Shape('9x9', 16),
  graph.makeReplicate(new Given('R1C1', ...DIGITS)),
  va.toVar('clump labels A'),
  vb.toVar('clump labels B'),
  flags,
  ...gridCells.map((cell, i) => new Pair(xorKey, 'one clump label per cell', vaCells[i], vbCells[i])),
  ...clumpConstraints,
  ...visibilityConstraints,
  ...arrowCounts,
];
