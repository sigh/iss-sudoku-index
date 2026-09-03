// Title: Magic Chess Sudoku
// Author: Jamie Cavallo
// Video: https://www.youtube.com/watch?v=uKdlB_dgpDM
// Source: https://cracking-the-cryptic.web.app/sudoku/PThGMg47p6

// Normal sudoku rules apply.
// Three of the digits follow knight sudoku rules and cannot be within a
// knight's move of an identical digit; three follow king sudoku rules and
// three follow queen sudoku rules.
// The three digits of each type share a colour in the central 3x3 box, which
// is a magic square.
// Clues outside the grid sum the diagonals they point to.
//
// The rules never say which of the three colours carries which chess piece, so
// that pairing is disjoined over below rather than resolved here.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// The ten given digits.
const givens = [
  ['R3C4', 2], ['R3C6', 1],
  ['R4C3', 6], ['R4C7', 7],
  ['R5C2', 9], ['R5C8', 1],
  ['R6C3', 4], ['R6C7', 5],
  ['R7C4', 5], ['R7C6', 4],
];

// The three colours drawn in the central box, read from the cell shading:
// red #E6261F, blue #34BBE6, green #A3E048.
const colourGroups = [
  ['R4C4', 'R5C4', 'R5C5'],  // red
  ['R4C5', 'R4C6', 'R6C5'],  // blue
  ['R6C4', 'R5C6', 'R6C6'],  // green
];

// The magic square: every row, column and diagonal of the central box has the
// same sum. The box's own all-different then fixes that sum at 15.
const centralBox = graph.box(5);
const magicSegments = [
  ...[0, 3, 6].map(i => centralBox.slice(i, i + 3)),
  ...[0, 1, 2].map(i => [centralBox[i], centralBox[i + 3], centralBox[i + 6]]),
  [centralBox[0], centralBox[4], centralBox[8]],
  [centralBox[2], centralBox[4], centralBox[6]],
];

// Outside clues. Each badge sits on the off-grid continuation of the diagonal
// its arrow points down into: "11" above column 4 points down-left, so its
// diagonal enters the grid at R1C3; "17" above column 6 points down-right, so
// its diagonal enters at R1C7.
const littleKillers = [
  [11, graph.ray('R1C3', 1, -1)],
  [17, graph.ray('R1C7', 1, 1)],
];

// Nine variables holding the digits of each chess type: VT1-VT3 are the knight
// digits, VT4-VT6 the king digits, VT7-VT9 the queen digits. The disjunction
// at the end equates them, cell by cell, with the digits of one colour group
// each, which also makes the nine of them the nine distinct digits of the
// central box. Equating them cell by cell rather than as sets fixes the order
// inside each triple, which is an artefact of this three-variable overlay and
// nothing the rules speak about.
const chessDigits = new Var('T', 'chess digits', 9);
const slots = start => [0, 1, 2].map(i => chessDigits.cell(start + i));

const boxOf = new Map(
  graph.boxes().flatMap((cells, i) => cells.map(cell => [cell, i])));
// Two cells already forced apart by the row/column/box rules; the chess rule
// says nothing further about such a pair, so those pairs are dropped.
const alreadyDistinct = (a, b) => {
  const [pa, pb] = [parseCellId(a), parseCellId(b)];
  return pa.row === pb.row || pa.col === pb.col || boxOf.get(a) === boxOf.get(b);
};

// Each move set lists half of the piece's moves (the other half is the same
// unordered cell pairs seen from the far cell).
const stepPairs = steps => graph.cells().flatMap(
  a => steps
    .map(([dRow, dCol]) => graph.step(a, dRow, dCol))
    .filter(b => b !== null && !alreadyDistinct(a, b))
    .map(b => [a, b]));
const rayPairs = directions => graph.cells().flatMap(
  a => directions.flatMap(
    ([dRow, dCol]) => graph.ray(a, dRow, dCol).slice(1)
      .filter(b => !alreadyDistinct(a, b))
      .map(b => [a, b])));

const chessTypes = [
  { slots: slots(1), pairs: stepPairs([[1, 2], [2, 1], [1, -2], [2, -1]]) },
  { slots: slots(4), pairs: stepPairs([[0, 1], [1, 0], [1, 1], [1, -1]]) },
  { slots: slots(7), pairs: rayPairs([[0, 1], [1, 0], [1, 1], [1, -1]]) },
];

// "a and b are not an identical digit of this type": either the two cells
// differ, or a is none of the three digits of the type. The three slots hold
// distinct digits, so the second branch is exactly that non-membership.
const chessRestriction = ({ slots, pairs }) => pairs.map(([a, b]) => new Or([
  new AllDifferent(a, b),
  new AllDifferent(a, ...slots),
]));

// The colour-to-piece pairing, as the six one-to-one assignments of the three
// colour groups to the knight/king/queen digit slots.
const bijections = [
  [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0],
];
const colourAssignment = order => new And(chessTypes.flatMap(
  (type, i) => type.slots.map(
    (slot, j) => new SameValues(2, slot, colourGroups[order[i]][j]))));

return [
  new Shape('9x9'),
  chessDigits,
  ...givens.map(([cell, value]) => new Given(cell, value)),
  new EqualSum(...magicSegments),
  ...littleKillers.map(([sum, cells]) =>
    LittleKiller.fromCells(sum, cells, geometry)),
  new Or(bijections.map(colourAssignment)),
  ...chessTypes.flatMap(chessRestriction),
];
