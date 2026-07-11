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
const constraints = [
  new Shape('9x9'),
  new Var('H', 'horizontal gap edges', 90),
  new Var('V', 'vertical gap edges', 90),
];

const add = (...newConstraints) => constraints.push(...newConstraints);

function cell(row, col) {
  return makeCellId(row, col);
}

// Horizontal edge on row boundary rb=0..9, spanning column c=1..9.
function h(rb, c) {
  return `VH${rb * 9 + c}`;
}

// Vertical edge in row r=1..9, on column boundary cb=0..9.
function v(r, cb) {
  return `VV${(r - 1) * 10 + cb + 1}`;
}

function edgeId(edge) {
  return edge[0] === 'H' ? h(edge[1], edge[2]) : v(edge[1], edge[2]);
}

for (let i = 1; i <= 90; i++) {
  add(new Given(`VH${i}`, ON, OFF), new Given(`VV${i}`, ON, OFF));
}

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
for (const edge of forcedGapEdges) add(new Given(edge, ON));

const safetyStrips = [
  [cell(1, 2), cell(2, 2)],
  [cell(1, 6), cell(2, 6)],
  [cell(2, 4), cell(2, 5)],
  [cell(6, 6), cell(6, 7)],
  [cell(8, 6), cell(9, 6)],
  [cell(9, 8), cell(9, 9)],
];
for (const strip of safetyStrips) add(new BlackDot(...strip));

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

for (let row = 1; row <= 8; row++) {
  for (let col = 1; col <= 9; col++) {
    add(new NFA(parityGap, 'gap-parity', h(row, col), cell(row, col), cell(row + 1, col)));
  }
}

for (let row = 1; row <= 9; row++) {
  for (let col = 1; col <= 8; col++) {
    add(new NFA(parityGap, 'gap-parity', v(row, col), cell(row, col), cell(row, col + 1)));
  }
}

return constraints;
