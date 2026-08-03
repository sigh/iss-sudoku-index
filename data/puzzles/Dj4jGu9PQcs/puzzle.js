// Title: There's Sum-thing In The Shadows
// Author: sujoyku and ChinStrap
// Video: https://www.youtube.com/watch?v=Dj4jGu9PQcs
// Source: https://sudokupad.app/fhfgpia0vy

// Rules encoded, in full:
//   Normal sudoku, no givens.
//   Yin Yang: shade some cells so that all shaded cells are orthogonally
//     connected, all unshaded cells are orthogonally connected, and every 2x2
//     contains both shades.
//   Yin Yang Split Lines: Yin Yang borders split each line into 2 or more
//     segments with the same sum; two cells adjacent along a line are in the
//     same segment exactly when they have the same shading; digits may not
//     repeat within a segment; every line contains both shades.
//   Segment Counters: a digit in a circle on a line is how many segments that
//     line has. The circles carry no printed number and the grid has no
//     givens, so the digit in the circle is the circled cell's own digit.
//
// Nothing is omitted. The shading is state this encoding introduces, and every
// rule above is invariant under swapping the two shades, so R1C1 is pinned
// unshaded to name one representative of that swap.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

const UNSHADED = 1;
const SHADED = 2;

// Every shade Var holds one of the two shades.
const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], UNSHADED, SHADED));

// No 2x2 block is all one shade: one NFA over the top-left block's four shade
// cells, replicated to every block origin. The machine collects the four
// values and accepts only once it has seen four that are not all equal.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(v => v === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(gridCells.filter(cell => graph.block(cell, 2, 2))));

// The drawn lines. Provenance: the source's line strokes, each drawn twice
// (a white outline layer under a lightsteelblue layer over the same edges).
// `cells` is the drawn walk order and `edges` indexes the cell pairs that are
// adjacent along the line.
//
// Lines `a` and `b` are branched: three edges meeting at R1C3 / at R1C6. The
// source draws each as two strokes, but the two colour layers split the R1C6
// junction differently (white: R1C5-R1C6-R1C7 + R1C6-R2C6; blue:
// R1C7-R1C6-R2C6 + R1C6-R1C5), so the stroke boundary is not a clue boundary;
// and every way of splitting three edges that share a cell leaves a two-cell
// line whose cells share a row or column, which the rules make unsatisfiable
// ("every line contains shaded and unshaded cells" plus equal segment sums
// would force those two cells to the same digit). The rules' own definition of
// a segment is local -- "adjacent along the line ... same segment if and only
// if they have the same shading" -- so it applies unchanged to a branch.
function pathLine(cells, circle) {
  return {
    cells,
    edges: cells.slice(1).map((_, i) => [i, i + 1]),
    circle: circle || null,
  };
}
const lines = [
  // a: arms R1C2 / R1C4 / R2C3 meeting at R1C3.
  {
    cells: ['R1C3', 'R1C2', 'R1C4', 'R2C3'],
    edges: [[0, 1], [0, 2], [0, 3]],
    circle: 'R1C2',
  },
  // b: arms R1C7 / R1C5 / R2C6 meeting at R1C6.
  {
    cells: ['R1C6', 'R1C7', 'R1C5', 'R2C6'],
    edges: [[0, 1], [0, 2], [0, 3]],
    circle: 'R1C7',
  },
  pathLine(['R1C9', 'R2C8', 'R3C7', 'R4C7', 'R4C8', 'R3C8']),
  pathLine(['R5C8', 'R6C9', 'R7C9', 'R8C8']),
  pathLine(['R8C7', 'R7C7', 'R6C7', 'R5C7', 'R6C8']),
  pathLine(['R3C1', 'R3C2', 'R4C2', 'R5C3']),
  pathLine(['R2C4', 'R3C4', 'R4C3', 'R4C4', 'R5C4']),
  pathLine(['R9C8', 'R9C7', 'R9C6', 'R9C5', 'R8C5', 'R8C4', 'R9C4'], 'R9C7'),
  pathLine(
    ['R4C6', 'R4C5', 'R5C5', 'R6C5', 'R7C4', 'R7C3', 'R7C2', 'R8C2', 'R9C1'],
    'R4C5'),
];

// One line's whole rule, as an Or over which of its edges the shading breaks.
// A break set is any non-empty subset of the line's edges: non-empty because a
// connected line holding both shades must break somewhere, and conversely any
// break makes both shades present. Each branch pins that exact shading pattern
// (broken edge => the two shade cells differ, unbroken => they match), so the
// branches are mutually exclusive and cover every legal shading; the segments
// are then the fixed groups of cells that pattern leaves joined, and the rest
// of the rule is ordinary EqualSum / AllDifferent over them.
function splitLineConstraint({ cells, edges, circle }) {
  const branches = [];
  for (let mask = 1; mask < (1 << edges.length); mask++) {
    const parent = cells.map((_, i) => i);
    const find = i => (parent[i] === i ? i : (parent[i] = find(parent[i])));
    const shadePattern = edges.map(([a, b], k) => {
      const pair = shade.at([cells[a], cells[b]]);
      if ((mask >> k) & 1) return new AllDifferent(...pair);
      parent[find(a)] = find(b);
      // Two singleton sets holding the same value.
      return new SameValues(2, ...pair);
    });

    const groups = new Map();
    cells.forEach((cell, i) => {
      const root = find(i);
      if (!groups.has(root)) groups.set(root, []);
      groups.get(root).push(cell);
    });
    const segments = [...groups.values()];

    branches.push(new And([
      ...shadePattern,
      new EqualSum(...segments),
      ...segments.filter(s => s.length > 1).map(s => new AllDifferent(...s)),
      ...(circle ? [new Given(circle, segments.length)] : []),
    ]));
  }
  return new Or(branches);
}

return [
  new Shape('9x9'),
  shade.toVar('yin-yang shade'),
  shadeDomain,
  noMono2x2,
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  new Given(shade.at('R1C1'), UNSHADED),
  ...lines.map(splitLineConstraint),
];
