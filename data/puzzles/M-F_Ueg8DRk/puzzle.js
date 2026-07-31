// Title: Oh No, My Shirt!
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=M-F_Ueg8DRk
// Source: https://sudokupad.app/24t19yk4uf

// Rules encoded, in full:
//   1. Place one or more digits from 1-9 in every cell so that each digit
//      appears exactly once in every row, column, and 3x3 box.
//   2. All the digits in the cell(s) touching each V sum to 5.
//   3. White dots always separate a pair of adjacent digits (but there can also
//      be additional digits in the separated cells).
// Six holes are chewed out of the shirt. The fourteen squares inside them are
// not cells: they hold nothing, and the rows, columns and boxes they belong to
// are short of nine cells while still holding each of 1-9 once. Nothing is
// omitted.
//
// A cell therefore holds a SET of digits, which one grid cell cannot. Each cell
// gets an ordered list of digit slots -- the grid cell, then the VB/VC/VD
// overlay cells -- holding its digits in increasing order, with 0 for "this slot
// holds no digit". Rule 1 becomes one ContainExact per house over every slot of
// that house's cells; rule 2 sums slots, where an empty slot adds nothing; rule 3
// asks for one consecutive pair among the two cells' slots.
//
// The fourteen chewed squares are still grid cells, and ISS always makes each
// row, column and box of the grid all-different, so each chewed square is pinned
// to an out-of-play label above 9. Those labels are an artifact of this model,
// not a clue: nothing reads them, and the greedy assignment below is only one of
// many that keep them distinct within a house.

const EMPTY = 0;              // slot value meaning "no digit in this slot"
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const FIRST_LABEL = 10;       // chewed-square labels sit above the digits

const shape = new Shape('9x9', '0-13');
const graph = cellGraph(shape);

// The fourteen squares whose four borders are all whited out (the chewed edges).
const CHEWED = new Set([
  'R1C1', 'R1C2', 'R2C2',            // top-left hole
  'R1C7', 'R1C8', 'R2C8',            // top-right hole
  'R5C9',                            // right edge
  'R6C1', 'R7C1',                    // left edge
  'R8C8', 'R8C9', 'R9C9',            // bottom-right hole
  'R9C3', 'R9C4',                    // bottom edge
]);

// The seven V marks, as the two squares each one sits between. Four of the
// edges border a hole, so only one of the two squares is a cell.
const VEES = [
  ['R5C3', 'R5C4'], ['R9C1', 'R9C2'], ['R1C5', 'R1C6'],
  ['R1C2', 'R1C3'], ['R5C8', 'R5C9'], ['R7C8', 'R8C8'], ['R8C4', 'R9C4'],
];

// The eleven white dots, likewise; all eleven sit between two cells.
const DOTS = [
  ['R5C4', 'R5C5'], ['R5C5', 'R6C5'], ['R6C4', 'R6C5'],
  ['R8C2', 'R8C3'], ['R7C3', 'R8C3'], ['R7C2', 'R7C3'], ['R7C2', 'R8C2'],
  ['R1C9', 'R2C9'], ['R2C9', 'R3C9'], ['R4C5', 'R4C6'], ['R6C7', 'R7C7'],
];

const squares = graph.cells();
const isCell = square => !CHEWED.has(square);
const houses = graph.rowsColumnsBoxes();
const housesOf = square => houses.filter(house => house.includes(square));

// How many digits a cell can hold: its house holds nine digits over its cells,
// and every other cell of that house holds at least one, so the cell is left at
// most 10 - houseSize. The tightest of its three houses wins.
const capacity = square => 10 - Math.max(
  ...housesOf(square).map(house => house.filter(isCell).length));

// Slots 2, 3 and 4 exist only on the cells whose capacity reaches them.
const overlays = ['VB', 'VC', 'VD'].map((prefix, i) => graph.makeOverlay(
  prefix, squares.filter(sq => isCell(sq) && capacity(sq) >= i + 2)));
const slotsOf = square => isCell(square)
  ? [square, ...overlays.map(o => o.at(square)).filter(slot => slot !== null)]
  : [];

// Chewed-square labels: the first label that no chewed square already using it
// shares a house with.
const labels = new Map();
for (const square of squares.filter(sq => !isCell(sq))) {
  const taken = new Set(housesOf(square).flatMap(
    house => house.map(other => labels.get(other))));
  let label = FIRST_LABEL;
  while (taken.has(label)) label++;
  labels.set(square, label);
}

// A cell's digits are listed in increasing order and the unused slots trail
// after them, so one digit set has exactly one representation.
const increasingSlots = Pair.fnToKey(
  (a, b) => b === EMPTY || (a !== EMPTY && b > a), shape);

// Rule 3's relation between one slot of each cell: two digits one apart.
const consecutive = Pair.fnToKey(
  (a, b) => a !== EMPTY && b !== EMPTY && Math.abs(a - b) === 1, shape);

return [
  shape,
  ...overlays.map((o, i) => o.toVar(`digit slot ${i + 2}`)),

  // A first slot always holds a digit; a later slot may be empty. The template
  // sits on the grid's first square because makeReplicate anchors there; that
  // square is chewed away, so it is an anchor only and not one of the targets.
  graph.makeReplicate(
    new Given(squares[0], ...DIGITS), squares.filter(isCell)),
  ...squares.filter(sq => !isCell(sq)).map(
    sq => new Given(sq, labels.get(sq))),
  ...overlays.flatMap(o => o.cells().map(
    slot => new Given(slot, EMPTY, ...DIGITS))),

  // Rule 1.
  ...houses.map(house => new ContainExact(
    DIGITS.join('_'), ...house.filter(isCell).flatMap(slotsOf))),

  // Canonicalization, not a rule: see increasingSlots above.
  ...squares.filter(isCell).flatMap(square => {
    const slots = slotsOf(square);
    return slots.slice(1).map((slot, i) => new Pair(
      increasingSlots, 'increasing digit slots', slots[i], slot));
  }),

  // Rule 2.
  ...VEES.map(([a, b]) => new Sum(5, ...slotsOf(a), ...slotsOf(b))),

  // Rule 3.
  ...DOTS.map(([a, b]) => new Or(slotsOf(a).flatMap(
    x => slotsOf(b).map(
      y => new Pair(consecutive, 'consecutive digits', x, y))))),
];
