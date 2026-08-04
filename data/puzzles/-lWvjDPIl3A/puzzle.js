// Title: Butterfly Clip
// Author: Tallcat & grkles
// Video: https://www.youtube.com/watch?v=-lWvjDPIl3A
// Source: https://app.crackingthecryptic.com/sudoku/48dj4tMNbQ

// Normal sudoku rules apply on the 9x9 grid. Seven blue lines are drawn on an
// 11x11 canvas whose outer ring (the one-cell-wide border around the 9x9
// grid) is margin, not playable cells. Several lines dip into that margin
// between grid segments.
// Digits along a blue line sum to the same total N within each region (a box,
// or the single "outside" region) it passes through; a region visited more
// than once by the same line counts each visit as a separate segment with
// its own N; different lines may have different totals -- this is
// `EqualSum`'s "each segment has the same sum" read per line, with the
// margin touches as extra one- or two-cell segments.
//
// Every margin cell a line touches is also "a clue outside the grid (to be
// deduced)": reading from that cell straight into the grid (down its column
// from the top, up its column from the bottom, or along its row from either
// side -- the margin cell's own row/column, independent of how the line
// bends before or after touching it) let N be the value of the first cell
// reached; the margin cell's own value equals the value of the Nth cell
// counting from that same first cell. The rules state this generally, for
// "a clue outside the grid", without singling out lone margin touches from
// ones next to another margin cell on the same line, so it is applied
// uniformly to all 11 margin touches below. Margin cells are modelled as
// Vars (VOC1..VOC11); they carry no row/column/box all-different constraint
// of their own -- nothing in the rules puts them in one.

const graph = cellGraph('9x9');
const outside = new Var('OC', 'outside clue cells', 11);
const oc = outside.cells(); // VOC1 .. VOC11

// The 11 margin cells the 7 lines touch (from the drawn line paths, split
// into per-region segments), and the straight row/column each reads into
// the grid (kind/n/reverse) to find its own value. A line dipping into the
// margin at its very start or end produces a 1-cell segment there; two
// lines (index 2 and 6) leave a 2-cell margin segment, both cells listed
// here individually. "reverse" means the margin cell sits on the bottom or
// right, so its own row/column is read starting from the far (bottom/right)
// end.
const margins = [
  { oc: oc[0], kind: 'col', n: 5, reverse: false }, // line 0 start, top margin over C5
  { oc: oc[1], kind: 'col', n: 9, reverse: false }, // line 1 start, top margin over C9
  { oc: oc[2], kind: 'row', n: 5, reverse: true }, // line 2 end (1st cell), right margin beside R5
  { oc: oc[3], kind: 'row', n: 4, reverse: true }, // line 2 end (2nd cell), right margin beside R4
  { oc: oc[4], kind: 'row', n: 6, reverse: true }, // line 3 start, right margin beside R6
  { oc: oc[5], kind: 'col', n: 9, reverse: true }, // line 3 end, bottom margin under C9
  { oc: oc[6], kind: 'col', n: 5, reverse: true }, // line 4 middle, bottom margin under C5
  { oc: oc[7], kind: 'row', n: 5, reverse: false }, // line 5 middle, left margin beside R5
  { oc: oc[8], kind: 'row', n: 7, reverse: false }, // line 6 start, left margin beside R7
  { oc: oc[9], kind: 'row', n: 9, reverse: false }, // line 6 end (1st cell), left margin beside R9
  { oc: oc[10], kind: 'row', n: 8, reverse: false }, // line 6 end (2nd cell), left margin beside R8
];

// "The digit in the Nth cell in that direction, where N is the first digit
// seen": branch on the value k of the first cell, then require the margin
// cell to match the cell at position k in the same 9-cell sequence. An
// existential match against a small fixed set (k = 1..9), not a running
// scan, so Or/And branches per the NFA-avoidance guidance rather than a
// state machine.
function marginIndexClue({ oc: ocCell, kind, n, reverse }) {
  const seq = kind === 'row' ? graph.row(n) : graph.column(n);
  if (reverse) seq.reverse();
  return new Or(
    seq.map((_, i) => new And([
      new Given(seq[0], i + 1),
      new SameValues(2, ocCell, seq[i]),
    ]))
  );
}

return [
  new Shape('9x9'),
  outside,
  ...margins.map(marginIndexClue),

  // Line 0: top margin -> box1 (3 cells) -> box0 (1 cell).
  new EqualSum(
    [oc[0]],
    ['R1C5', 'R2C5', 'R2C4'],
    ['R3C3'],
  ),
  // Line 1: top margin -> box2 (1 cell), diagonal.
  new EqualSum(
    [oc[1]],
    ['R1C8'],
  ),
  // Line 2: box2 (2 cells) -> box5 (2 cells) -> margin (2 cells).
  new EqualSum(
    ['R3C8', 'R3C9'],
    ['R4C9', 'R5C9'],
    [oc[2], oc[3]],
  ),
  // Line 3: margin (1 cell) -> box8 (3 cells) -> margin (1 cell).
  new EqualSum(
    [oc[4]],
    ['R7C9', 'R8C9', 'R9C9'],
    [oc[5]],
  ),
  // Line 4: box7 (2 cells) -> margin (1 cell) -> box7 again (3 cells, counted
  // separately from the first box7 visit) -> box4 (1 cell).
  new EqualSum(
    ['R8C4', 'R9C4'],
    [oc[6]],
    ['R9C6', 'R8C6', 'R7C6'],
    ['R6C6'],
  ),
  // Line 5: box3 (2 cells) -> margin (1 cell) -> box3 again (3 cells,
  // counted separately) -> box4 (1 cell).
  new EqualSum(
    ['R6C2', 'R6C1'],
    [oc[7]],
    ['R4C1', 'R4C2', 'R4C3'],
    ['R4C4'],
  ),
  // Line 6: margin (1 cell) -> box6 (3 cells) -> margin (2 cells).
  new EqualSum(
    [oc[8]],
    ['R7C1', 'R8C1', 'R9C1'],
    [oc[9], oc[10]],
  ),
];
