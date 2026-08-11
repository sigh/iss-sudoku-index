// Title: Killer Shikoku
// Author: the_cogito
// Video: https://www.youtube.com/watch?v=Ht-NDH9dM2g
// Source: https://app.crackingthecryptic.com/sudoku/HtjrbnP8mt

// Rules encoded here:
//  - The grid contains no 5s. Instead, every row, column and box holds all
//    eight remaining digits (1-4, 6-9) with exactly one of them repeated once
//    (filling the ninth cell that a plain 1-9 permutation would give the 5).
//    This replaces the default Sudoku row/column/box AllDifferent groups, so
//    the grid uses the Raw type and every row/column/box rule is stated here
//    explicitly.
//  - Shikoku: the grid is cut into rectangles of orthogonally connected
//    cells; every cell lies in exactly one rectangle; each rectangle holds
//    exactly one circle; the digit finally placed in that circle is the
//    rectangle's cell count; rectangles do not overlap; digits do not repeat
//    inside a rectangle. Unlike a normal-Sudoku Shikaku, row/column/box
//    membership no longer guarantees distinctness on its own (see above), so
//    every rectangle of more than one cell gets its own AllDifferent.
// Nothing is omitted.

const shape = new Shape('9x9', '1-9', 'Raw');
const graph = cellGraph(shape);

// The 12 given digits (all non-5), as drawn in the grid.
const givens = [
  ['R2C4', 6], ['R2C5', 7], ['R2C6', 8],
  ['R4C3', 1],
  ['R5C2', 3], ['R5C7', 1],
  ['R6C4', 4], ['R6C6', 6],
  ['R8C1', 2], ['R8C5', 6], ['R8C6', 7], ['R8C7', 8],
];

// The 19 drawn white circles, one per Shikoku region.
const circles = [
  'R1C1', 'R1C2', 'R1C3', 'R3C1', 'R3C2', 'R3C3',
  'R7C1', 'R7C2', 'R7C3', 'R9C1', 'R9C2', 'R9C3',
  'R9C8', 'R6C8', 'R5C9', 'R4C7', 'R3C7', 'R3C9', 'R2C9',
];
const circleSet = new Set(circles);

// --- "No 5s; a single repeated digit per row/column/box" -----------------
//
// 9 cells drawn from the 8-symbol alphabet {1,2,3,4,6,7,8,9} must, by
// pigeonhole, have at least one repeat. The NFA below additionally forbids a
// third occurrence of any symbol and a second symbol reaching a repeat, so
// with exactly 9 cells scanned the only way to avoid getting stuck is for
// all 8 symbols to appear (7 once, 1 twice): that is exactly "no 5s, one
// repeated digit". State is (bitmask of symbols seen at least once, whether
// the single allowed repeat has been used) = 256 * 2 = 512 states.
const bitFor = (value) => (value < 5 ? value - 1 : value - 2); // 1-4,6-9 -> 0-7
const singleRepeatSpec = NFA.encodeSpec({
  startState: { seen: 0, doubled: false },
  transition: ({ seen, doubled }, value) => {
    if (value === 5) return undefined; // defensive; 5 is excluded by Given below
    const mask = 1 << bitFor(value);
    if (seen & mask) {
      // Repeat of `value`: allowed only as *the* single repeat for this unit.
      if (doubled) return undefined;
      return { seen, doubled: true };
    }
    return { seen: seen | mask, doubled };
  },
  accept: ({ seen, doubled }) => seen === 0xFF && doubled,
}, 9);

const units = [
  ...graph.rows(),
  ...graph.columns(),
  // Raw grids carry no implicit box regions (graph.boxes() is empty), so the
  // standard 3x3 tiling is built explicitly here.
  ...[['R1C1', 3, 3], ['R1C4', 3, 3], ['R1C7', 3, 3],
      ['R4C1', 3, 3], ['R4C4', 3, 3], ['R4C7', 3, 3],
      ['R7C1', 3, 3], ['R7C4', 3, 3], ['R7C7', 3, 3]]
    .map(([topLeft, h, w]) => graph.block(topLeft, h, w)),
];

// --- Shikoku: candidate rectangles per circle -----------------------------
//
// Every rectangle that could be `circle`'s region: it lies in the grid,
// covers `circle`, holds no second circle, and has at most 9 cells (its
// area is a circled digit) with an area that is never 5 (no 5s anywhere).
const candidateRects = (circle) => {
  const { row, col } = parseCellId(circle);
  const rects = [];
  for (let height = 1; height <= 9; height++) {
    for (let width = 1; height * width <= 9; width++) {
      const area = height * width;
      if (area === 5) continue;
      for (let top = Math.max(1, row - height + 1); top <= row; top++) {
        for (let left = Math.max(1, col - width + 1); left <= col; left++) {
          const cells = graph.block(makeCellId(top, left), height, width);
          if (cells === null) continue;
          if (cells.filter(cell => circleSet.has(cell)).length !== 1) continue;
          rects.push({ height, width, cells, area });
        }
      }
    }
  }
  return rects;
};

const rects = circles.map(candidateRects);

// Region labels: each cell carries the label of the region covering it, so
// two regions can never claim the same cell (a cell in both would need two
// labels at once). Two circles need distinct labels only if some candidate
// rectangle of one can meet some candidate rectangle of the other;
// otherwise their regions are already disjoint by geometry and sharing a
// label loses nothing. Greedily colour that conflict graph (densest circle
// first); the grid's own 1-9 range is the label alphabet.
const rectSets = rects.map(rs => rs.map(({ cells }) => new Set(cells)));
const canMeet = (i, j) => rectSets[i].some(
  a => rectSets[j].some(b => [...b].some(cell => a.has(cell))));
const conflicts = circles.map(
  (_, i) => circles.map((_, j) => i !== j && canMeet(i, j)));
const degrees = conflicts.map(row => row.filter(Boolean).length);
const labels = new Array(circles.length);
for (const i of circles.map((_, i) => i).sort((a, b) => degrees[b] - degrees[a])) {
  const used = new Set(conflicts[i].map((meets, j) => meets ? labels[j] : null));
  let label = 1;
  while (used.has(label)) label++;
  labels[i] = label;
}
const numLabels = Math.max(...labels);
if (numLabels > 9) throw new Error(`need ${numLabels} region labels, only 9 fit`);

const region = graph.makeOverlay('VR');

return [
  shape,

  // The given non-5 digits; every other cell is free within 1-9. "No 5s
  // anywhere" needs no separate constraint here: every cell sits in one row,
  // one column and one box, and the NFA below rejects any unit scan that
  // reads a 5, so a 5 anywhere is already unsatisfiable.
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...units.map(cells => new NFA(singleRepeatSpec, 'no-5s single repeat', ...cells)),

  region.toVar('Region'),

  // Pick one rectangle per circle: it fixes the circled digit to the
  // rectangle's cell count, stamps its label on every covered cell, and (for
  // any rectangle of more than one cell -- row/column/box no longer imply
  // distinctness here) keeps its digits distinct.
  ...circles.map((circle, i) => new Or(
    rects[i].map(({ cells, area }) => new And([
      new Given(circle, area),
      ...cells.map(cell => new Given(region.at(cell), labels[i])),
      ...(cells.length > 1 ? [new AllDifferent(...cells)] : []),
    ]))
  )),
  // The rectangles are pairwise disjoint by the labels above, so requiring
  // the 19 circled digits to total 81 is what makes them cover every cell.
  new Sum(81, ...circles),
];
