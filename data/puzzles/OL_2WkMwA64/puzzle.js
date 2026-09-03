// Title: Galactic Map
// Author: Blobz
// Video: https://www.youtube.com/watch?v=OL_2WkMwA64
// Source: https://sudokupad.app/blobz/galactic-map

// Normal sudoku rules apply.
//
// Divide the grid into galaxies: orthogonally connected groups of cells with
// 180-degree rotational symmetry about their centres, each centre marked by a
// small dot. Every cell belongs to a galaxy and no two galaxies overlap, so the
// nineteen dots give nineteen galaxies. Digits may not repeat within a galaxy.
//
// A grey dot marks a galaxy of two or more cells whose digits form an unbroken
// consecutive sequence in any order. A white dot marks a galaxy that is either a
// single cell, or one whose digits do not form such a sequence.
//
// Every galaxy of at least two cells marks its smallest digit with a diamond
// icon, and every galaxy of at least six cells marks its largest digit with a
// circle icon. Those are the only diamonds and circles drawn, so a galaxy
// carries a diamond exactly when it holds two or more cells and a circle
// exactly when it holds six or more.
//
// One given digit: R9C1 = 7.

const shape = new Shape('9x9');
const graph = cellGraph(shape);

// Drawn data: the nineteen small dots, by colour. Each dot is listed by the
// cells it is drawn on -- one cell for a dot at a cell centre, two for a dot on
// a shared edge, four for a dot on a shared corner.
const greyDotCells = [
  ['R1C2', 'R1C3'], ['R1C7'], ['R2C8', 'R3C8'], ['R3C6'], ['R3C1'],
  ['R4C2', 'R4C3'], ['R5C5', 'R5C6', 'R6C5', 'R6C6'], ['R6C3'],
  ['R8C3', 'R8C4'],
];
const whiteDotCells = [
  ['R2C2', 'R3C2'], ['R6C1', 'R7C1'], ['R9C1'], ['R9C5'], ['R8C5'], ['R9C8'],
  ['R7C9', 'R8C9'], ['R7C6', 'R7C7'], ['R2C9'], ['R6C8', 'R7C8'],
];
// Drawn data: the fifteen diamond icons and the six circle icons.
const diamondCells = [
  'R1C4', 'R1C6', 'R3C1', 'R3C2', 'R3C8', 'R4C2', 'R4C7', 'R5C3', 'R7C1',
  'R7C6', 'R6C5', 'R8C8', 'R8C9', 'R9C2', 'R9C4',
];
const circleCells = ['R3C5', 'R4C4', 'R5C1', 'R5C7', 'R6C8', 'R9C3'];

const dots = [
  ...greyDotCells.map(cells => ({ cells, grey: true })),
  ...whiteDotCells.map(cells => ({ cells, grey: false })),
];

// Digits do not repeat within a galaxy and there are nine of them.
const MAX_GALAXY_CELLS = 9;

// Membership flag values for the per-galaxy overlays below.
const OUT = 1;
const IN = 2;

// A dot's centre of rotation, in doubled row/column coordinates so that a dot
// on a shared edge or corner still lands on integers.
const dotCentre = (cells) => {
  const pos = cells.map(parseCellId);
  return [
    pos.reduce((a, p) => a + 2 * p.row, 0) / pos.length,
    pos.reduce((a, p) => a + 2 * p.col, 0) / pos.length,
  ];
};

// The 180-degree image of `cell` about `centre`, or null when it is off-grid.
const opposite = ([centreRow, centreCol], cell) => {
  const { row, col } = parseCellId(cell);
  const r = centreRow - row;
  const c = centreCol - col;
  const inGrid = r >= 1 && r <= 9 && c >= 1 && c <= 9;
  return inGrid ? makeCellId(r, c) : null;
};

// Every galaxy contains the cell(s) its own dot is drawn on. A connected
// symmetric group that left them out would have to enclose them, and the
// smallest enclosing ring is 8 cells around a single cell, 10 around a domino
// and 12 around a 2x2 block; 10 and 12 exceed the nine-cell bound, and the
// 8-ring leaves its enclosed cell needing a galaxy centred on the very dot that
// drew the ring. So the dot cells are forced, and by the no-overlap rule no
// galaxy may use a cell another dot is drawn on.
const dotOwnedCells = new Set(dots.flatMap(dot => dot.cells));

const countDrawn = (cells, marks) => cells.filter(c => marks.includes(c)).length;

