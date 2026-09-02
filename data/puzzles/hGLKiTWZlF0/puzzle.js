// Title: Modular Region Sum Lines
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=hGLKiTWZlF0
// Source: https://sudokupad.app/4ev7ufnh17

// Rules encoded here:
//   Normal Sudoku rules apply.
//   Six lines are drawn, one per circle colour, each running from one circle of
//   its colour to the other and stepping orthogonally from cell to cell.
//   No line visits a cell twice and no two lines share a cell.
//   Every line is both a Region Sum Line (box borders cut it into segments of
//   equal sum, a re-entered box giving a fresh segment) and a Modular line
//   (each three consecutive cells hold one of {1,4,7}, one of {2,5,8}, one of
//   {3,6,9}); digits do not repeat on a line.
// Nothing is omitted. "May not intersect" is read as "no shared cell": a line
// running orthogonally alongside itself crosses nothing and stays legal.

const shape = new Shape('9x9');
const graph = cellGraph(shape);

// Endpoints of the six lines, from the twelve drawn circles: the two circles of
// each colour, which also carry that colour's letter.
const circlePairs = [
  ['R1C7', 'R2C6'],  // A, grey
  ['R2C1', 'R5C1'],  // B, green
  ['R3C2', 'R4C4'],  // C, red
  ['R3C5', 'R6C3'],  // D, blue
  ['R4C6', 'R8C8'],  // E, orange
  ['R8C5', 'R9C8'],  // F, pink
];

// The two given digits printed in the grid.
const givens = [
  new Given('R3C7', 8),
  new Given('R7C2', 5),
];

// Which line a cell belongs to: NO_LINE, or NO_LINE + 1 + the line's index.
// One value per cell, so a cell can lie on at most one line, which is the
// no-intersection rule between lines.
const NO_LINE = 1;
const lines = graph.makeOverlay('VL');

// Digits do not repeat on a line and there are nine digits, so no line reaches a
// tenth cell. With both endpoints drawn, that bound leaves each colour a small
// finite set of routes, listed here in full; the encoding then asserts the line
// rules on whichever route the solver picks.
const MAX_LINE_CELLS = 9;

function candidateRoutes(start, end) {
  const routes = [];
  const extend = (route, visited) => {
    const last = route[route.length - 1];
    if (last === end) {
      routes.push(route);
      return;
    }
    if (route.length === MAX_LINE_CELLS) return;
    for (const next of graph.neighbours(last)) {
      if (visited.has(next)) continue;
      extend([...route, next], new Set([...visited, next]));
    }
  };
  extend([start], new Set([start]));
  return routes;
}

const routesByLine = circlePairs.map(([start, end]) => candidateRoutes(start, end));

// A cell may only be labelled with a line that has some route through it.
const labelDomains = graph.cells().map(cell => new Given(
  lines.at(cell),
  NO_LINE,
  ...routesByLine.flatMap(
    (routes, i) => routes.some(route => route.includes(cell))
      ? [NO_LINE + 1 + i] : [])));

// One disjunction per line, over that line's routes. A branch labels its own
// route's cells and, via ContainExact, caps the label's total count at the
// route's length, so no cell off the chosen route carries the label; the label
// domains above then leave every remaining cell at NO_LINE.
const lineChoices = routesByLine.map((routes, i) => {
  const value = NO_LINE + 1 + i;
  const reachable = lines.at(graph.cells().filter(
    cell => routes.some(route => route.includes(cell))));
  return new Or(routes.map(route => new And([
    ...lines.at(route).map(cell => new Given(cell, value)),
    new ContainExact(Array(route.length).fill(value).join('_'), ...reachable),
    new AllDifferent(...route),
    new Modular(3, ...route),
    new RegionSumLine(...route),
  ])));
});

return [
  shape,
  lines.toVar('line'),
  ...givens,
  ...labelDomains,
  ...lineChoices,
];
