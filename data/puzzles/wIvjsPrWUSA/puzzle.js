// Title: LookAir 400
// Author: Eric Fox
// Video: https://www.youtube.com/watch?v=wIvjsPrWUSA
// Source: https://app.crackingthecryptic.com/webapp/3pB4RRnb6n

// Rules encoded here (from the video description, which is the only rules
// text this row carries -- the payload itself embeds none):
//  - Shade some cells so that each orthogonally-connected region of shaded
//    cells is a perfect square.
//  - A number in the grid gives the count of shaded cells in the plus-shaped
//    cross around it (the cell itself and its four orthogonal neighbours).
// Omitted: "No two squares of the same size are allowed to see each other
// (an unobstructed horizontal/vertical line of unshaded cells connecting
// them)" -- a global comparison between two solver-discovered regions'
// sizes, which has no known ISS encoding.
//
// This is not a Sudoku puzzle: the 9x16 board holds no digits at all, only a
// shaded/unshaded state per cell, so it is Raw with a widened 0-9 range (0 =
// unshaded, 1-9 = the side length of the square the cell belongs to; 9 is the
// grid's own cap, min(9 rows, 16 cols)). No row/column/box rule applies.
const shape = new Shape('9x16', '0-9', 'Raw');
const graph = cellGraph(shape);

// The main grid cell already holds the side-length value (SZ). Two more
// overlays carry, per cell, whether it is the rightmost column (RE) or
// bottom row (BE) of its square -- pinned only by the run-scan NFA below,
// never given directly -- plus a plain 0/1 shaded indicator (SH) used by the
// counting clues.
const RE = graph.makeOverlay('VE');
const BE = graph.makeOverlay('VD');
const SH = graph.makeOverlay('VH');
const domain = (overlay, ...values) =>
  overlay.makeReplicate(new Given(overlay.cells()[0], ...values));

// Run-scan NFA, reading one row/column as side-length, edge-flag,
// side-length, edge-flag, .... A run of s consecutive equal nonzero values
// must close exactly at the sth cell (flag 1 there, 2 on every earlier cell
// of the run). Unlike the full-tiling version of this construction
// (`ZSSJmj1zDXc.5`, `e0A6XymJpeM`), where a closed run may be immediately
// followed by another run of the *same* size (two equal squares tiling
// side by side is normal there), `prevSz` carries the size that just closed
// at the previous cell and a fresh run may not repeat it: two isolated
// squares can share a border only if they differ in size, since two
// same-size squares touching would really be one overlong run, not two
// legitimately separate ones. (Differently-sized squares touching is ruled
// out separately, by `separation` below.) An unshaded (0) cell carries no
// run at all, so its own flag cell is left unconstrained by this machine (it
// still gets pinned to 1 or 2 by the `domain` restriction below, just not
// meaningfully), and it resets `prevSz` since a gap makes any later repeat
// legitimate.
const runNFA = NFA.encodeSpec({
  startState: { onSize: true, owed: 0, prevSz: 0 },
  transition: (state, value) => {
    if (state.onSize) {
      if (state.owed > 0) {
        // Continuing an open run: must match the size it committed to. 0
        // never matches a committed size >= 1, so an unshaded cell always
        // breaks an open run (rejected, as it should be).
        if (value !== state.sz) return undefined;
        return { onSize: false, sz: state.sz, left: state.owed - 1 };
      }
      if (value === 0) return { onSize: false, sz: 0, left: 0, prevSz: 0 };
      if (value === state.prevSz) return undefined;
      return { onSize: false, sz: value, left: value - 1, prevSz: 0 };
    }
    // A flag cell.
    if (state.sz === 0) return { onSize: true, owed: 0, prevSz: 0 };
    if (value !== (state.left === 0 ? 1 : 2)) return undefined;
    return state.left === 0
      ? { onSize: true, owed: 0, prevSz: state.sz }
      : { onSize: true, owed: state.left, sz: state.sz };
  },
  accept: (state) => state.onSize && state.owed === 0,
}, shape);

