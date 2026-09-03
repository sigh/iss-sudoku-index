// Title: Caves can hide secrets
// Author: cornishjohn
// Video: https://www.youtube.com/watch?v=YNTpvdIpA58
// Source: https://sudokupad.app/f75ku3v4p7

// Rules:
//   Normal sudoku: 1-9 once per row, column and box. The grid has no givens.
//   Arrows: the digits along an arrow sum to the digit in its circled bulb.
//   Cave: shade some cells so that the shaded cells form one orthogonally
//     connected area. All unshaded cells must be part of an orthogonally
//     connected group that contains all the digits 1 to N exactly once, where N
//     is the size of that group. All groups must be connected to the outside of
//     the grid. All circles (including arrow bulbs) are unshaded.
//
// Encoded: sudoku, the ten arrows, "the shaded cells are one connected area",
// "every unshaded group reaches the outside of the grid", and "all twelve
// circles are unshaded".
//
// Omitted: "a group of N cells contains all the digits 1 to N exactly once".
// Which cells form each group is a choice the solver makes, and there is no
// constraint that attaches a size or a digit-set predicate to a component of a
// solver-discovered partition. Two consequences of the omitted clause are
// enforced instead, and they are the whole of what links the shading to the
// digits here:
//   * distinct digits within a group, restricted to pairs of unshaded cells
//     joined by an unshaded path of length 2 (the length-1 pairs are already
//     covered, since orthogonal neighbours share a row or a column);
//   * a group of size 1 holds the digit 1, i.e. an unshaded cell whose
//     orthogonal neighbours are all shaded holds a 1.
// Longer paths, and the "exactly once" and "1 to N" parts of the clause, are
// not enforced.

const SHADED = 1;
const UNSHADED = 2;

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const gridCells = graph.cells();

// --- Arrows --------------------------------------------------------------
// Transcribed from the ten drawn arrow strokes; each is listed bulb first,
// then its path cells in drawn order.
const arrows = [
  ['R1C7', 'R2C7', 'R2C6', 'R2C5'],
  ['R2C3', 'R2C4', 'R3C5', 'R3C6'],
  ['R3C4', 'R4C4', 'R4C3', 'R4C2', 'R5C2'],
  ['R4C5', 'R4C6', 'R3C7'],
  ['R4C9', 'R3C9', 'R2C9', 'R1C9'],
  ['R7C8', 'R6C7'],
  ['R9C8', 'R9C7', 'R8C6'],
  ['R6C5', 'R7C5', 'R7C4'],
  ['R5C3', 'R6C2', 'R7C1', 'R8C1'],
  ['R4C8', 'R5C7', 'R6C6'],
].map(cells => new Arrow(...cells));

// --- Shading layer -------------------------------------------------------
// The shading is an 11x11 board: the 9x9 grid inset by one, inside a ring of
// cells that are permanently unshaded. "Every unshaded group is connected to
// the outside of the grid" is then exactly "the unshaded cells of this layer
// form one connected region", the ring being the outside; several unshaded
// groups in the grid stay legal, each having to reach the ring. Over the bare
// 9x9 the same constraint would instead force a single unshaded group.
// ConnectedValues also requires its value set to be non-empty, which is the
// "shade some cells" half of the shading rule.
const shadeLayer = cellGraph('11x11').makeOverlay('VS');
const shadeVar = shadeLayer.toVar('shading');
// Grid RxCy is layer cell (x + 1, y + 1).
const shadeAt = (cell) => {
  const { row, col } = parseCellId(cell);
  return shadeVar.cell(row + 1, col + 1);
};
const gridShade = new Set(gridCells.map(shadeAt));
const ringShade = shadeLayer.cells().filter(cell => !gridShade.has(cell));

const shading = [
  shadeVar,
  // Every layer cell is one of the two shades; the ring cells are the ones
  // held unshaded.
  shadeLayer.makeReplicate(new Given(shadeVar.cell(1), SHADED, UNSHADED)),
  shadeLayer.makeReplicate(new Given(ringShade[0], UNSHADED), ringShade),
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
];

