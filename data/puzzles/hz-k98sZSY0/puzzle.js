// Title: Cylinder
// Author: Timothy Bexon
// Video: https://www.youtube.com/watch?v=hz-k98sZSY0
// Source: https://app.crackingthecryptic.com/sudoku/Rhtd2M286j

// Normal sudoku rules apply. The grid is a cylinder: column 9 is adjacent to
// column 1 for the row lines below. Four of the drawn lines are split in the
// source into two segments that visibly run off the right edge and re-enter
// on the left (wayPoints past column 9 / before column 1); those pairs are
// rejoined here into the single line the rules describe.
//
// In each row, some cells are joined by one or more lines. Every line drawn
// in a row sums to that row's target number, and the target strictly
// increases row by row down the grid. The target is written into that row's
// blue cell(s): two blue cells read left-to-right as a two-digit number
// (tens, then units). A one-cell row's rules text gives two live readings for
// what that single digit shows -- the total itself (an ordinary sum), or, for
// a two-digit total with a repeated digit such as 33, just that repeated
// digit -- so both are encoded as a disjunction and left for the grid to
// resolve, never chosen up front.
//
// Row line cells and blue cell(s), transcribed from the puzzle's drawn lines
// and blue-cell overlays, with each cylinder-wrapped line rejoined into one.
const ROWS = [
  { row: 1, blue: ['R1C1'],
    lines: [['R1C3', 'R1C4'], ['R1C6', 'R1C7']] },
  { row: 2, blue: ['R2C8'],
    lines: [['R2C1', 'R2C2', 'R2C3']] },
  { row: 3, blue: ['R3C3', 'R3C4'],
    lines: [['R3C1', 'R3C2'], ['R3C6', 'R3C7'], ['R3C8', 'R3C9']] },
  { row: 4, blue: ['R4C6', 'R4C7'],
    lines: [['R4C2', 'R4C3'], ['R4C4', 'R4C5', 'R4C6', 'R4C7'], ['R4C9', 'R4C1']] },
  { row: 5, blue: ['R5C7', 'R5C8'],
    lines: [['R5C3', 'R5C4'], ['R5C5', 'R5C6'], ['R5C7', 'R5C8', 'R5C9', 'R5C1']] },
  { row: 6, blue: ['R6C1', 'R6C2'],
    lines: [['R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5'], ['R6C6', 'R6C7'], ['R6C8', 'R6C9']] },
  { row: 7, blue: ['R7C2', 'R7C3'],
    lines: [['R7C1', 'R7C2', 'R7C3', 'R7C4'], ['R7C5', 'R7C6', 'R7C7', 'R7C8']] },
  { row: 8, blue: ['R8C8', 'R8C9'],
    lines: [['R8C7', 'R8C8', 'R8C9', 'R8C1', 'R8C2'], ['R8C3', 'R8C4', 'R8C5']] },
  { row: 9, blue: ['R9C1'],
    lines: [['R9C6', 'R9C7', 'R9C8'], ['R9C9', 'R9C1', 'R9C2', 'R9C3', 'R9C4']] },
];

// Widen the alphabet to add 0. Only the auxiliary tens-digit Vars below (one
// per one-blue-cell row) ever take it, standing for "no tens digit" so a
// one-digit total sorts below every genuine two-digit total. Every playable
// grid cell is pinned straight back to 1-9.
const shape = new Shape('9x9', '0-9');
const NUM_VALUES = 10;
const VALUE_OFFSET = 0;

const graph = cellGraph(shape);
const gridCells = graph.cells();

const singleBlueRows = ROWS.filter(r => r.blue.length === 1);
const tensAux = new Var(
  'T', 'aux tens digit for one-blue-cell rows (0 = no tens digit)',
  singleBlueRows.length);
const auxCellByRow = new Map(
  singleBlueRows.map((r, i) => [r.row, tensAux.cell(i + 1)]));

const lessKey = Pair.fnToKey((a, b) => a < b, NUM_VALUES, VALUE_OFFSET);
const eqKey = Pair.fnToKey((a, b) => a === b, NUM_VALUES, VALUE_OFFSET);

// tensCell/onesCell give every row a uniform (tens, ones) pair standing for
// its target number: the two blue cells for a two-blue-cell row, or
// (aux Var, the single blue cell) for a one-blue-cell row.
const tensCell = r => r.blue.length === 2 ? r.blue[0] : auxCellByRow.get(r.row);
const onesCell = r => r.blue.length === 2 ? r.blue[1] : r.blue[0];

return [
  shape,

  // The main grid holds ordinary sudoku digits 1-9; only the aux tens Vars
  // below use the widened 0. One template Given, replicated over every cell.
  new Replicate(
    [new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)],
    Replicate.encodeTargetCells(gridCells, gridCells[0], graph),
    gridCells[0]),

  tensAux,

  // A one-blue-cell row's shown digit is either the total itself (aux tens
  // pinned to 0) or the repeated digit of a same-digit two-digit total (aux
  // tens equals the shown digit) -- see header comment.
  ...singleBlueRows.map(r => new Or([
    new Given(auxCellByRow.get(r.row), 0),
    new Pair(eqKey, 'aux tens = shown digit', auxCellByRow.get(r.row), r.blue[0]),
  ])),

  // Every line in a row sums to that row's target, 10*tens + ones. A
  // coefficient Sum adds a repeated cell's coefficients together, so
  // appending [tensCell,-10],[onesCell,-1] to a line's own cells is the
  // algebraic identity line_sum = 10*tens + ones whether or not the blue
  // cell(s) happen to sit on that particular line -- several do.
  ...ROWS.flatMap(r => r.lines.map(line =>
    new Sum(0, ...line, [tensCell(r), -10], [onesCell(r), -1]))),

  // The target strictly increases row by row: compare each row's (tens,
  // ones) against the next row's lexicographically -- with both digits in
  // 0-9 and no carries, that equals comparing the two-digit numbers they
  // spell.
  ...ROWS.slice(0, -1).map((r, i) => {
    const next = ROWS[i + 1];
    return new Or([
      new Pair(lessKey, 'tens increases', tensCell(r), tensCell(next)),
      new And([
        new Pair(eqKey, 'tens equal', tensCell(r), tensCell(next)),
        new Pair(lessKey, 'ones increases', onesCell(r), onesCell(next)),
      ]),
    ]);
  }),
];