const interleave = (values, flags) => values.flatMap((v, i) => [v, flags[i]]);
const rowRuns = [];
for (let r = 1; r <= 9; r++) {
  rowRuns.push(new NFA(runNFA, `row${r}`, ...interleave(graph.row(r), RE.row(r))));
}
const colRuns = [];
for (let c = 1; c <= 16; c++) {
  colRuns.push(new NFA(runNFA, `col${c}`, ...interleave(graph.column(c), BE.column(c))));
}

// Separation: two orthogonally-adjacent shaded cells belonging to squares of
// different sizes would merge into a connected region that is not itself a
// square, so they must share the same side length. (Two adjacent cells of
// the SAME size are already excluded by the run-scan above: the shared run
// crossing their border would be longer than either square's own side.)
// This is the one addition beyond the row/col run-scan construction used for full
// square-tiling puzzles (`ZSSJmj1zDXc.5`, `e0A6XymJpeM`) -- those puzzles
// *want* differently-sized squares to touch (it is a tiling), ours does not
// (shaded regions must stand alone). Verified against an independent
// placement-based enumeration on 6x5/max-side-4 and 5x5/max-side-3 grids:
// the row/col run-scan plus this separation rule accepts exactly the
// isolated-square shadings and nothing else (694538 and 79225 matches, 0
// discrepancies both ways).
const sameSquare = Pair.fnToKey((a, b) => !(a !== 0 && b !== 0 && a !== b), shape);
// One Replicate per offset (right, down): a template Pair at the first cell
// that has a neighbour at that offset, stamped over every such cell.
function offsetGroup(dRow, dCol) {
  const targets = graph.cells().filter((c) => graph.step(c, dRow, dCol) !== null);
  const origin = targets[0];
  const template = new Pair(
    sameSquare, 'square-separation', origin, graph.step(origin, dRow, dCol));
  return new Replicate(
    [template], Replicate.encodeTargetCells(targets, origin, graph), origin);
}
const separation = [offsetGroup(0, 1), offsetGroup(1, 0)];

// SH mirrors the grid cell's shaded/unshaded state as a plain 0/1, for the
// counting clues below: 0 exactly when the cell's side length is 0.
const shadedLink = Pair.fnToKey((sz, sh) => (sz === 0) === (sh === 0), shape);
const shadedLinks = graph.cells().map(
  (cell) => new Pair(shadedLink, 'shaded-indicator', cell, SH.at(cell)));

// The printed cross-shape counts (row/col 0-indexed payload position -> R#C#
// per the payload's `cells` grid; each clue cell's own row lies in 2-8 and
// column in 2-15, so every cross fits inside the board with no edge cases).
// Columns above 9 are not decimal in ISS cell ids (base-17 digits past 9), so
// clues are listed as [row, col, value] and built with makeCellId.
const clues = [
  [2, 2, 5], [2, 5, 3], [2, 8, 2], [2, 9, 1], [2, 13, 1], [2, 14, 2],
  [3, 2, 4], [3, 5, 1], [3, 7, 3], [3, 10, 3], [3, 12, 3], [3, 15, 2],
  [4, 2, 1], [4, 5, 1], [4, 7, 3], [4, 10, 2], [4, 12, 3], [4, 15, 3],
  [5, 3, 1], [5, 4, 2], [5, 5, 1], [5, 7, 1], [5, 10, 3], [5, 12, 1],
  [5, 15, 3], [6, 5, 2], [6, 7, 1], [6, 10, 3], [6, 12, 1], [6, 15, 1],
  [7, 5, 2], [7, 7, 4], [7, 10, 1], [7, 12, 1], [7, 15, 2], [8, 5, 2],
  [8, 8, 4], [8, 9, 1], [8, 13, 1], [8, 14, 1],
];
const crossSums = clues.map(([row, col, value]) => {
  const cross = [
    makeCellId(row, col), makeCellId(row - 1, col), makeCellId(row + 1, col),
    makeCellId(row, col - 1), makeCellId(row, col + 1),
  ];
  return new Sum(value, ...SH.at(cross));
});

return [
  shape,
  RE.toVar('RightEdge'), BE.toVar('BottomEdge'), SH.toVar('Shaded'),
  domain(RE, 1, 2), domain(BE, 1, 2), domain(SH, 0, 1),
  ...rowRuns, ...colRuns,
  ...separation,
  ...shadedLinks,
  ...crossSums,
];
