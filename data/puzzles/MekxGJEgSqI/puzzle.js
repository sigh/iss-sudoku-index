// Title: Foggy Segmented Yin Yang Snake
// Author: apetersen
// Video: https://www.youtube.com/watch?v=MekxGJEgSqI
// Source: https://sudokupad.app/zm4m78m9xh

// Rules encoded:
// - Normal sudoku (engine baseline). Fog is solving UI only.
// - Snake / non-snake shading is the YinYang YY layer: SNAKE and NON_SNAKE
//   each form one orthogonally connected area, and no 2x2 is monochrome.
// - The snake is one cell wide, does not branch and does not touch itself:
//   every snake cell has at most two orthogonal snake neighbours.
// - White dots: consecutive digits, and one snake plus one non-snake cell.
// - Box borders cut the snake into segments of equal sum.

const SNAKE = 1;
const NON_SNAKE = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('YY');

// A connected snake whose cells all have at most two snake neighbours is a
// path or a cycle; a cycle either leaves non-snake cells on both sides of it
// or fills a 2x2, so the yin-yang rules already exclude it and no explicit
// end-cell count is needed.
const noBranch = graph.cells().flatMap(cell => {
  const ns = graph.neighbours(cell);
  const triples = [];
  for (let i = 0; i < ns.length; i++) {
    for (let j = i + 1; j < ns.length; j++) {
      for (let k = j + 1; k < ns.length; k++) {
        triples.push([ns[i], ns[j], ns[k]]);
      }
    }
  }
  // A snake cell and three of its neighbours cannot all be snake.
  return triples.map(t => new ContainAtLeast(
    String(NON_SNAKE), ...shade.at([cell, ...t])));
});

// White dots, from the drawn difference markers (no value = consecutive).
const dots = [
  ['R1C1', 'R2C1'],
  ['R7C2', 'R7C1'],
  ['R8C2', 'R7C2'],
  ['R8C2', 'R9C2'],
  ['R5C3', 'R6C3'],
  ['R4C3', 'R4C4'],
  ['R5C4', 'R4C4'],
  ['R8C7', 'R7C7'],
  ['R5C7', 'R5C6'],
  ['R4C8', 'R4C9'],
  ['R7C4', 'R7C5'],
  ['R8C5', 'R9C5'],
];
const dotRules = dots.flatMap(([a, b]) => [
  new WhiteDot(a, b),
  new AllDifferent(...shade.at([a, b])),
]);

// Segment sums. Because the snake never touches itself, two snake cells in
// one box that are orthogonally adjacent are consecutive along the snake, so
// the segments inside a box are exactly the orthogonally connected
// components of that box's snake cells (a box the snake revisits holds
// several). For every cell set C in a box that could be such a component,
// if C is all snake and its other in-box neighbours are all non-snake, C
// sums to the common target.
//
// Only sets forming a path (connected, acyclic, at most two neighbours per
// cell within C) are enumerated: a component of a non-branching snake is a
// piece of the snake, hence a path.
//
// The common target S is held in two Var cells [hi, lo] as
// S = 9*(hi - 1) + lo. A path in a 3x3 box has at most 7 cells, whose
// distinct digits total at most 42, so hi <= 5.
const target = new Var('S', 'segment sum', 2);
const [hi, lo] = target.cells();

function pathSubsets(boxCells) {
  const n = boxCells.length;
  const inBox = new Set(boxCells);
  const adj = boxCells.map(c =>
    graph.neighbours(c).filter(x => inBox.has(x)).map(x => boxCells.indexOf(x)));
  const result = [];
  for (let mask = 1; mask < (1 << n); mask++) {
    const members = [];
    for (let i = 0; i < n; i++) if (mask & (1 << i)) members.push(i);
    let edges = 0;
    let maxDeg = 0;
    for (const i of members) {
      const d = adj[i].filter(j => mask & (1 << j)).length;
      edges += d;
      maxDeg = Math.max(maxDeg, d);
    }
    edges /= 2;
    if (maxDeg > 2 || edges !== members.length - 1) continue;
    // Connectivity: flood fill within the subset.
    const seen = new Set([members[0]]);
    const stack = [members[0]];
    while (stack.length) {
      const i = stack.pop();
      for (const j of adj[i]) {
        if ((mask & (1 << j)) && !seen.has(j)) { seen.add(j); stack.push(j); }
      }
    }
    if (seen.size !== members.length) continue;
    const border = [...new Set(members.flatMap(i => adj[i]))]
      .filter(j => !(mask & (1 << j)));
    result.push({
      cells: members.map(i => boxCells[i]),
      border: border.map(j => boxCells[j]),
    });
  }
  return result;
}

const segmentSums = graph.boxes().flatMap(box =>
  pathSubsets(box).map(({ cells, border }) => new Or([
    ...shade.at(cells).map(c => new Given(c, NON_SNAKE)),
    ...shade.at(border).map(c => new Given(c, SNAKE)),
    new Sum(-9, ...cells, [hi, -9], [lo, -1]),
  ])));

return [
  new Shape('9x9'),
  new YinYang(),
  target,
  new Given(hi, 1, 2, 3, 4, 5),
  ...noBranch,
  ...dotRules,
  ...segmentSums,
];
