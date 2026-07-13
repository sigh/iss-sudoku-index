// Title: Mind the Gap
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=XfBbFSZNCys
// Source: https://sudokupad.app/tl8tkze8mn

// Partial encoding. Normal sudoku and the six yellow safety strips are encoded.
// A partial gap model uses Var cells for all grid-edge segments: visible gap and
// safety-strip edges are forced on, and orthogonally adjacent digits of opposite
// parity must have a gap edge between them. This leaves the gap-loop topology
// and the Pathfinder rule omitted.

const ON = 1;
const OFF = 2;

const graph = cellGraph('9x9');
const horizontalVar = new Var('H', 'horizontal gap edges', 90);
const verticalVar = new Var('V', 'vertical gap edges', 90);

function cell(row, col) {
  return makeCellId(row, col);
}

// Horizontal edge on row boundary rb=0..9, spanning column c=1..9.
function h(rb, c) {
  return horizontalVar.cell(rb * 9 + c);
}

// Vertical edge in row r=1..9, on column boundary cb=0..9.
function v(r, cb) {
  return verticalVar.cell((r - 1) * 10 + cb + 1);
}

function edgeId(edge) {
  return edge[0] === 'H' ? h(edge[1], edge[2]) : v(edge[1], edge[2]);
}

// horizontalVar/verticalVar are raw Var groups (not overlay-backed), so they
// have no parseCellId of their own. A Var group's cell `${prefix}${n}` gets a
// contiguous, sequential cellIndex in n, so a locator that reads the numeric
// suffix reproduces the same offsets Replicate needs.
const varLocator = (v) => ({
  parseCellId: (id) => ({ cellIndex: Number(id.slice(v.prefix.length + 1)) }),
});

const safetyStripEdges = [
  ['H', 1, 2],
  ['H', 1, 6],
  ['V', 2, 4],
  ['V', 6, 6],
  ['H', 8, 6],
  ['V', 9, 8],
];

const visibleGreyEdges = [
  ['V', 2, 1],
  ['V', 2, 9],
  ['V', 2, 6],
  ['V', 6, 8],
  ['V', 7, 4],
  ['V', 8, 4],
  ['V', 9, 4],
  ['V', 6, 1],
  ['V', 7, 1],
  ['V', 5, 4],
  ['V', 7, 7],
  ['V', 2, 4],
  ['H', 4, 4],
  ['H', 5, 1],
  ['H', 2, 1],
  ['H', 7, 1],
  ['H', 6, 8],
  ['H', 2, 6],
  ['H', 2, 5],
  ['H', 2, 9],
];

const forcedGapEdges = [...new Set([...safetyStripEdges, ...visibleGreyEdges].map(edgeId))];

const safetyStrips = [
  [cell(1, 2), cell(2, 2)],
  [cell(1, 6), cell(2, 6)],
  [cell(2, 4), cell(2, 5)],
  [cell(6, 6), cell(6, 7)],
  [cell(8, 6), cell(9, 6)],
  [cell(9, 8), cell(9, 9)],
];

const parityGap = NFA.encodeSpec({
  startState: { phase: 'edge' },
  transition: (state, value) => {
    if (state.phase === 'edge') {
      return { phase: 'digitA', hasGap: value === ON };
    }
    if (state.phase === 'digitA') {
      return { phase: 'digitB', hasGap: state.hasGap, parity: value % 2 };
    }
    if (state.hasGap || state.parity === value % 2) return { phase: 'done' };
    return undefined;
  },
  accept: ({ phase }) => phase === 'done',
}, 9);

return [
  new Shape('9x9'),
  horizontalVar,
  verticalVar,
  ...[horizontalVar, verticalVar].map(v => {
    const targets = Array.from({ length: 90 }, (_, i) => v.cell(i + 1));
    const origin = targets[0];
    return new Replicate(
      [new Given(origin, ON, OFF)],
      Replicate.encodeTargetCells(targets, origin, varLocator(v)),
      origin,
    );
  }),
  ...forcedGapEdges.map(edge => new Given(edge, ON)),
  ...safetyStrips.map(strip => new BlackDot(...strip)),
  ...Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 9 }, (_, col) =>
      new NFA(parityGap, 'gap-parity', h(row + 1, col + 1), cell(row + 1, col + 1), cell(row + 2, col + 1))
    )
  ).flat(),
  ...Array.from({ length: 9 }, (_, row) =>
    Array.from({ length: 8 }, (_, col) =>
      new NFA(parityGap, 'gap-parity', v(row + 1, col + 1), cell(row + 1, col + 1), cell(row + 1, col + 2))
    )
  ).flat(),
];
