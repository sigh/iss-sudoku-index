// Title: Pent Up
// Author: Daniel Buckeldee
// Video: https://www.youtube.com/watch?v=VMenmutpNMA
// Source: https://sudokupad.app/f0t3wo1l0n

// Rules encoded here:
//   Normal sudoku rules apply.
//   Tile the 9x9 grid except R5C5 with pentominoes (two are given). Every cell
//   should appear in exactly one pentomino.
//   Each pentomino shape should be unique (rotations are not allowed,
//   reflections are allowed).
//   Within a pentomino, for every horizontal domino the righthand cell is
//   larger than the left, and for every vertical domino the lower cell is
//   larger than the upper cell.
// Nothing is omitted.
//
// "Rotations are not allowed, reflections are allowed" is read as: two
// pentominoes may not be rotations of each other, but may be reflections of
// each other -- i.e. shapes are one-sided pentominoes, of which there are 18.
// Sixteen pentominoes tile the 80 non-excluded cells, so the alternative
// reading (shapes equal up to both rotation and reflection, 12 free
// pentominoes) cannot supply enough distinct shapes and is unsatisfiable.

const NUM_PIECES = 14;    // pentominoes the solver must find (16 minus the 2 given)
const OUTSIDE = 15;       // piece label for the given pentominoes and R5C5
const NUM_VALUES = 16;    // widened range: also holds the 16 shape-class codes

const shape = new Shape('9x9', NUM_VALUES);
const graph = cellGraph(shape);

// --- Pentomino shape tables -------------------------------------------------
// Shapes are stored as offsets from the piece's first cell in row-major order,
// so a placement is fixed by any one cell's offset. `orientationsOf` lists a
// shape's distinct rotations; two shapes are the same one-sided class exactly
// when they share the lexicographically smallest rotation (`classKeyOf`).

const keyOf = (cells) => cells.map(([r, c]) => `${r},${c}`).join(' ');
const anchorNorm = (cells) => {
  const sorted = [...cells].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const [r0, c0] = sorted[0];
  return sorted.map(([r, c]) => [r - r0, c - c0]);
};
const rotate90 = (cells) => anchorNorm(cells.map(([r, c]) => [c, -r]));
const orientationsOf = (cells) => {
  const seen = new Map();
  let cur = anchorNorm(cells);
  for (let i = 0; i < 4; i++) {
    seen.set(keyOf(cur), cur);
    cur = rotate90(cur);
  }
  return [...seen.values()].sort((a, b) => keyOf(a) < keyOf(b) ? -1 : 1);
};
const classKeyOf = (cells) => keyOf(orientationsOf(cells)[0]);

// Grow every pentomino from a single cell: 63 fixed shapes, 18 one-sided classes.
let pentominoes = [[[0, 0]]];
for (let size = 1; size < 5; size++) {
  const grown = new Map();
  for (const cells of pentominoes) {
    for (const [r, c] of cells) {
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const [nr, nc] = [r + dr, c + dc];
        if (cells.some(([a, b]) => a === nr && b === nc)) continue;
        const next = anchorNorm([...cells, [nr, nc]]);
        grown.set(keyOf(next), next);
      }
    }
  }
  pentominoes = [...grown.values()];
}
const classes = new Map();
for (const cells of pentominoes) classes.set(classKeyOf(cells), orientationsOf(cells));

// Drawn data: the two red pentomino outlines, and the shaded untiled cell.
const givenPentominoes = [
  ['R2C4', 'R3C2', 'R3C3', 'R3C4', 'R4C4'],
  ['R4C6', 'R4C7', 'R4C8', 'R4C9', 'R5C9'],
];
const untiled = ['R5C5'];

// The given pentominoes already claim two one-sided classes, so the pieces the
// solver places are drawn from the other 16.
const rowCol = (cell) => { const p = parseCellId(cell); return [p.row, p.col]; };
const givenClasses = givenPentominoes.map(p => classKeyOf(p.map(rowCol)));
const orientations = [...classes.keys()].sort()
  .filter(k => !givenClasses.includes(k)).map(k => classes.get(k));

