// Title: Cage Total Dots
// Author: Unknown
// Video: https://www.youtube.com/watch?v=K9UAfbmx-lA
// Source: https://cracking-the-cryptic.web.app/sudoku/t2GN7MLRDB

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// Outlined regions are cages: digits do not repeat within a cage, and no
// cage carries a printed total; not every cell belongs to a cage. A cage's
// "cage total" is the sum of its digits. Between two cages sharing a cell
// edge, a white dot marks a total difference of 1 and a black dot marks a
// total ratio of 2; the stated negative constraint ("all the possible dots
// have been given") means every such adjacent cage pair carrying no drawn
// dot has neither relation.

const graph = cellGraph('9x9');

// Cage cell lists (1-indexed R#C#), transcribed from the drawn cage
// outlines (index order preserved for the comments below).
const CAGES = [
  ['R1C1', 'R1C2'],                                             // 0
  ['R2C1', 'R2C2'],                                             // 1
  ['R3C1'],                                                     // 2
  ['R3C2'],                                                     // 3
  ['R4C2', 'R4C1'],                                             // 4
  ['R4C3', 'R5C3'],                                             // 5
  ['R5C2'],                                                     // 6
  ['R5C1', 'R6C1'],                                             // 7
  ['R7C1', 'R8C1', 'R8C2', 'R7C2'],                              // 8
  ['R8C3', 'R9C3', 'R9C2', 'R9C1'],                              // 9
  ['R7C3', 'R6C3'],                                             // 10
  ['R7C4', 'R8C4', 'R9C4', 'R9C5', 'R8C5', 'R7C5'],              // 11
  ['R8C7', 'R9C7', 'R8C8'],                                     // 12
  ['R7C7', 'R7C8'],                                             // 13
  ['R9C8', 'R9C9'],                                             // 14
  ['R7C9', 'R6C9', 'R6C8'],                                     // 15
  ['R5C9', 'R5C8', 'R5C7', 'R5C6', 'R4C6'],                      // 16
  ['R4C4', 'R4C5', 'R5C5'],                                     // 17
  ['R4C7', 'R4C8'],                                             // 18
  ['R3C7', 'R3C8'],                                             // 19
  ['R2C8', 'R2C9'],                                             // 20
  ['R1C8', 'R1C9'],                                             // 21
  ['R2C7', 'R1C7'],                                             // 22
  ['R1C6', 'R1C5'],                                             // 23
  ['R2C6', 'R2C5'],                                             // 24
  ['R1C4', 'R2C4'],                                             // 25
  ['R3C4', 'R3C5'],                                             // 26
];

// Dot cell-edges (1-indexed), transcribed from the drawn rounded edge
// marks (fill #ffffff = white "difference of 1", fill #000000 = black
// "ratio of 2"). Each sits on the boundary between two cages; which two is
// derived below from CAGES, not hand-paired.
const DOTS = [
  ['white', 'R1C1', 'R2C1'],
  ['white', 'R3C1', 'R3C2'],
  ['white', 'R1C8', 'R2C8'],
  ['white', 'R2C8', 'R3C8'],
  ['white', 'R5C8', 'R6C8'],
  ['white', 'R5C3', 'R6C3'],
  ['white', 'R4C2', 'R5C2'],
  ['white', 'R6C1', 'R7C1'],
  ['white', 'R8C3', 'R8C4'],
  ['white', 'R7C7', 'R8C7'],
  ['black', 'R1C4', 'R1C5'],
  ['black', 'R2C4', 'R2C5'],
  ['black', 'R3C7', 'R4C7'],
  ['black', 'R4C2', 'R4C3'],
  ['black', 'R4C3', 'R4C4'],
  ['black', 'R7C3', 'R8C3'],
  ['black', 'R8C2', 'R8C3'],
];

// Cage index for every cell that belongs to one; cells absent from CAGES
// belong to no cage and carry no cage-total relation.
const cageOf = new Map();
CAGES.forEach((cells, i) => cells.forEach(cell => cageOf.set(cell, i)));

