// Title: Oh No, My Shirt!
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=M-F_Ueg8DRk
// Source: https://sudokupad.app/24t19yk4uf

// Rules encoded, in full; nothing is omitted:
//   1. Place one or more digits from 1-9 in every cell so that each digit
//      appears exactly once in every row, column, and 3x3 box.
//   2. All the digits in the cell(s) touching each V sum to 5.
//   3. White dots always separate a pair of adjacent digits (but there can also
//      be additional digits in the separated cells).
//
// Six moth holes are chewed out of the shirt. The fourteen squares inside them
// are not cells and hold nothing, so the rows, columns and boxes they belong to
// have fewer than nine cells while still holding each of 1-9 once -- which is
// what rule 1's "one or more digits" is for. Four of the seven V marks sit on a
// hole's edge, so only one of the two squares they touch is a cell; rule 2's
// "cell(s)" is that case.
//
// A cell therefore holds a set of digits, and a grid square holds one value. The
// model gives every cell an ordered list of digit slots -- its grid square, then
// its VB/VC/VD overlay squares -- holding the cell's digits in increasing order
// with 0 in any unused slot. Rule 1 is then one ContainExact per house over
// every slot of that house's cells, rule 2 a Sum over the touching cells' slots
// (an unused slot adds 0), rule 3 an Or over the slot pairs.

const EMPTY = 0;                                  // "this slot holds no digit"
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const FIRST_HOLE_LABEL = 10;                      // above every digit

const shape = new Shape('9x9', '0-13');
const graph = cellGraph(shape);

// The six chewed holes, each as the squares it swallows. Read off the drawn
// hole outlines: the six thin freehand cut paths, the thick white strokes that
// blank every cell border lying inside a hole, and the gaps those holes leave in
// the thick black perimeter and box borders. All three agree.
const HOLES = [
  ['R1C1', 'R1C2', 'R2C2'],            // top-left corner
  ['R1C7', 'R1C8', 'R2C8'],            // top edge, right of the box border
  ['R5C9'],                            // right edge
  ['R6C1', 'R7C1'],                    // left edge
  ['R8C8', 'R8C9', 'R9C9'],            // bottom-right corner
  ['R9C3', 'R9C4'],                    // bottom edge
];
const CHEWED = new Set(HOLES.flat());

// The seven V marks, as the two squares each sits between.
const VEES = [
  ['R1C2', 'R1C3'], ['R1C5', 'R1C6'], ['R5C3', 'R5C4'], ['R5C8', 'R5C9'],
  ['R7C8', 'R8C8'], ['R8C4', 'R9C4'], ['R9C1', 'R9C2'],
];

// The eleven white dots, likewise.
const DOTS = [
  ['R1C9', 'R2C9'], ['R2C9', 'R3C9'], ['R4C5', 'R4C6'], ['R5C4', 'R5C5'],
  ['R5C5', 'R6C5'], ['R6C4', 'R6C5'], ['R6C7', 'R7C7'], ['R7C2', 'R7C3'],
  ['R7C2', 'R8C2'], ['R8C2', 'R8C3'], ['R7C3', 'R8C3'],
];

const squares = graph.cells();
const isCell = square => !CHEWED.has(square);
const cells = squares.filter(isCell);
const houses = graph.rowsColumnsBoxes();
const housesOf = square => houses.filter(house => house.includes(square));

// A house of h cells holds nine digits and every cell of it holds at least one,
// so any one of its cells holds at most 10 - h digits. A cell's largest house is
// the binding one, and gives it 1 to 4 slots.
const capacity = square => 10 - Math.max(
  ...housesOf(square).map(house => house.filter(isCell).length));

const overlays = ['VB', 'VC', 'VD'].map((prefix, i) => graph.makeOverlay(
  prefix, cells.filter(square => capacity(square) >= i + 2)));
const slotsOf = square => isCell(square)
  ? [square, ...overlays.map(o => o.at(square)).filter(slot => slot !== null)]
  : [];

// A grid row, column and box is always all-different, and a chewed square still
// has to hold something, so each is pinned to a label above 9 that no chewed
// square sharing a house with it uses. The labels are an artifact of the model,
// not a clue: nothing reads them, and this greedy assignment is one of many.
const holeLabels = new Map();
for (const square of squares.filter(square => !isCell(square))) {
  const taken = new Set(housesOf(square).flatMap(
    house => house.map(other => holeLabels.get(other))));
  let label = FIRST_HOLE_LABEL;
  while (taken.has(label)) label++;
  holeLabels.set(square, label);
}

// Canonicalization, not a rule: true when slot b may follow slot a, i.e. the
// digits rise and the unused slots trail after them. One digit set then has one
// representation instead of one per ordering of its digits.
const risingSlots = Pair.fnToKey(
  (a, b) => b === EMPTY || (a !== EMPTY && b > a), shape);

// Rule 3's relation between one slot of each separated cell: two digits that
// differ by one. An unused slot cannot take part.
const consecutive = Pair.fnToKey(
  (a, b) => a !== EMPTY && b !== EMPTY && Math.abs(a - b) === 1, shape);

return [
  shape,
  ...overlays.map((o, i) => o.toVar(`digit slot ${i + 2}`)),

  // Slot 1 of a cell always holds a digit; a later slot may be unused.
  // makeReplicate translates its template from the grid's first square, so the
  // template is written there; that square is chewed away and is not a target.
  graph.makeReplicate(new Given(squares[0], ...DIGITS), cells),
  ...overlays.flatMap(o => o.cells().map(
    slot => new Given(slot, EMPTY, ...DIGITS))),
  ...squares.filter(square => !isCell(square)).map(
    square => new Given(square, holeLabels.get(square))),

  // Rule 1.
  ...houses.map(house => new ContainExact(
    DIGITS.join('_'), ...house.filter(isCell).flatMap(slotsOf))),

  // Slot ordering: see risingSlots above.
  ...cells.flatMap(square => {
    const slots = slotsOf(square);
    return slots.slice(1).map((slot, i) => new Pair(
      risingSlots, 'rising digit slots', slots[i], slot));
  }),

  // Rule 2.
  ...VEES.map(([a, b]) => new Sum(5, ...slotsOf(a), ...slotsOf(b))),

  // Rule 3.
  ...DOTS.map(([a, b]) => new Or(slotsOf(a).flatMap(
    x => slotsOf(b).map(y => new Pair(consecutive, 'consecutive digits', x, y))))),
];
