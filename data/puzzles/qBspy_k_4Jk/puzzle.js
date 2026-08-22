// Title: Arrow Canal View
// Author: Abed Hawila
// Video: https://www.youtube.com/watch?v=qBspy_k_4Jk
// Source: https://app.crackingthecryptic.com/sudoku/m23L8jF87m

// Normal sudoku rows/columns apply. Ten arrows: their circled cell sums the
// rest of the arrow's path (Arrow). The same ten circled cells double as
// "Canal View" clues: never shaded, each one's digit equals the count of
// shaded cells reachable from it by an unbroken run of shaded cells running
// outward along its own row and column (stopped by the first unshaded cell
// or the grid edge). All shaded cells form one orthogonally-connected region
// (ConnectedValues); no 2x2 block may be entirely shaded. Digits repeat-free
// applies to boxes only among their unshaded cells -- shaded cells are
// dropped from the default box groups via NoBoxes and re-added pairwise.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');

// Every shade Var is either shaded or unshaded.
const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], SHADED, UNSHADED));

// Arrow circle (first cell) sums the remaining path cells.
const arrows = [
  ['R3C4', 'R3C3', 'R2C2', 'R1C2'],
  ['R1C8', 'R1C7', 'R2C6'],
  ['R3C7', 'R4C8', 'R5C9'],
  ['R5C7', 'R4C6', 'R3C5'],
  ['R6C9', 'R7C8'],
  ['R8C7', 'R7C6'],
  ['R9C6', 'R9C7', 'R8C6'],
  ['R8C4', 'R9C3'],
  ['R9C1', 'R8C2', 'R7C2', 'R7C3'],
  ['R5C1', 'R6C2', 'R6C3', 'R5C3'],
];
const arrowConstraints = arrows.map(cells => new Arrow(...cells));
const circleCells = arrows.map(cells => cells[0]);

// Canal View circles can never be shaded.
const circleUnshaded = circleCells.map(
  cell => new Given(shade.at(cell), UNSHADED));

// For a circle cell, the run of shaded cells extending away from it along one
// ray (row-left, row-right, column-up, column-down) always starts at the
// ray's nearest cell -- the circle itself is fixed unshaded, so no extra
// boundary Given is needed at that end. windowsFor(ray) lists, for every
// possible run length L (0..ray.length), the And of Givens that pins the
// first L ray cells shaded and (if the run doesn't reach the far end) the
// next cell unshaded.
function windowsFor(ray) {
  return Array.from(
    { length: ray.length + 1 },
    (_, length) => ({
      length,
      pins: [
        ...ray.slice(0, length).map(cell => new Given(shade.at(cell), SHADED)),
        ...(length < ray.length
          ? [new Given(shade.at(ray[length]), UNSHADED)] : []),
      ],
    }));
}

// The circle's digit is the sum of the four ray run-lengths. Enumerate every
// combination of (up, down, left, right) run lengths whose total is a valid
// digit (1-9) and Or together one And per combination: the digit pinned to
// the total, plus all four rays' pins. Exactly one combination matches the
// true shading, so this is an exact (not merely sound) encoding of the count.
function canalCountConstraint(circleCell) {
  const { row, col } = parseCellId(circleCell);
  const fullRow = graph.row(circleCell);
  const fullCol = graph.column(circleCell);
  const rays = {
    up: fullCol.slice(0, row - 1).reverse(),
    down: fullCol.slice(row),
    left: fullRow.slice(0, col - 1).reverse(),
    right: fullRow.slice(col),
  };
  const windows = Object.fromEntries(
    Object.entries(rays).map(([dir, cells]) => [dir, windowsFor(cells)]));

  const combos = [];
  for (const u of windows.up) {
    for (const d of windows.down) {
      for (const l of windows.left) {
        for (const r of windows.right) {
          const total = u.length + d.length + l.length + r.length;
          if (total >= 1 && total <= 9) {
            combos.push(new And([
              new Given(circleCell, total),
              ...u.pins, ...d.pins, ...l.pins, ...r.pins,
            ]));
          }
        }
      }
    }
  }
  return new Or(combos);
}
const canalCounts = circleCells.map(canalCountConstraint);

// Shaded cells form exactly one non-empty orthogonally-connected region.
const shadedConnectivity = new ConnectedValues('VS', SHADED);

// No 2x2 block may be entirely shaded: at least one of its four cells is
// unshaded, replicated over every block origin.
const blockOrigins = graph.cells().filter(cell => graph.block(cell, 2, 2));
const noAllShaded2x2 = shade.makeReplicate(
  new Or(shade.at(graph.block(graph.cells()[0], 2, 2))
    .map(cell => new Given(cell, UNSHADED))),
  shade.at(blockOrigins));

// Boxes: default box groups are removed (NoBoxes) and replaced pairwise --
// two cells in the same box may only share a digit if at least one of them
// is shaded. Rows and columns keep their default all-different groups.
const notEqualKey = Pair.fnToKey((a, b) => a !== b, graph.gridGeometry().numValues);
const boxUnshadedUniqueness = graph.boxes().flatMap(box => {
  const pairs = [];
  for (let i = 0; i < box.length; i++) {
    for (let j = i + 1; j < box.length; j++) {
      pairs.push(new Or([
        new Given(shade.at(box[i]), SHADED),
        new Given(shade.at(box[j]), SHADED),
        new Pair(notEqualKey, 'unshaded-differ', box[i], box[j]),
      ]));
    }
  }
  return pairs;
});

return [
  new Shape('9x9'),
  new NoBoxes(),
  shade.toVar('shade'),
  shadeDomain,
  ...arrowConstraints,
  ...circleUnshaded,
  ...canalCounts,
  shadedConnectivity,
  noAllShaded2x2,
  ...boxUnshadedUniqueness,
];