// Distinctness within each multi-cell cage ("digits do not repeat"); a
// one-cell cage adds no local constraint.
const cageDistinct = CAGES
  .filter(cells => cells.length > 1)
  .map(cells => new AllDifferent(...cells));

// Every pair of cages sharing a cell edge anywhere in the grid, derived from
// the grid rather than hand-enumerated (a pair sharing more than one edge,
// e.g. cages 0/1, is recorded once).
const adjacentPairs = new Map(); // "i,j" (i<j) -> [i, j]
for (const cell of graph.cells()) {
  const ca = cageOf.get(cell);
  if (ca === undefined) continue;
  for (const neighbour of graph.neighbours(cell)) {
    const cb = cageOf.get(neighbour);
    if (cb === undefined || cb === ca) continue;
    const key = ca < cb ? `${ca},${cb}` : `${cb},${ca}`;
    if (!adjacentPairs.has(key)) {
      adjacentPairs.set(key, ca < cb ? [ca, cb] : [cb, ca]);
    }
  }
}

// Dotted pairs, keyed the same way, with their relation colour.
const dotColorOf = new Map(); // key -> 'white' | 'black'
for (const [color, a, b] of DOTS) {
  const ca = cageOf.get(a), cb = cageOf.get(b);
  if (ca === undefined || cb === undefined || ca === cb) {
    throw new Error(`dot ${a}-${b} is not on a boundary between two cages`);
  }
  const key = ca < cb ? `${ca},${cb}` : `${cb},${ca}`;
  dotColorOf.set(key, color);
}

// One multi-segment NFA per cage-adjacent pair: reads cage A's cells, a
// SEGMENT_BREAK, then cage B's cells, carrying each side's running total in
// state (`seg` tracks which side is being read; `sumA` freezes once segment
// B starts), and checks the wanted relation on the final totals.
//
// `encodeSpec` compiles the automaton over sequences of unbounded length --
// it has no way to know a segment stops after this pair's own cage sizes --
// so each running total is clamped one past its true reachable max (9 times
// the cage's own cell count) or the state space explores forever and blows
// the compile-time state cap. Real cage cells never push a total that high,
// so the clamp is a no-op against actual play; it only bounds the abstract
// exploration.
function totalRelationNFA(name, cellsA, cellsB, holds) {
  const capA = 9 * cellsA.length + 1;
  const capB = 9 * cellsB.length + 1;
  const spec = NFA.encodeSpec({
    startState: { seg: 1, sumA: 0, sumB: 0 },
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) return { seg: 2, sumA: state.sumA, sumB: 0 };
      return state.seg === 1
        ? { seg: 1, sumA: Math.min(state.sumA + value, capA), sumB: 0 }
        : { seg: 2, sumA: state.sumA, sumB: Math.min(state.sumB + value, capB) };
    },
    accept: ({ sumA, sumB }) => holds(sumA, sumB),
  }, 9, { multiSegment: true });
  return new NFA(spec, name, cellsA, cellsB);
}

const diffOne = (a, b) => Math.abs(a - b) === 1;
const ratioTwo = (a, b) => a === 2 * b || b === 2 * a;

const cageRelations = [...adjacentPairs.entries()].map(([key, [ca, cb]]) => {
  const color = dotColorOf.get(key);
  const cellsA = CAGES[ca], cellsB = CAGES[cb];
  if (color === 'white') {
    return totalRelationNFA(`cage-dot-white-${key}`, cellsA, cellsB, diffOne);
  }
  if (color === 'black') {
    return totalRelationNFA(`cage-dot-black-${key}`, cellsA, cellsB, ratioTwo);
  }
  // No drawn dot on this cage-adjacent pair: the stated negative constraint
  // forbids both relations.
  return totalRelationNFA(
    `cage-nodot-${key}`, cellsA, cellsB,
    (a, b) => !diffOne(a, b) && !ratioTwo(a, b));
});

return [
  new Shape('9x9'),
  ...cageDistinct,
  ...cageRelations,
];