// Offset encodings: over all 63 shapes dr runs 0..4 and dc runs -3..4.
const DR_BASE = 1;   // VD value = dr + 1
const DC_BASE = 4;   // VE value = dc + 4
const hasOffset = (s, r, dr, dc) =>
  orientations[s - 1][r - 1].some(o => o[0] === dr && o[1] === dc);

// --- Overlays ---------------------------------------------------------------
// VP: which pentomino a cell belongs to (OUTSIDE for the given pieces and R5C5).
// VS/VR: the one-sided class and the rotation of that pentomino.
// VD/VE: the cell's own offset within that rotation.
const fixedCells = new Set([...givenPentominoes.flat(), ...untiled]);
const freeCells = graph.cells().filter(c => !fixedCells.has(c));

const pieceId = graph.makeOverlay('VP');
const shapeId = graph.makeOverlay('VS', freeCells);
const rotation = graph.makeOverlay('VR', freeCells);
const rowOffset = graph.makeOverlay('VD', freeCells);
const colOffset = graph.makeOverlay('VE', freeCells);

// --- State machines ---------------------------------------------------------

// Read over [VS, VR, VD, VE] of one cell: the declared rotation must exist for
// the declared class, and the declared offset must be one of its five cells.
// Five cells of a piece sharing a class, a rotation and a consistent offset
// therefore cover that rotation's five offsets exactly once.
const declarationNFA = NFA.encodeSpec({
  startState: { i: 0 },
  transition: (st, v) => {
    switch (st.i) {
      case 0:                                          // class
        return v <= orientations.length ? { i: 1, s: v } : undefined;
      case 1:                                          // rotation
        return v <= orientations[st.s - 1].length
          ? { i: 2, s: st.s, r: v } : undefined;
      case 2:                                          // row offset
        return orientations[st.s - 1][st.r - 1].some(o => o[0] === v - DR_BASE)
          ? { i: 3, s: st.s, r: st.r, d: v } : undefined;
      case 3:                                          // column offset
        return hasOffset(st.s, st.r, st.d - DR_BASE, v - DC_BASE)
          ? { i: 4 } : undefined;
      default:
        return undefined;
    }
  },
  accept: (st) => st.i === 4,
}, shape);

// Read over [VPa, VPb, VSa, VSb, VRa, VRb, VDa, VDb, VEa, VEb, a, b] for two
// orthogonally adjacent cells, `b` to the right of or below `a`. When the two
// cells carry different piece labels nothing is checked (the `free` states just
// consume the rest of the list). When they share a label, they must agree on
// the piece's class and rotation, their offsets must differ by exactly the step
// between them, and their digits must obey the domino rule.
const makeAdjacencyNFA = (horizontal) => NFA.encodeSpec({
  startState: { i: 0 },
  transition: (st, v) => {
    const i = st.i;
    if (i >= 12) return undefined;
    if (i === 0) return { i: 1, v };
    if (i === 1) return { i: 2, same: v === st.v ? 1 : 0 };
    if (!st.same) return { i: i + 1, same: 0 };
    switch (i) {
      case 2: case 4: case 6: case 8:                  // carry a's value
        return { i: i + 1, same: 1, v };
      case 3: case 5:                                  // class, rotation agree
        return v === st.v ? { i: i + 1, same: 1 } : undefined;
      case 7:                                          // row offset step
        return v === (horizontal ? st.v : st.v + 1)
          ? { i: 8, same: 1 } : undefined;
      case 9:                                          // column offset step
        return v === (horizontal ? st.v + 1 : st.v)
          ? { i: 10, same: 1 } : undefined;
      case 10:
        return v <= 9 ? { i: 11, same: 1, v } : undefined;
      default:                                         // b's digit is larger
        return (v <= 9 && v > st.v) ? { i: 12, same: 1 } : undefined;
    }
  },
  accept: (st) => st.i === 12,
}, shape);
const horizontalNFA = makeAdjacencyNFA(true);
const verticalNFA = makeAdjacencyNFA(false);

