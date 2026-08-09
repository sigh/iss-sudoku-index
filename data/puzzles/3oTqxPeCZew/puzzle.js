// Title: The Four Colour Theorem
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=3oTqxPeCZew
// Source: https://app.crackingthecryptic.com/sudoku/6j3GrPqpDb

// Rules encoded:
// - Row/column all-different come from Shape('9x9'). The nine 9-cell regions
//   are unknown and must be discovered by the solver: ChaosConstruction gives
//   each cell a CC region-label var (1-9) and natively requires each label's
//   cells to be orthogonally connected, size 9, and hold every digit once, so
//   no separate region constraint is added. NoBoxes drops the fixed 3x3 boxes.
// - Region colouring: a colour overlay (VC, restricted to 1-4) is added per
//   cell. For every orthogonally-adjacent cell pair, one NFA requires equal
//   colour iff the pair carries the same CC label. Since ChaosConstruction
//   regions are connected, chaining this local rule along same-label
//   neighbours forces one colour per whole region ("must be coloured in its
//   entirety with a single colour"), while different-label neighbours getting
//   different colours is exactly "no two regions of the same colour may share
//   an edge". Capping VC's Given at {1,2,3,4} enforces "at most four distinct
//   colours".
// - Arrows: "cells containing arrows give the distance to the nearest cell of
//   the same colour in each indicated direction" ("neighbouring cells are a
//   distance 1 from each other"). Each arrow cell's own grid digit is that
//   distance. One NFA per arrow scans [digit, own colour, ray colours...] and
//   accepts iff the first ray colour equal to the origin's colour lands
//   exactly `digit` steps away, with no earlier match.
// - "All possible arrows are given" is a solving-completeness note about the
//   drawn clue set, not an extra grid rule; nothing further to encode for it.

const graph = cellGraph('9x9');
const allCells = graph.cells();

const cc = graph.makeOverlay('CC');
const color = graph.makeOverlay('VC');

// Orthogonally adjacent cell pairs, each counted once (right + down dominoes
// from every cell, dropped where they run off the grid).
const adjacentPairs = allCells
  .flatMap(cell => [graph.block(cell, 1, 2), graph.block(cell, 2, 1)])
  .filter(pair => pair?.every(c => c !== null));

// NFA over [ccA, colourA, ccB, colourB] for one adjacent pair: accepts iff
// (ccA === ccB) === (colourA === colourB) -- same region requires same
// colour, different regions require different colours.
const regionColorSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition(state, value) {
    if (state.phase === 0) return { phase: 1, ccA: value };
    if (state.phase === 1) return { phase: 2, ccA: state.ccA, colorA: value };
    if (state.phase === 2) return { phase: 3, ccA: state.ccA, colorA: state.colorA, ccB: value };
    if (state.phase === 3) {
      const sameRegion = state.ccA === state.ccB;
      const sameColor = state.colorA === value;
      return sameRegion === sameColor ? { phase: 4 } : undefined;
    }
  },
  accept: (state) => state.phase === 4,
}, 9);

const regionColorLinks = adjacentPairs.map(([a, b]) => new NFA(
  regionColorSpec, 'RegionColor',
  cc.at(a), color.at(a), cc.at(b), color.at(b),
));

// Arrow definitions [originCell, dRow, dCol]: each drawn arrow is a short
// stub anchored at one cell's centre, pointing half a cell towards one of
// that cell's four edges -- i.e. it names an origin cell and a direction.
const ARROWS = [
  ['R1C5', 1, 0], ['R1C6', 0, -1], ['R1C6', 0, 1], ['R2C8', 0, -1],
  ['R2C4', 0, 1], ['R2C3', 1, 0], ['R2C2', 1, 0], ['R3C2', -1, 0],
  ['R3C4', 1, 0], ['R3C8', -1, 0], ['R3C8', 0, 1], ['R4C2', 0, 1],
  ['R4C3', 0, -1], ['R4C3', 1, 0], ['R4C6', 0, 1], ['R4C7', -1, 0],
  ['R4C7', 1, 0], ['R5C2', -1, 0], ['R5C8', 0, -1], ['R6C5', 1, 0],
  ['R6C5', 0, 1], ['R7C1', 0, 1], ['R7C1', 1, 0], ['R8C3', 0, -1],
  ['R8C3', -1, 0], ['R8C3', 0, 1], ['R8C5', -1, 0], ['R9C4', -1, 0],
  ['R9C9', 0, -1], ['R7C7', -1, 0], ['R7C9', 0, -1],
];

// NFA over [digit, ownColour, ray colours...]: accepts iff the first ray
// colour matching ownColour lands exactly at position `digit`, with no
// earlier match.
const arrowSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition(state, value) {
    if (state.phase === 0) return { phase: 1, target: value };
    if (state.phase === 1) return { phase: 2, target: state.target, own: value, pos: 0 };
    if (state.phase === 2) {
      const pos = state.pos + 1;
      if (pos > state.target) return undefined;
      const isMatch = value === state.own;
      if (pos === state.target) return isMatch ? { phase: 3 } : undefined;
      return isMatch ? undefined : { phase: 2, target: state.target, own: state.own, pos };
    }
    if (state.phase === 3) return { phase: 3 };
  },
  accept: (state) => state.phase === 3,
}, 9);

const arrowConstraints = ARROWS.map(([origin, dRow, dCol]) => {
  const ray = graph.ray(origin, dRow, dCol).slice(1);
  return new NFA(arrowSpec, 'ArrowDist', origin, color.at(origin), ...color.at(ray));
});

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  color.toVar('Colour'),
  // Restrict every colour cell to {1,2,3,4} ("at most four distinct colours").
  color.makeReplicate(new Given(color.at(allCells[0]), 1, 2, 3, 4)),
  ...regionColorLinks,
  ...arrowConstraints,
];
