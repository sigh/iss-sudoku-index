// Title: Nurikabe Sight Lines
// Author: Blobz
// Video: https://www.youtube.com/watch?v=LSSStVjLfvc
// Source: https://sudokupad.app/blobz/nurikabe-sight-lines

// Normal sudoku rules apply (default row/column/box all-different).
//
// The grid is divided into islands (orthogonally connected cell groups) and
// a single waterway (the complement). Every island contains exactly one
// circled cell whose given digit is the island's size; every caged cell is
// a waterway cell whose (uncovered) digit equals the count of waterway
// cells visible from it in the four orthogonal directions, including
// itself, where island cells block vision; the waterway forms no 2x2 area.
//
// A binary Var overlay VW marks each grid cell ISLAND or WATERWAY. Encoded
// below: circle cells fixed ISLAND, cage cells fixed WATERWAY, waterway
// single-connectivity, no-2x2-waterway, and the sight-line digit link at
// each of the 18 cage cells. Omitted: that the non-cage/circle cells
// partition into components of the exact sizes given by the circles, each
// containing only its own circle -- ISS's ConnectedValues only proves a
// *single* named region connected, not per-component sizes over an unknown
// multi-region partition, and there is no other primitive for it.

const ISLAND = 1;
const WATERWAY = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const shade = graph.makeOverlay('VW');

// Circled cells: given digit is the island size (source: the drawn circle
// markers, matched 1:1 to 10 of the 11 givens).
const circles = [
  ['R1C5', 4], ['R1C9', 2], ['R2C2', 1], ['R3C4', 3], ['R4C2', 3],
  ['R4C9', 4], ['R6C6', 4], ['R6C9', 5], ['R8C1', 2], ['R9C5', 5],
];

// Single-cell cages: drawn waterway cells (each is a single-cell, no-total
// cage). None carry a given digit.
const cageCells = [
  'R9C8', 'R1C1', 'R6C2', 'R5C5', 'R2C6', 'R2C9', 'R5C7', 'R8C2', 'R2C8',
  'R5C8', 'R6C1', 'R9C9', 'R7C9', 'R8C6', 'R3C3', 'R4C4', 'R3C1', 'R9C3',
];

const givens = [
  ...circles.map(([cell, value]) => new Given(cell, value)),
  new Given('R8C7', 8), // plain given; not a circle or a cage cell.
];

// Every VW cell is ISLAND or WATERWAY.
const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], ISLAND, WATERWAY));

const fixedShades = [
  ...circles.map(([cell]) => new Given(shade.at(cell), ISLAND)),
  ...cageCells.map(cell => new Given(shade.at(cell), WATERWAY)),
];

// "Surrounded by a waterway -- a single orthogonally connected group of
// cells": the WATERWAY-valued VW cells form exactly one region. Islands are
// *not* given the same treatment: there are 10 of them, and ConnectedValues
// only proves a single region, so applying it to ISLAND would be an unsound
// over-constraint.
const waterwayConnected = new ConnectedValues('VW', WATERWAY);

// "The waterway cannot form any 2x2 area": no 2x2 block of VW cells is all
// WATERWAY. One NFA on the top-left block, replicated to every 2x2 origin
// (not just box-aligned ones).
const noWaterway2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    const allWaterway = next.every(v => v === WATERWAY);
    return allWaterway ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noWaterway2x2 = shade.makeReplicate(
  new NFA(noWaterway2x2Machine, 'no-waterway-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

// "The digit in a caged cell indicates how many waterway cells are seen
// orthogonally from that position, including itself (island cells block
// vision)": one NFA per caged cell. Segment 1 is the grid cell itself (its
// digit is the target count, and the cell counts itself, so count starts at
// 1); segments 2-5 are the up-to-four VW rays outward from it, each of
// which stops counting (but keeps scanning, to reach the shared
// SEGMENT_BREAK) as soon as it hits an ISLAND cell or the grid edge. State:
// `target` is the origin's digit (null until read), `count` the running
// visible total (clamped at target+1, an unreachable sink once already too
// high), `blocked` whether the current ray has already hit an island.
const sightSpec = NFA.encodeSpec({
  startState: { target: null, count: 0, blocked: false },
  transition: ({ target, count, blocked }, value) => {
    if (target === null) return { target: value, count: 1, blocked: false };
    if (value === SEGMENT_BREAK) return { target, count, blocked: false };
    if (blocked) return { target, count, blocked: true };
    if (value !== WATERWAY) return { target, count, blocked: true };
    return { target, count: Math.min(count + 1, target + 1), blocked: false };
  },
  accept: ({ target, count }) => target !== null && count === target,
  maxDepth: 40,
}, geometry.numValues, { multiSegment: true });

const sightLines = cageCells.map(cell => {
  const origin = shade.at(cell);
  const rays = [[0, 1], [0, -1], [1, 0], [-1, 0]]
    .map(([dRow, dCol]) => shade.ray(origin, dRow, dCol).slice(1))
    .filter(ray => ray.length > 0);
  return new NFA(sightSpec, 'sight', [cell], ...rays);
});

return [
  new Shape('9x9'),
  ...givens,
  shade.toVar('waterway'),
  shadeDomain,
  ...fixedShades,
  waterwayConnected,
  noWaterway2x2,
  ...sightLines,
];
