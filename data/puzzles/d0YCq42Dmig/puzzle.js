// Title: Kaiserliche Marine
// Author: Oripy
// Video: https://www.youtube.com/watch?v=d0YCq42Dmig
// Source: https://sudokupad.app/anfigouctj?setting-nogrid=1

// Rules encoded here, in full:
//  1. Normal 9x9 sudoku: 1-9 once per row, column and 3x3 box (the drawn
//     regions are the standard boxes).
//  2. Battleships: place the given fleet -- one 5-cell ship, two 4-cell ships,
//     four 3-cell ships, four 2-cell ships (see FLEET) -- so that no two ships
//     touch, not even diagonally. Ships are straight runs of cells and may be
//     rotated, i.e. horizontal or vertical.
//  3. Four outside clues give the number of ship-occupied cells in their row
//     or column; the other fourteen lanes carry no printed clue and so get no
//     constraint (see ROW_CLUES / COL_CLUES).
//  4. German fleet: every ship is a German whisper line -- adjacent digits
//     along a ship differ by at least 5.
//  5. Kropki: a white dot joins consecutive digits, a black dot joins digits
//     in ratio 1:2. The rules say "not all dots are necessarily given", so
//     unmarked pairs carry no negative constraint.
// Nothing is omitted.

// The value range is widened past the digits so that 0 is available to the
// overlay below; the board itself is restricted back to 1-9 by `digits`.
const shape = new Shape('9x9', '0-9');
const grid = cellGraph(shape);
const cells = grid.cells();
const digits = grid.makeReplicate(new Given(cells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

// POS: 0 = open water, k >= 1 = this cell is the k-th cell of the ship that
// owns it, counted from the ship's leftmost cell (horizontal ship) or topmost
// cell (vertical ship). Ships are not given ids: a cell's position along its
// own ship is enough to fix both the shape of every ship and the fleet.
const POS = grid.makeOverlay('VP');

// Rule 2, no touching: no two diagonally adjacent cells are both occupied.
// On its own that also makes every ship straight and one cell wide -- a cell
// with both a horizontal and a vertical occupied neighbour would put those two
// neighbours diagonally adjacent -- and it keeps distinct ships apart, since
// two orthogonally adjacent occupied cells are joined into one ship by the
// chain rule below. Applied as one Pair down each diagonal, which relates
// exactly the consecutive (i.e. diagonally adjacent) cells of that diagonal.
const notBothShips = Pair.fnToKey((a, b) => a === 0 || b === 0, shape);
const diagonals = [
  ...grid.row(1).map(cell => grid.ray(cell, 1, 1)),
  ...grid.column(1).slice(1).map(cell => grid.ray(cell, 1, 1)),
  ...grid.row(1).map(cell => grid.ray(cell, 1, -1)),
  ...grid.column(9).slice(1).map(cell => grid.ray(cell, 1, -1)),
].filter(chain => chain.length > 1);
const noTouching = diagonals.map(
  chain => new Pair(notBothShips, 'no-touch', ...POS.at(chain)));

// Rule 2, ship shape, and rule 4. Each cell's predecessor along its ship is
// its west or north neighbour -- and never both, which the no-touching Pairs
// above already rule out. So exactly one of these holds at every cell:
//   * the cell is open water;
//   * the cell is occupied with both of those neighbours open water, and is
//     therefore the first cell of its ship;
//   * the west neighbour is occupied, and this cell continues that ship;
//   * the north neighbour is occupied, and this cell continues that ship.
// Each continuation branch is where two cells are consecutive along one ship,
// so that is where the whisper difference of at least 5 belongs (rule 4).
const nextAlongShip = Pair.fnToKey((a, b) => a >= 1 && b === a + 1, shape);
const continues = (prev, cell) => new And([
  new Pair(nextAlongShip, 'ship-run', POS.at(prev), POS.at(cell)),
  new Whisper(5, prev, cell),
]);
const shipRuns = cells.map(cell => {
  const before = [grid.step(cell, 0, -1), grid.step(cell, -1, 0)].filter(c => c);
  return new Or([
    new Given(POS.at(cell), 0),
    new And([
      ...before.map(prev => new Given(POS.at(prev), 0)),
      new Given(POS.at(cell), 1),
    ]),
    ...before.map(prev => continues(prev, cell)),
  ]);
});

// Rule 2, the fleet itself. Ship lengths read off the fleet key drawn beside
// the board: 22 rounded end caps and 11 plain middle segments make 11 ships,
// keyed row by row as 2,2 / 2,2 / 3 / 3 / 3 / 3 / 4 / 4 / 5.
const FLEET = [5, 4, 4, 3, 3, 3, 3, 2, 2, 2, 2];
// Position k is reached by exactly the ships at least k cells long, so the
// board holds that many cells of value k; the rest are open water. Fixing all
// of those counts at once fixes the fleet: the number of ships of length L is
// the count of value L less the count of value L + 1.
const fleetCounts = [
  81 - FLEET.reduce((a, b) => a + b, 0),
  ...Array.from({ length: Math.max(...FLEET) },
    (_, k) => FLEET.filter(len => len >= k + 1).length),
];
const fleet = new ContainExact(
  fleetCounts.flatMap((count, value) => Array(count).fill(value)).join('_'),
  ...POS.cells());

// Rule 3. A lane with n ship cells has 9 - n cells of open water; the ship
// cells' own positions are left free. Clue values transcribed from the four
// numbers drawn in the board's margin: above columns 5 and 8, beside rows 1
// and 8.
const ROW_CLUES = { 1: 5, 8: 5 };
const COL_CLUES = { 5: 6, 8: 1 };
const waterCount = (clue) => Array(9 - clue).fill(0).join('_');
const lineClues = [
  ...Object.entries(ROW_CLUES).map(
    ([row, clue]) => new ContainExact(waterCount(clue), ...POS.row(+row))),
  ...Object.entries(COL_CLUES).map(
    ([col, clue]) => new ContainExact(waterCount(clue), ...POS.column(+col))),
];

// Board givens.
const givens = [new Given('R6C2', 5), new Given('R6C8', 7)];

// Rule 5, transcribed from the drawn edge circles (white = outlined,
// black = filled) as the cell pair each circle straddles.
const WHITE_DOTS = [
  ['R1C4', 'R1C5'], ['R1C5', 'R1C6'], ['R7C4', 'R7C5'], ['R8C2', 'R8C3'],
  ['R8C4', 'R8C5'], ['R8C5', 'R8C6'], ['R9C5', 'R9C6'],
  ['R1C4', 'R2C4'], ['R1C6', 'R2C6'], ['R3C9', 'R4C9'], ['R8C4', 'R9C4'],
  ['R8C6', 'R9C6'],
];
const BLACK_DOTS = [
  ['R5C1', 'R5C2'], ['R5C8', 'R5C9'], ['R7C2', 'R7C3'], ['R7C7', 'R7C8'],
  ['R1C5', 'R2C5'], ['R7C5', 'R8C5'],
];
const dots = [
  ...WHITE_DOTS.map(pair => new WhiteDot(...pair)),
  ...BLACK_DOTS.map(pair => new BlackDot(...pair)),
];

return [
  shape,
  POS.toVar('shipPosition'),
  digits,
  ...noTouching,
  ...shipRuns,
  fleet,
  ...lineClues,
  ...givens,
  ...dots,
];