// --- Circles -------------------------------------------------------------
// The ten arrow bulbs and the two standalone circles, read off the drawn
// circles.
const circles = [
  'R1C7', 'R2C3', 'R3C4', 'R4C5', 'R4C9',
  'R7C8', 'R9C8', 'R6C5', 'R5C3', 'R4C8',
  'R9C1', 'R7C9',
];
const unshadedCircles = circles.map(cell => new Given(shadeAt(cell), UNSHADED));

// --- Consequence 1: distinct digits two steps apart within a group -------
// Reads [shade(p), shade(link), shade(q), digit(p), digit(q)]. While every
// shading read so far is UNSHADED the three cells are in one group, so the two
// digits must differ; the first SHADED read drops `joined` and the machine
// accepts whatever follows.
const linkedPair = NFA.encodeSpec({
  startState: { step: 0, joined: true, first: null },
  transition: ({ step, joined, first }, value) => {
    if (step < 3) {
      return { step: step + 1, joined: joined && value === UNSHADED, first: null };
    }
    if (step === 3) return { step: 4, joined, first: joined ? value : null };
    if (joined && value === first) return undefined;
    return { step: 5, joined: false, first: null };
  },
  accept: ({ step }) => step === 5,
  maxDepth: 5,
}, shape);

// The only pairs worth stating are the diagonal ones: orthogonal neighbours
// share a row or a column, and cells two apart along a row or column share
// that row or column, so sudoku already separates those. A diagonal pair whose
// two cells share a box is likewise already separated, so only the pairs that
// straddle a box boundary are emitted. Each diagonal pair of a 2x2 block has
// two possible links -- the other two cells of the block -- and either one
// joins them, so each link gets its own constraint.
const boxOf = new Map();
graph.boxes().forEach(
  (box, i) => box.forEach(cell => boxOf.set(cell, i)));

const diagonalPairs = gridCells
  .map(cell => graph.block(cell, 2, 2))
  .filter(block => block !== null)
  // block is [topLeft, topRight, bottomLeft, bottomRight].
  .flatMap(([tl, tr, bl, br]) => [[tl, br, tr, bl], [tr, bl, tl, br]])
  .filter(([p, q]) => boxOf.get(p) !== boxOf.get(q));

const distinctInGroup = diagonalPairs.flatMap(([p, q, link1, link2]) =>
  [link1, link2].map(link => new NFA(
    linkedPair, 'two-step group pair',
    shadeAt(p), shadeAt(link), shadeAt(q), p, q)));

// --- Consequence 2: a lone unshaded cell holds a 1 ------------------------
// Reads [shade(c), shade(each orthogonal neighbour)..., digit(c)]. If c is
// unshaded and no neighbour is, c is a group of size 1, so N is 1 and its only
// digit is 1.
const loneCell = (numNeighbours) => NFA.encodeSpec({
  startState: { step: 0, unshaded: false, company: false },
  transition: ({ step, unshaded, company }, value) => {
    if (step === 0) {
      return { step: 1, unshaded: value === UNSHADED, company: false };
    }
    if (step <= numNeighbours) {
      return {
        step: step + 1,
        unshaded,
        company: unshaded && (company || value === UNSHADED),
      };
    }
    if (unshaded && !company && value !== 1) return undefined;
    return { step: step + 1, unshaded: false, company: false };
  },
  accept: ({ step }) => step === numNeighbours + 2,
  maxDepth: numNeighbours + 2,
}, shape);

// Corner cells have two orthogonal neighbours, edge cells three, the rest
// four, so three machines cover the grid.
const loneCellSpecs = new Map(
  [2, 3, 4].map(n => [n, loneCell(n)]));

const loneCells = gridCells.map(cell => {
  const neighbours = graph.neighbours(cell);
  return new NFA(
    loneCellSpecs.get(neighbours.length), 'size-1 group holds 1',
    shadeAt(cell), ...neighbours.map(shadeAt), cell);
});

return [
  shape,
  ...arrows,
  ...shading,
  ...unshadedCircles,
  ...distinctInGroup,
  ...loneCells,
];