// Read over the whole VP layer in row-major order. Piece labels are
// interchangeable, so require label k to first appear before label k+1; this
// removes the 14! relabellings without touching which tilings are legal.
const canonicalLabelNFA = NFA.encodeSpec({
  startState: 0,
  transition: (maxSeen, v) => {
    if (v === OUTSIDE || v <= maxSeen) return maxSeen;
    return v === maxSeen + 1 ? v : undefined;
  },
  accept: (maxSeen) => maxSeen === NUM_PIECES,
}, shape);

// --- Constraint lists -------------------------------------------------------

const dominoes = graph.cells().flatMap(a =>
  [[0, 1], [1, 0]].flatMap(([dr, dc]) => {
    const b = graph.step(a, dr, dc);
    return b ? [[a, b, dr === 0]] : [];
  }));

// Adjacent pairs with a solver-placed cell on both sides. A pair touching a
// given pentomino or R5C5 always straddles two labels, so it needs no machine.
const freeDominoes = dominoes.filter(
  ([a, b]) => !fixedCells.has(a) && !fixedCells.has(b));

// Each piece label occupies exactly five cells; OUTSIDE covers the 11 others.
const labelCounts = [
  ...Array.from({ length: NUM_PIECES }, (_, i) => Array(5).fill(i + 1)).flat(),
  ...Array(fixedCells.size).fill(OUTSIDE),
];

const range = (n) => Array.from({ length: n }, (_, i) => i + 1);
// Stamp a domain over every cell of an overlay group (a one-cell Replicate).
const stampVar = (overlay, cells, ...values) => overlay.makeReplicate(
  new Given(overlay.at(cells[0]), ...values), overlay.at(cells));

return [
  shape,
  pieceId.toVar('piece'),
  shapeId.toVar('shape class'),
  rotation.toVar('rotation'),
  rowOffset.toVar('row offset'),
  colOffset.toVar('column offset'),
  new Var('N', 'distinct shapes', 1),

  // The widened range only carries overlay codes; grid cells hold digits.
  graph.makeReplicate(new Given(graph.cells()[0], ...range(9))),
  new Given('R1C8', 8),
  new Given('R4C1', 9),
  new Given('R6C1', 8),
  new Given('R6C7', 1),
  new Given('R6C9', 2),
  new Given('R8C1', 1),
  new Given('R9C8', 9),

  // Overlay domains.
  ...[...fixedCells].map(c => new Given(pieceId.at(c), OUTSIDE)),
  stampVar(pieceId, freeCells, ...range(NUM_PIECES)),
  stampVar(shapeId, freeCells, ...range(orientations.length)),
  stampVar(rotation, freeCells, ...range(4)),
  stampVar(rowOffset, freeCells, ...range(5)),
  stampVar(colOffset, freeCells, ...range(8)),

  // Tiling: 14 five-cell pieces, each orthogonally connected.
  new ContainExact(labelCounts.join('_'), ...pieceId.at(graph.cells())),
  ...range(NUM_PIECES).map(k => new ConnectedValues('VP', k)),
  new NFA(canonicalLabelNFA, 'canonical piece labels',
    ...pieceId.at(graph.cells())),

  // Shape identity, and the domino rule inside a piece.
  ...freeCells.map(c => new NFA(declarationNFA, 'shape declaration',
    shapeId.at(c), rotation.at(c), rowOffset.at(c), colOffset.at(c))),
  ...freeDominoes.map(([a, b, horizontal]) => new NFA(
    horizontal ? horizontalNFA : verticalNFA, 'adjacent cells',
    pieceId.at(a), pieceId.at(b), shapeId.at(a), shapeId.at(b),
    rotation.at(a), rotation.at(b), rowOffset.at(a), rowOffset.at(b),
    colOffset.at(a), colOffset.at(b), a, b)),

  // All 14 placed pentominoes have different one-sided classes. Every cell of a
  // piece repeats that piece's class, so 14 distinct class values over the 70
  // tiled cells means no two pieces share one.
  new Given('VN', NUM_PIECES),
  new CountDistinct('VN', ...shapeId.at(freeCells)),

  // The given pentominoes are fixed, so their dominoes are stated directly.
  ...givenPentominoes.flatMap(p => dominoes
    .filter(([a, b]) => p.includes(a) && p.includes(b))
    .map(([a, b]) => new GreaterThan(b, a))),

];
