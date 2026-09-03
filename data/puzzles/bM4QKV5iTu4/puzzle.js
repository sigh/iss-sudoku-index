// Title: Rellik Loop
// Author: blackjackfitz
// Video: https://www.youtube.com/watch?v=bM4QKV5iTu4
// Source: https://sudokupad.app/ka3olc7kq1

// Rules encoded below:
//   Normal sudoku.
//   Killer: digits in a given cage sum to the total in its top left corner.
//   Kropki: a black dot separates digits in a 1:2 ratio, a white dot separates
//     consecutive digits. Undotted edges are unconstrained (the rules do not
//     claim all dots are given).
//   Rellik Loop: draw a single closed loop through cell centres, moving
//     orthogonally, that does not branch, overlap, or touch itself, not even
//     diagonally. Every purple diamond ('rellik') is on the loop. Each discrete
//     set of orthogonally connected loop cells within a single box is a rellik
//     cage whose value is its cell count; no combination of one or more of its
//     digits may sum to that value.
// Nothing is omitted.

const ON = 1;                  // loop-membership values, stored in the Var cells
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// The loop-membership Var cell paired with each grid cell (VL1..VL81, in grid order).
const loop = graph.makeOverlay('VL');

const gridCells = graph.cells();

// Drawn clues, read off the source art.
// Purple diamonds.
const relliks = [
  'R1C1', 'R1C9', 'R2C6', 'R4C4', 'R6C1', 'R6C6', 'R7C2', 'R7C9', 'R9C3'];
// Killer cages: [total, cells], total drawn in the cage's top left cell.
const killerCages = [
  [8, ['R2C1', 'R3C1', 'R3C2']],
  [32, ['R1C1', 'R1C2', 'R2C2', 'R2C3', 'R3C3']],
  [13, ['R8C1', 'R9C1', 'R9C2']],
  [22, ['R1C4', 'R1C5', 'R2C4']],
  [6, ['R4C8', 'R5C8', 'R5C9']],
  [19, ['R7C7', 'R7C8', 'R8C7', 'R8C8']],
];
// Kropki dots, each on the edge between the two listed cells.
const blackDots = [
  ['R5C1', 'R6C1'],
  ['R5C5', 'R5C6'],
  ['R7C4', 'R7C5'],
];
const whiteDots = [
  ['R6C6', 'R7C6'],
];

// --- Loop membership: every cell is on (1) or off (2); the relliks are on. ---
const originCell = loop.cells()[0];
const membership = [
  loop.makeReplicate(new Given(originCell, ON, OFF)),
  ...loop.at(relliks).map(cell => new Given(cell, ON)),
];

// --- Degree 2: each on cell has exactly two on-loop orthogonal neighbours. ---
// Reads the membership of the cell, then of each neighbour. Off cells are free.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, membership) => {
    if (phase === 'start') {
      return membership === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (membership === ON ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === 2,
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'degree',
  ...loop.at([cell, ...graph.neighbours(cell)])));

// --- No diagonal self-touch: forbid a 2x2 whose only on cells are a diagonal. ---
// Reads the four membership cells of a 2x2 block, left-to-right, top-to-bottom.
const noDiagonalTouchMachine = NFA.encodeSpec({
  // `block` accumulates the 2x2's membership flags, and becomes null once the
  // block has passed the check (all further symbols are absorbed).
  startState: { block: [] },
  transition: ({ block }, membership) => {
    if (block === null) return { block: null };
    const next = [...block, membership === ON];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
// One machine per 2x2 block, stamped from the top-left block; cells on the
// bottom/right edge start no block.
const noDiagonalTouches = loop.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'no-touch',
    ...loop.at(graph.block(gridCells[0], 2, 2))),
  loop.at(gridCells.filter(cell => graph.block(cell, 2, 2))));

// --- Rellik cages: the loop's runs within each box. ---
// A rellik cage is a maximal orthogonally-connected run of loop cells inside one
// box, and its value is the number of cells in it. The loop is not drawn, so each
// box carries one conditional per candidate run C: either C is not a run of the
// loop -- some cell of C is off the loop, or a box cell bordering C is on it, in
// which case the true run is bigger than C -- or the rellik rule applies to C.
// `Or` over the negated pattern's literals plus the cage states exactly that.
//
// The candidates are the non-empty connected subsets of a box that the loop rules
// above leave available as a whole run. A subset those rules already exclude can
// never be a run, so its conditional would be vacuous; each test below is a
// consequence of a constraint asserted elsewhere in this script:
//   * degree: a run cell is on the loop, so it has exactly two on-loop
//     neighbours. Its box neighbours outside C are off the loop (C is maximal),
//     so the count inside C may not exceed two, and the neighbours it has
//     outside the box must be able to supply the rest.
//   * no-touch: two cells of C diagonally adjacent within the box share two
//     neighbours; if neither is in C both are off the loop, which is the
//     forbidden diagonal-only 2x2.
//   * relliks: a rellik is on the loop, so it cannot be one of the off-loop box
//     cells bordering C.
const rellikCells = new Set(relliks);
const boxRuns = graph.boxes().flatMap(box => {
  const boxCells = new Set(box);
  const runs = [];
  for (let mask = 1; mask < (1 << box.length); mask++) {
    const cells = box.filter((_, i) => (mask >> i) & 1);
    const run = new Set(cells);
    if (!graph.connected(cells)) continue;

    const degreeOk = cells.every(cell => {
      const neighbours = graph.neighbours(cell);
      const inside = neighbours.filter(n => run.has(n)).length;
      const outsideBox = neighbours.filter(n => !boxCells.has(n)).length;
      return inside <= 2 && inside + outsideBox >= 2;
    });
    if (!degreeOk) continue;

    // The box cells adjacent to the run: off the loop whenever the run is real.
    const border = [...new Set(cells.flatMap(cell =>
      graph.neighbours(cell).filter(n => boxCells.has(n) && !run.has(n))))];
    if (border.some(cell => rellikCells.has(cell))) continue;

    const diagonalOnly = box.some(cell => {
      const block = graph.block(cell, 2, 2);
      if (!block || !block.every(c => boxCells.has(c))) return false;
      const [topLeft, topRight, bottomLeft, bottomRight] = block.map(c => run.has(c));
      return (topLeft && bottomRight && !topRight && !bottomLeft) ||
        (topRight && bottomLeft && !topLeft && !bottomRight);
    });
    if (diagonalOnly) continue;

    runs.push({ cells, border });
  }
  return runs;
});

// A one-cell run forbids only its own digit being 1, which is a candidate
// restriction rather than a cage (RellikCage needs at least two cells).
const digitsOtherThanOne = Array.from(
  { length: geometry.numValues - 1 }, (_, i) => i + 2);
const rellikCages = boxRuns.map(({ cells, border }) => new Or([
  ...cells.map(cell => new Given(loop.at(cell), OFF)),
  ...border.map(cell => new Given(loop.at(cell), ON)),
  cells.length === 1
    ? new Given(cells[0], ...digitsOtherThanOne)
    : new RellikCage(cells.length, ...cells),
]));

return [
  new Shape('9x9'),
  loop.toVar('loop'),
  ...membership,
  // Single loop: the on-loop cells form one orthogonally-connected region.
  // With degree 2 above, one connected 2-regular region is one simple cycle.
  new ConnectedValues('VL', ON),
  ...degrees,
  noDiagonalTouches,
  ...killerCages.map(([total, cells]) => new Cage(total, ...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...rellikCages,
];
