// Title: Shambhala
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=zfF6xGsesJI
// Source: https://sudokupad.app/5ut8ou1zu2

// VC and VS respectively record whether each grid cell is circled or shaded.
// Values 1 and 2 mean selected and unselected. VR, VL, and VB hold the
// circled digit for each row, column, and box.

const SELECTED = 1;
const UNSELECTED = 2;

const graph = cellGraph('9x9');
const circle = graph.makeOverlay('VC');
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

const rowValues = new Var('R', 'row circled digits', 9);
const columnValues = new Var('L', 'column circled digits', 9);
const boxValues = new Var('B', 'box circled digits', 9);
const rowValue = i => rowValues.cell(i + 1);
const columnValue = i => columnValues.cell(i + 1);
const boxValue = i => boxValues.cell(i + 1);

const rows = Array.from({ length: 9 }, (_, i) => graph.row(i + 1));
const columns = Array.from({ length: 9 }, (_, i) => graph.column(i + 1));
const boxes = Array.from({ length: 9 }, (_, i) => {
  const row = Math.floor(i / 3) * 3 + 1;
  const col = (i % 3) * 3 + 1;
  return graph.block(makeCellId(row, col), 3, 3);
});

// Each unit has exactly one circle. Its digit is copied to the unit's Var,
// and that Var also equals the number of selected shade flags in the unit:
// with 1=selected and 2=unselected, sum(flags) + count(selected) = 18.
function unitRules(cells, circledValue) {
  const circleCells = circle.at(cells);
  const shadeCells = shade.at(cells);
  return [
    new ContainExact('1', ...circleCells),
    new Or(cells.map((cell, i) => new And([
      new Given(circleCells[i], SELECTED),
      new SameValues(2, circledValue, cell),
    ]))),
    new Sum(18, ...shadeCells, circledValue),
  ];
}

const rowRules = rows.flatMap((cells, i) => unitRules(cells, rowValue(i)));
const columnRules = columns.flatMap(
  (cells, i) => unitRules(cells, columnValue(i)));
const boxRules = boxes.flatMap((cells, i) => unitRules(cells, boxValue(i)));

const diamonds = [
  'R6C1', 'R5C3', 'R3C2', 'R1C4', 'R4C6',
  'R2C5', 'R7C2', 'R3C7', 'R1C7',
];
const diamondRules = diamonds.flatMap(cell => {
  const { row, col } = parseCellId(cell);
  return [
    new Given(circle.at(cell), UNSELECTED),
    new EqualSum(
      [rowValue(row - 1), columnValue(col - 1)],
      [cell]),
  ];
});

// A cage machine reads [shade flag, digit] pairs and accumulates only digits
// whose flag is selected. Passing the printed total as a bound kills branches
// as soon as they cannot satisfy the cage.
function shadedCage(total, cells) {
  const machine = NFA.encodeSpec({
    startState: { phase: 'flag', sum: 0 },
    transition: (state, value) => {
      if (state.phase === 'flag') {
        if (value !== SELECTED && value !== UNSELECTED) return undefined;
        return { phase: 'digit', sum: state.sum, selected: value === SELECTED };
      }
      const nextSum = state.sum + (state.selected ? value : 0);
      if (nextSum > total) return undefined;
      return { phase: 'flag', sum: nextSum };
    },
    accept: state => state.phase === 'flag' && state.sum === total,
  }, 9);
  const inputs = cells.flatMap(cell => [shade.at(cell), cell]);
  return new NFA(machine, `shaded-cage-${total}`, ...inputs);
}

const cages = [
  [3, ['R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6',
    'R6C4', 'R6C5', 'R6C6']],
  [10, ['R7C4', 'R7C5', 'R7C6']],
  [11, ['R1C8', 'R1C9', 'R2C9']],
  [8, ['R4C3', 'R5C3', 'R6C3']],
  [13, ['R8C1', 'R9C1', 'R9C2']],
  [16, ['R8C9', 'R9C8', 'R9C9']],
  [12, ['R2C4', 'R2C5', 'R2C6', 'R3C6']],
  [11, ['R4C7', 'R4C8', 'R5C8', 'R6C8']],
];

const firstCircle = circle.at(gridCells[0]);
const firstShade = shade.at(gridCells[0]);

return [
  new Shape('9x9'),
  circle.toVar('circle flags'),
  shade.toVar('shade flags'),
  rowValues,
  columnValues,
  boxValues,
  circle.makeReplicate(new Given(firstCircle, SELECTED, UNSELECTED)),
  shade.makeReplicate(new Given(firstShade, SELECTED, UNSELECTED)),
  ...rowRules,
  ...columnRules,
  ...boxRules,
  // The nine circles are the same cells seen by rows, columns, and boxes;
  // making the row values distinct therefore makes all circled digits distinct.
  new AllDifferent(...rows.map((_, i) => rowValue(i))),
  ...diamondRules,
  ...cages.map(([total, cells]) => shadedCage(total, cells)),
];
