// Title: Segue Ursa
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=RReBoAtHyTQ
// Source: https://app.crackingthecryptic.com/twacfrsxbk

// Normal sudoku rules apply. Each numbered white dot is either a Kropki dot
// (the endpoint digits differ by its number) or an N-cell, orthogonally
// connected 180-degree-symmetric galaxy containing 1 through N. Galaxies are
// disjoint from each other and from Kropki endpoints. Where a galaxy spans
// multiple 3x3 boxes, its digit sums in those occupied box portions are equal.
const shape = new Shape('9x9', 13);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const galaxy = graph.makeOverlay('VG');
const NONE = 13;

// White edge dots, transcribed from the paired circle and number overlays.
const dots = [
  { cells: ['R8C5', 'R9C5'], size: 8 },
  { cells: ['R7C3', 'R8C3'], size: 8 },
  { cells: ['R5C3', 'R6C3'], size: 8 },
  { cells: ['R2C3', 'R3C3'], size: 4 },
  { cells: ['R3C1', 'R3C2'], size: 8 },
  { cells: ['R1C3', 'R1C4'], size: 4 },
  { cells: ['R7C8', 'R8C8'], size: 8 },
  { cells: ['R4C9', 'R5C9'], size: 4 },
  { cells: ['R3C7', 'R3C8'], size: 4 },
  { cells: ['R4C5', 'R5C5'], size: 8 },
  { cells: ['R6C6', 'R7C6'], size: 4 },
  { cells: ['R2C7', 'R2C8'], size: 8 },
];

const cellKey = cell => {
  const { row, col } = parseCellId(cell);
  return row * 10 + col;
};
const shapeKey = cells => [...cells].sort((a, b) => cellKey(a) - cellKey(b)).join(',');

// Starting with the two cells straddled by a dot, grow reflection-closed sets.
// The finite N=4/8 alternatives are the possible connected galaxy shapes.
function galaxyShapes(dot) {
  const centres = dot.cells.map(parseCellId);
  const centreRow = (centres[0].row + centres[1].row) / 2;
  const centreCol = (centres[0].col + centres[1].col) / 2;
  const reflect = cell => {
    const { row, col } = parseCellId(cell);
    const reflectedRow = 2 * centreRow - row;
    const reflectedCol = 2 * centreCol - col;
    return Number.isInteger(reflectedRow) && Number.isInteger(reflectedCol) &&
      reflectedRow >= 1 && reflectedRow <= 9 && reflectedCol >= 1 && reflectedCol <= 9
      ? makeCellId(reflectedRow, reflectedCol) : null;
  };
  const found = new Map();
  const seen = new Set();
  const visit = cells => {
    const key = shapeKey(cells);
    if (seen.has(key) || cells.length > dot.size) return;
    seen.add(key);
    if (cells.length === dot.size) {
      if (graph.connected(cells)) found.set(key, cells);
      return;
    }
    const members = new Set(cells);
    const frontier = new Set(cells.flatMap(cell => graph.neighbours(cell)));
    for (const next of frontier) {
      if (members.has(next)) continue;
      const partner = reflect(next);
      if (partner === null) continue;
      visit([...members, next, partner]);
    }
  };
  visit(dot.cells);
  return [...found.values()];
}

const digitDomain = graph.makeReplicate(
  new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

function galaxyRule(dot, label) {
  const shapes = galaxyShapes(dot);
  const kropkiAbsent = galaxy.makeReplicate(new Given(
    galaxy.cells()[0], ...Array.from({ length: 13 }, (_, i) => i + 1).filter(v => v !== label)));
  const kropki = new And([
    kropkiAbsent,
    new Pair(Pair.fnToKey((a, b) => Math.abs(a - b) === dot.size, shape),
      `Kropki difference ${dot.size}`, ...dot.cells),
    ...dot.cells.map(cell => new Given(galaxy.at(cell), NONE)),
  ]);
  const requiredDigits = Array.from({ length: dot.size }, (_, i) => i + 1).join('_');
  const galaxies = shapes.map(cells => {
    const boxParts = [
      graph.box(1), graph.box(2), graph.box(3), graph.box(4), graph.box(5),
      graph.box(6), graph.box(7), graph.box(8), graph.box(9),
    ].map(box => box.filter(cell => cells.includes(cell))).filter(part => part.length);
    return new And([
      new ContainExact(Array(dot.size).fill(label).join('_'), ...galaxy.cells()),
      ...cells.map(cell => new Given(galaxy.at(cell), label)),
      new ContainExact(requiredDigits, ...cells),
      ...(boxParts.length < 2 ? [] : [new EqualSum(...boxParts)]),
    ]);
  });
  return new Or([kropki, ...galaxies]);
}

return [
  shape,
  digitDomain,
  galaxy.toVar('galaxy membership'),
  ...dots.map((dot, index) => galaxyRule(dot, index + 1)),
];
