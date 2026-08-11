// Title: Fort Sushi
// Author: PjotrV
// Video: https://www.youtube.com/watch?v=Gf6cWjgMQ2Q
// Source: https://app.crackingthecryptic.com/sudoku/TDnjrGD6GQ

// Normal sudoku rules apply. Fortress: shaded (grey) cells must be greater
// than every orthogonally adjacent non-fortress cell. Fortress-to-fortress
// adjacencies are left unconstrained since the rule only mentions
// non-fortress neighbours. Thermometers: digits strictly increase from the
// bulb along the line.

// Shaded fortress cells, transcribed from the underlay shading (two central
// columns, rows 3-8).
const FORTRESS = [
  'R3C4', 'R4C4', 'R5C4', 'R6C4', 'R7C4', 'R8C4',
  'R3C6', 'R4C6', 'R5C6', 'R6C6', 'R7C6', 'R8C6',
];
const fortressSet = new Set(FORTRESS);
const graph = cellGraph('9x9');

// Build one GreaterThan per fortress cell, listing the fortress cell first
// followed by its non-fortress orthogonal neighbours: GreaterThan pairs each
// cell with every later-listed grid-adjacent cell as (earlier > later), so
// listing the fortress cell first enforces fortress > each neighbour.
const fortressConstraints = FORTRESS.map(cellId => {
  const origin = parseCellId(cellId);
  const directionRank = id => {
    const position = parseCellId(id);
    if (position.row < origin.row) return 0;
    if (position.row > origin.row) return 1;
    if (position.col < origin.col) return 2;
    return 3;
  };
  const neighbours = graph.neighbours(cellId)
    .filter(id => !fortressSet.has(id))
    .sort((a, b) => directionRank(a) - directionRank(b));
  return new GreaterThan(cellId, ...neighbours);
});

return [
  new Shape('9x9'),
  new Given('R4C9', 6),

  ...fortressConstraints,

  // Thermometers: bulb cell first, then arm cells in path order, from lines[].
  new Thermo('R3C9', 'R2C9', 'R1C9', 'R1C8', 'R2C8'),
  new Thermo('R2C6', 'R2C5', 'R2C4'),
  new Thermo('R3C1', 'R2C1', 'R1C1', 'R1C2', 'R2C2'),
  new Thermo('R5C1', 'R5C2', 'R5C3'),
  new Thermo('R5C7', 'R5C8', 'R5C9'),
  new Thermo('R8C7', 'R7C7', 'R7C8', 'R7C9'),
  new Thermo('R7C1', 'R7C2', 'R7C3', 'R8C3'),
];
