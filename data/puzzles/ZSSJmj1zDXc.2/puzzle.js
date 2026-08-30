// Title: March 10th, 2022: Battleships
// Author: Tyrgannus
// Video: https://www.youtube.com/watch?v=ZSSJmj1zDXc
// Source: https://tinyurl.com/rr2j8xyr

// Rules encoded here:
//  1. Place the given fleet -- one 4-cell ship, two 3-cell ships, three 2-cell
//     ships, four 1-cell ships (20 cells total; read off the fleet-key icons
//     below the grid, see FLEET below) -- into the 10x10 grid. Each ship is a
//     straight 1-cell-wide line; rotating (horizontal/vertical) is permitted.
//  2. No two ships touch, not even diagonally.
//  3. An outside clue gives the exact number of ship-occupied cells in its
//     row/column. Not every row/column carries a clue; an unclued line is
//     unconstrained by this rule (see colClues/rowClues below).
//  4. A given ship segment must be used as the part of a ship that its shape
//     represents -- no cell on this board carries a shape-specific icon (the
//     fleet key below the grid is the only place a shaped icon is drawn), so
//     this puzzle instance has no given segments and nothing to encode here.
//  5. Cells with waves cannot be occupied by a ship (WAVE_CELLS below): the
//     board's 12 on-board icons are all one undifferentiated shape, unlike
//     the fleet key's shape-specific icons, which is what identifies them as
//     waves rather than shaped ship-segment givens.

const shape = new Shape('10x10', '0-10', 'Raw');
const grid = cellGraph(shape);
const cells = grid.cells();

// The 10x10 board holds only 0 (empty) / 1 (ship-occupied); values 2-10 exist
// solely to widen the LABEL overlay below to fit 0-10 ship ids in one cell.
const gridDomain = grid.makeReplicate(new Given(cells[0], 0, 1));

// LABEL: 0 = empty, 1-10 = which of the 10 ship instances below owns this
// cell. Two ships claiming the same cell (overlap), or one ship's body
// falling in another's halo (touching), both force a cell to two different
// values at once -- unsatisfiable, so the placement loop needs no separate
// overlap/no-touch bookkeeping.
const LABEL = grid.makeOverlay('VL');

// A cell is occupied iff its label is non-zero. Without this link, a cell no
// ship's Or-branch ever mentions keeps a free 0-10 label, which does not
// change the real (grid) answer but multiplies the counted auxiliary
// solutions.
const occupiedKey = Pair.fnToKey((occupied, label) => (occupied === 1) === (label !== 0), shape);
const occupiedLink = cells.map(cell => new Pair(occupiedKey, 'occupied', cell, LABEL.at(cell)));

// The fleet, one entry per ship instance: one 4-cell ship, two 3-cell ships,
// three 2-cell ships, four 1-cell ships (20 cells total; read off the fleet
// key drawn below the grid).
const FLEET = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

// Every straight placement of a length-L ship, generated one way only
// (increasing column for horizontal, increasing row for vertical), so each
// physical placement appears exactly once in the candidate list.
function candidatesForLength(len) {
  const out = [];
  for (let r = 1; r <= 10; r++) {
    for (let c = 1; c <= 10; c++) {
      if (c + len - 1 <= 10) {
        out.push(Array.from({ length: len }, (_, k) => makeCellId(r, c + k)));
      }
      if (len > 1 && r + len - 1 <= 10) {
        out.push(Array.from({ length: len }, (_, k) => makeCellId(r + k, c)));
      }
    }
  }
  return out;
}

// One Or per ship instance: choosing a placement pins its own cells on the
// grid (occupied) and on LABEL (this ship's id), and pins every King-adjacent
// cell outside its own body (the halo) to empty on the grid -- rule 2.
const placements = FLEET.map((len, i) => {
  const shipId = i + 1;
  const branches = candidatesForLength(len).map(body => {
    const bodySet = new Set(body);
    const halo = new Set();
    for (const cell of body) {
      for (const n of grid.kingNeighbours(cell)) {
        if (!bodySet.has(n)) halo.add(n);
      }
    }
    return new And([
      ...body.map(cell => new Given(cell, 1)),
      ...body.map(cell => new Given(LABEL.at(cell), shipId)),
      ...[...halo].map(cell => new Given(cell, 0)),
    ]);
  });
  return new Or(branches);
});

// Symmetry breaking: instances of the same length are otherwise
// interchangeable, so an unordered assignment would count every permutation
// of same-length ship ids as a separate LABEL solution despite one identical
// grid. Force a canonical row-major order within each same-length group: scan
// the grid in reading order and reject if id `high`'s first appearance
// precedes id `low`'s.
function orderNfa(low, high) {
  const NEITHER = 0, SEEN_LOW = 1, DONE = 2;
  const spec = NFA.encodeSpec({
    startState: NEITHER,
    transition: (state, value) => {
      if (state === DONE) return DONE;
      if (state === NEITHER) {
        if (value === low) return SEEN_LOW;
        if (value === high) return undefined; // high seen before low: reject
        return NEITHER;
      }
      // state === SEEN_LOW
      return value === high ? DONE : SEEN_LOW;
    },
    accept: (state) => state === DONE,
  }, shape);
  return new NFA(spec, `order-${low}-${high}`, ...LABEL.cells());
}
// FLEET indices (1-based ids): 1 = the only 4; 2,3 = the two 3s; 4,5,6 = the
// three 2s; 7,8,9,10 = the four 1s. Consecutive pairs within a group already
// force the whole group's order.
const ORDER_PAIRS = [[2, 3], [4, 5], [5, 6], [7, 8], [8, 9], [9, 10]];
const ordering = ORDER_PAIRS.map(([low, high]) => orderNfa(low, high));

// The fleet total: the 20 cells the placements above pin are the only
// occupied cells on the board -- restates "place the given fleet" (no more,
// no fewer ships than the key shows).
const total = new Sum(20, ...cells);

// Outside clues, occupied-cell counts by row/column; columns 4/7 and rows 4/7
// carry no printed clue and so get no Sum below.
const colClues = { 1: 1, 2: 8, 3: 0, 5: 3, 6: 1, 8: 2, 9: 2, 10: 2 };
const rowClues = { 1: 6, 2: 1, 3: 1, 5: 6, 6: 0, 8: 2, 9: 2, 10: 1 };
const colSums = Object.entries(colClues).map(
  ([col, clue]) => new Sum(clue, ...grid.column(+col)));
const rowSums = Object.entries(rowClues).map(
  ([row, clue]) => new Sum(clue, ...grid.row(+row)));

// Wave cells: 12 cells that cannot be occupied by a ship.
const WAVE_CELLS = [
  [1, 1], [1, 4], [2, 6], [3, 5], [5, 7], [5, 9],
  [6, 2], [6, 4], [8, 6], [9, 5], [10, 7], [10, 10],
].map(([r, c]) => makeCellId(r, c));
const waveCells = WAVE_CELLS.map(cell => new Given(cell, 0));

return [
  shape,
  LABEL.toVar('SHIP'),
  gridDomain,
  ...occupiedLink,
  ...placements,
  ...ordering,
  total,
  ...colSums, ...rowSums,
  ...waveCells,
];
