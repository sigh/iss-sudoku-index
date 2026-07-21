// Title: Zodiac Recap: Cluster Of Galaxies
// Author: Dorlir?
// Video: https://www.youtube.com/watch?v=q32NxasOR3Y
// Source: https://sudokupad.app/1ligffuh12

// Normal 6x6 Sudoku rules apply. The six icon digits are all different.
// An icon containing N belongs to an N-cell galaxy: an orthogonally connected,
// 180-degree rotationally symmetric set. Galaxies neither overlap nor touch
// orthogonally. Each galaxy is a renban set.

const shape = new Shape('6x6', 7);
const graph = cellGraph(shape);
const cells = graph.cells();
const NONE = 7;

const icons = [
  'R2C2',
  'R3C3',
  'R3C5',
  'R4C2',
  'R4C4',
  'R6C2',
];

// VG holds a galaxy label (1-6, matching the icon order above), or 7 for a
// cell outside every galaxy. The widened value range exists only for this
// seventh state; playable cells are restricted back to digits 1-6 below.
const galaxy = graph.makeOverlay('VG');

function cellKey(cell) {
  const { row, col } = parseCellId(cell);
  return row * 10 + col;
}

function shapeKey(shapeCells) {
  return [...shapeCells].sort((a, b) => cellKey(a) - cellKey(b)).join(',');
}

function centrallySymmetric(shapeCells) {
  const points = shapeCells.map(parseCellId);
  const rows = points.map(point => point.row);
  const cols = points.map(point => point.col);
  const rowSum = Math.min(...rows) + Math.max(...rows);
  const colSum = Math.min(...cols) + Math.max(...cols);
  const members = new Set(shapeCells);
  return points.every(({ row, col }) =>
    members.has(makeCellId(rowSum - row, colSum - col)));
}

// Enumerate connected cell sets from the icon outwards. Sizes never exceed 6,
// so this finite layout disjunction directly represents the shape rule.
function galaxyShapes(icon, size) {
  const found = new Map();
  const seen = new Set();

  function visit(shapeCells) {
    const key = shapeKey(shapeCells);
    if (seen.has(key)) return;
    seen.add(key);

    if (shapeCells.length === size) {
      if (centrallySymmetric(shapeCells)) found.set(key, [...shapeCells]);
      return;
    }

    const members = new Set(shapeCells);
    const frontier = new Set(shapeCells.flatMap(cell => graph.neighbours(cell)));
    for (const next of frontier) {
      if (!members.has(next)) visit([...shapeCells, next]);
    }
  }

  visit([icon]);
  return [...found.values()];
}

function galaxyRule(icon, label) {
  const bySize = [];
  for (let size = 1; size <= 6; ++size) {
    const layouts = galaxyShapes(icon, size).map(shapeCells => new And([
      ...shapeCells.map(cell => new Given(galaxy.at(cell), label)),
      ...(size === 1 ? [] : [new Renban(...shapeCells)]),
    ]));

    bySize.push(new And([
      new Given(icon, size),
      new ContainExact(Array(size).fill(label).join('_'), ...galaxy.cells()),
      new Or(layouts),
    ]));
  }
  return new Or(bySize);
}

const noTouchKey = Pair.fnToKey(
  (a, b) => a === NONE || b === NONE || a === b,
  7,
);

return [
  shape,
  graph.makeReplicate(new Given(cells[0], 1, 2, 3, 4, 5, 6)),
  galaxy.toVar('galaxy membership'),
  new AllDifferent(...icons),
  ...icons.map((icon, index) => galaxyRule(icon, index + 1)),
  ...cells.flatMap(a => graph.neighbours(a)
    .filter(b => cellKey(a) < cellKey(b))
    .map(b => new Pair(
      noTouchKey,
      'different galaxies do not touch',
      galaxy.at(a),
      galaxy.at(b),
    ))),
];
