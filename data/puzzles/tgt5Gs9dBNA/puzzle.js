// Title: Drafting Strategy
// Author: Sudoku Joker
// Video: https://www.youtube.com/watch?v=tgt5Gs9dBNA
// Source: https://sudokupad.app/qbx29s7dud

// Rules encoded below:
//   - Normal sudoku.
//   - No cell may be double the value of any orthogonally adjacent cell.
//   - Digits in two adjacent green rooms sum to 10.
//   - A digit in a purple room is smaller than any of the digits in
//     orthogonally adjacent cells.
//   - Two rooms of the same colour may not contain the same digit.
//
// Rules NOT encoded:
//   - The walk through the house: one route through the 5x9 floorplan
//     (columns 3-7, all rows) that visits each of the 45 rooms exactly once,
//     stepping only through doorways, from the room marked "E" to the room
//     marked "A".
//   - The footstep budget along that walk: start at 50, +10 on entering a
//     purple room, halved on entering a red room, -1 on entering any other
//     room, always a whole number and never falling to zero.
//   - The region sum line formed by that walk: the 3x3 box borders cut the
//     route into sections of equal sum.
//   These three rules are all stated over the order in which the walk visits
//   the rooms, which is not drawn and is not fixed by the doorways alone.
//
// A third purple-filled cell, R6C1, is drawn outside the central 5x9 area the
// rules define as the house, walled on all four sides with its doorway opening
// onto R7C1. It shares no border with the floorplan, so a walk through the
// house cannot reach it; calling it a room would make "this house can be
// traversed visiting each room only once" false. It is therefore not a room,
// and the room-colour rules do not reach it.

const shape = new Shape('9x9');
const graph = cellGraph(shape);

const givens = [
  new Given('R1C3', 4),
  new Given('R1C4', 6),
];

// Room colours, read off the full-cell fills inside the floorplan.
const green = ['R2C3', 'R2C4', 'R6C4', 'R6C5', 'R6C7', 'R7C7', 'R8C3', 'R9C3'];
const red = ['R3C3', 'R7C6', 'R9C6'];
const purple = ['R4C7', 'R9C7'];

// One Pair per orthogonal edge. The predicate is the negation of the black-dot
// (2:1) relation, so it forbids the ratio in either direction; StrictKropki is
// not usable here because it would also forbid consecutive pairs.
// Two Replicates cover all 144 edges: the template pair is translated to every
// cell that has a right neighbour, then to every cell that has a lower one.
const noDoubleKey = Pair.fnToKey((a, b) => a !== 2 * b && b !== 2 * a, shape);
const noDoubling = [
  graph.makeReplicate(
    new Pair(noDoubleKey, 'no doubling', 'R1C1', 'R1C2'),
    graph.cells().filter(c => parseCellId(c).col < 9)),
  graph.makeReplicate(
    new Pair(noDoubleKey, 'no doubling', 'R1C1', 'R2C1'),
    graph.cells().filter(c => parseCellId(c).row < 9)),
];

// Adjacent green rooms, derived from the colour list and grid adjacency rather
// than hand-listed; the index test keeps each pair once.
const greenPairs = green.flatMap(
  cell => graph.neighbours(cell)
    .filter(n => green.indexOf(n) > green.indexOf(cell))
    .map(n => new Sum(10, cell, n)));

// GreaterThan(a, b) reads "a is greater than its later adjacent cells", so the
// neighbour comes first and the purple room second.
const purpleLower = purple.flatMap(
  cell => graph.neighbours(cell).map(n => new GreaterThan(n, cell)));

const colourDistinct = [
  new AllDifferent(...green),
  new AllDifferent(...red),
  new AllDifferent(...purple),
];

return [
  shape,
  ...givens,
  ...noDoubling,
  ...greenPairs,
  ...purpleLower,
  ...colourDistinct,
];