// The icon rules read as a size test on a candidate shape.
const iconsMatch = (dot, cells) =>
  (!dot.grey || cells.length >= 2)
  && countDrawn(cells, diamondCells) === (cells.length >= 2 ? 1 : 0)
  && countDrawn(cells, circleCells) === (cells.length >= 6 ? 1 : 0);

// Every galaxy this dot could be the centre of: grow the forced dot cells by
// symmetric pairs, keep the connected results within the size bound, and drop
// those whose icons contradict their size.
const galaxyShapes = (dot) => {
  const centre = dotCentre(dot.cells);
  const forced = new Set(dot.cells);
  const pairs = [];
  const seen = new Set();
  for (const cell of graph.cells()) {
    if (seen.has(cell) || forced.has(cell)) continue;
    const other = opposite(centre, cell);
    if (other === null) continue;
    seen.add(cell);
    seen.add(other);
    if (dotOwnedCells.has(cell) || dotOwnedCells.has(other)) continue;
    pairs.push(cell === other ? [cell] : [cell, other]);
  }

  const shapes = [];
  const grow = (next, cells) => {
    if (graph.connected(cells)) shapes.push(cells);
    for (let i = next; i < pairs.length; i++) {
      if (cells.length + pairs[i].length > MAX_GALAXY_CELLS) continue;
      grow(i + 1, cells.concat(pairs[i]));
    }
  };
  grow(0, [...forced]);
  return shapes.filter(cells => iconsMatch(dot, cells));
};

const PREFIXES = 'ABCDEFGHIJKLMNOPQRS';
const galaxies = dots.map((dot, i) => {
  const shapes = galaxyShapes(dot);
  const cells = graph.cells().filter(c => shapes.some(s => s.includes(c)));
  return { dot, shapes, cells, flags: graph.makeOverlay('V' + PREFIXES[i], cells) };
});

// a < b.
const lessThanKey = Pair.fnToKey((a, b) => a < b, 9);
// The two digits are at least `k` apart.
const spreadKey = (k) => Pair.fnToKey((a, b) => Math.abs(a - b) >= k, 9);

const unorderedPairs = (cells) => cells.flatMap(
  (a, i) => cells.slice(i + 1).map(b => [a, b]));

// The digit rules a galaxy of exactly these cells carries. Its icons are
// already known to match its size, so the diamond and circle lookups below
// always find the cell the rules name.
const shapeDigitRules = (dot, cells) => {
  if (cells.length < 2) return [];
  const smallest = cells.find(c => diamondCells.includes(c));
  const largest = cells.find(c => circleCells.includes(c));
  const others = (cell) => cells.filter(c => c !== cell);
  return [
    new AllDifferent(...cells),
    ...(dot.grey ? [new Renban(...cells)] : [
      // Not an unbroken sequence. The digits are distinct, so a set of k of them
      // is consecutive exactly when its range is k - 1; some two of them at
      // least k apart is the negation of that.
      new Or(unorderedPairs(cells).map(([a, b]) => new Pair(
        spreadKey(cells.length), 'spread', a, b))),
    ]),
    ...others(smallest).map(c => new Pair(lessThanKey, 'smallest', smallest, c)),
    ...(largest === undefined ? [] :
      others(largest).map(c => new Pair(lessThanKey, 'largest', c, largest))),
  ];
};

// One galaxy per dot: the cells it holds are one of its candidate shapes, and
// that choice sets every membership flag of its overlay.
const galaxyChoices = galaxies.map(galaxy => new Or(galaxy.shapes.map(cells => {
  const inShape = new Set(cells);
  return new And([
    ...galaxy.cells.map(c => new Given(
      galaxy.flags.at(c), inShape.has(c) ? IN : OUT)),
    ...shapeDigitRules(galaxy.dot, cells),
  ]);
})));

// Every cell is in exactly one galaxy: across the galaxies that could hold it,
// one flag is IN and the rest are OUT.
const galaxyCover = graph.cells().map(cell => {
  const flags = galaxies.filter(g => g.cells.includes(cell)).map(g => g.flags.at(cell));
  return new Sum(flags.length - 1 + IN, ...flags);
});

return [
  shape,
  new Given('R9C1', 7),
  ...galaxies.map((galaxy, i) => galaxy.flags.toVar(`galaxy ${i + 1}`)),
  ...galaxies.flatMap(
    galaxy => galaxy.cells.map(c => new Given(galaxy.flags.at(c), OUT, IN))),
  ...galaxyChoices,
  ...galaxyCover,
];
