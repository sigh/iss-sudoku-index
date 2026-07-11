// Title: Paper Snowflake
// Author: Kainapple
// Video: https://www.youtube.com/watch?v=Ux6LYrFtjFc
// Source: https://sudokupad.app/xaw5c7zbsi

// Normal sudoku, no givens. Standard arrows. Shade some cells so that 1, 2,
// and 3 are always shaded, 7, 8, and 9 are never shaded, and the shading is
// symmetrical under reflection in row 5 and in the positive diagonal (/).
// Shading is encoded as a Var overlay tied to digits and symmetry orbits.

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');

const shadedValueKey = Pair.fnToKey((digit, state) =>
  (digit <= 3 && state == 1) ||
  (digit >= 7 && state == 2) ||
  (digit >= 4 && digit <= 6 && (state == 1 || state == 2)), 9);

function reflectRow5(cell) {
  const { row, col } = parseCellId(cell);
  return makeCellId(10 - row, col);
}

function reflectPositiveDiagonal(cell) {
  const { row, col } = parseCellId(cell);
  return makeCellId(10 - col, 10 - row);
}

function symmetryOrbits() {
  const seen = new Set();
  const orbits = [];
  for (const cell of graph.cells()) {
    if (seen.has(cell)) continue;
    const todo = [cell];
    const orbit = new Set();
    while (todo.length) {
      const next = todo.pop();
      if (orbit.has(next)) continue;
      orbit.add(next);
      todo.push(reflectRow5(next), reflectPositiveDiagonal(next));
    }
    for (const orbitCell of orbit) seen.add(orbitCell);
    orbits.push([...orbit]);
  }
  return orbits;
}

const shadingConstraints = [
  shade.toVar('Shade'),
  ...graph.cells().map(cell =>
    new Pair(shadedValueKey, 'shade', cell, shade.at(cell))),
  ...symmetryOrbits()
    .map(orbit => orbit.map(cell => shade.at(cell)))
    .filter(orbit => orbit.length > 1)
    .map(orbit => new SameValues(orbit.length, ...orbit)),
];

return [
  new Shape('9x9'),
  new Arrow('R4C7', 'R5C6', 'R6C5'),
  new Arrow('R6C2', 'R5C2', 'R4C2', 'R3C3', 'R4C4'),
  new Arrow('R6C3', 'R5C3', 'R5C4'),
  new Arrow('R8C5', 'R7C6', 'R7C7', 'R6C6'),
  new Arrow('R2C4', 'R1C3', 'R1C2'),
  ...shadingConstraints,
];
