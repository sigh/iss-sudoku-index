// Title: March 22, 2022: Treasure Hunt
// Author: clover!
// Video: https://www.youtube.com/watch?v=Mg2cA4x92qg
// Source: https://tinyurl.com/3nknmtkz

// Normal sudoku rules. A digit v in a pink cell means exactly v of its (up
// to 8) king-move neighbours hold digits strictly greater than v; edge/
// interior pink cells have 5/8 actual neighbours respectively, and the
// count runs only over neighbours that exist on the board.
//
// Each pink cell is one NFA reading [cell, ...kingNeighbours(cell)]: the
// first symbol sets `target` (the pink cell's own value); each further
// symbol adds 1 to a clamped running `count` when it exceeds `target`; the
// machine accepts iff the final count equals `target`. Neighbour order
// doesn't matter to the rule -- only the final count does -- so this is one
// machine per pink cell, not one per direction.

const graph = cellGraph('9x9');

// Provenance: the ten pink-shaded cells drawn on the grid.
const PINK_CELLS = [
  'R1C2', 'R1C4', 'R1C6', 'R1C8',
  'R2C1', 'R2C9',
  'R5C3', 'R5C7',
  'R7C2', 'R7C8',
];

const pinkGreaterThanCount = (cell) => {
  const neighbours = graph.kingNeighbours(cell);
  const spec = NFA.encodeSpec({
    startState: { target: null, count: 0 },
    transition: ({ target, count }, value) => {
      if (target === null) return { target: value, count: 0 };
      const hit = value > target ? 1 : 0;
      // Clamp: target + 1 is a sink meaning "already too many".
      return { target, count: Math.min(count + hit, target + 1) };
    },
    accept: ({ target, count }) => target !== null && count === target,
    maxDepth: neighbours.length + 1,
  }, 9);
  return new NFA(spec, `Pink${cell}`, cell, ...neighbours);
};

return [
  new Shape('9x9'),

  // Givens, as drawn on the grid.
  new Given('R1C4', 2),
  new Given('R1C6', 5),
  new Given('R3C2', 8),
  new Given('R3C5', 6),
  new Given('R3C8', 2),
  new Given('R4C3', 3),
  new Given('R4C7', 8),
  new Given('R5C2', 9),
  new Given('R5C4', 3),
  new Given('R5C6', 6),
  new Given('R5C8', 7),
  new Given('R6C3', 4),
  new Given('R6C7', 9),
  new Given('R7C2', 4),
  new Given('R7C5', 3),
  new Given('R7C8', 5),
  new Given('R9C4', 6),
  new Given('R9C6', 7),

  ...PINK_CELLS.map(pinkGreaterThanCount),
];
