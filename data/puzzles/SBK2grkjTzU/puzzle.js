// Title: Fillomenon
// Author: Darth Paradox
// Video: https://www.youtube.com/watch?v=SBK2grkjTzU
// Source: https://sudokupad.app/darth-paradox/fillomenon

// Rules encoded here:
//   Nine solver-placed, non-overlapping 3x3 Sudoku boxes hold 1-9 once; their
//   digits do not repeat in a grid row or column. Outside-box sum labels count
//   only the cells not in a box. Arrows, Kropki dots, and purple renbans apply
//   to the displayed digits. The Fillomino-region rules are omitted.
// The source's drawn 3x3 boxes are unknown. VL gives a cell's position 1-9
// inside a box, or 0 outside; its row/column transitions force each label-1
// cell to be the top left of one 3x3 block.
const SIZE = 13;
const shape = new Shape('13x13', '0-12');
const grid = cellGraph('13x13');
const value = grid.makeOverlay('VV');
const label = grid.makeOverlay('VL');
const valueVars = value.toVar('displayed digits');
const labelVars = label.toVar('box positions');
const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const digitDomain = value.makeReplicate(new Given(value.cells()[0], ...digits));

const rowOffset = a => ((a - 1) / 3) | 0;
const colOffset = a => (a - 1) % 3;
const labelAcross = Pair.fnToKey((a, b) =>
  a === 0 ? (b === 0 || colOffset(b) === 0)
    : colOffset(a) < 2 ? b === a + 1
      : (b === 0 || colOffset(b) === 0), shape);
const labelDown = Pair.fnToKey((a, b) =>
  a === 0 ? (b === 0 || rowOffset(b) === 0)
    : rowOffset(a) < 2 ? b === a + 3
      : (b === 0 || rowOffset(b) === 0), shape);

const labelRuns = [
  ...grid.rows().map((cells, i) => new Pair(labelAcross, `across${i + 1}`, ...label.at(cells))),
  ...grid.columns().map((cells, i) => new Pair(labelDown, `down${i + 1}`, ...label.at(cells))),
];
const labelBorders = [
  ...label.at(grid.row(1)).map(c => new Given(c, 0, 1, 2, 3)),
  ...label.at(grid.row(SIZE)).map(c => new Given(c, 0, 7, 8, 9)),
  ...label.at(grid.column(1)).map(c => new Given(c, 0, 1, 4, 7)),
  ...label.at(grid.column(SIZE)).map(c => new Given(c, 0, 3, 6, 9)),
];
const nineBoxes = new ContainExact(Array(9).fill(1).join('_'), ...label.cells());
const boxDigits = grid.cells().flatMap(topLeft => {
  const block = grid.block(topLeft, 3, 3);
  return block === null ? [] : [new Or([
    new Given(label.at(topLeft), 0, 2, 3, 4, 5, 6, 7, 8, 9),
    new AllDifferent(...value.at(block)),
  ])];
});
// One compact scan per digit avoids a 9-bit NFA state combined with a pending
// digit. A scan rejects its second occurrence inside a Sudoku box; outside
// Fillomino cells are deliberately ignored.
function sudokuNoRepeat(digit) {
  return NFA.encodeSpec({
    startState: { phase: 'digit', seen: false },
    transition: (s, x) => {
      if (s.phase === 'digit') return { phase: 'label', seen: s.seen, matches: x === digit };
      if (s.matches && x !== 0) return s.seen ? undefined : { phase: 'digit', seen: true };
      return { phase: 'digit', seen: s.seen };
    },
    accept: s => s.phase === 'digit',
    maxDepth: SIZE * 2,
  }, shape);
}
const rowsAndCols = grid.rows().flatMap((cells, i) => digits.map(d =>
  new NFA(sudokuNoRepeat(d), `row${i + 1}digit${d}`,
    ...cells.flatMap(c => [value.at(c), label.at(c)])))).concat(
  grid.columns().flatMap((cells, i) => digits.map(d =>
    new NFA(sudokuNoRepeat(d), `col${i + 1}digit${d}`,
      ...cells.flatMap(c => [value.at(c), label.at(c)])))));

// Each outside clue scans [digit, box-position] pairs and adds the digit only
// when box-position is 0, exactly as the rule excludes Sudoku digits. The
// drawn > and < signs are inequality clues; bare numbers are exact totals.
function outsideSumMachine(relation, target) {
  return NFA.encodeSpec({
    startState: { phase: 'digit', sum: 0 },
    transition: (s, x) => {
      if (s.phase === 'digit') return { phase: 'label', sum: s.sum, digit: x };
      const sum = s.sum + (x === 0 ? s.digit : 0);
      if (relation === '<' && sum >= target) return undefined;
      if (relation === '=') return sum <= target ? { phase: 'digit', sum } : undefined;
      return { phase: 'digit', sum: Math.min(sum, target + 1) };
    },
    accept: s => s.phase === 'digit' && (
      relation === '=' ? s.sum === target : relation === '<' ? s.sum < target : s.sum > target),
    maxDepth: SIZE * 2,
  }, shape);
}
const OUTSIDE_SUMS = [
  ['>', 90, grid.column(1)], ['=', 24, grid.column(5)],
  ['=', 6, grid.column(6)], ['=', 4, grid.column(7)], ['<', 15, grid.column(8)],
  ['>', 83, grid.row(1)], ['=', 36, grid.row(4)], ['>', 82, grid.row(13)],
];
const outsideSums = OUTSIDE_SUMS.map(([relation, total, cells], i) =>
  new NFA(outsideSumMachine(relation, total), `outside${i + 1}`,
    ...cells.flatMap(c => [value.at(c), label.at(c)])));

// Arrow and dot coordinates are transcribed from their separate payload entries.
const arrows = [
  ['R3C8', 'R2C7', 'R3C7', 'R4C7'], ['R9C3', 'RaC3', 'RbC4', 'RcC4'],
  ['R5Cb', 'R5Ca', 'R5C9', 'R4C8'], ['R6Cc', 'R7Cd'],
  ['R8C9', 'R8Ca', 'R8Cb'], ['RaCd', 'R9Cc', 'R9Cb'],
  ['R4C3', 'R5C4', 'R5C5'], ['R3C4', 'R4C4', 'R4C5'],
  ['R9C5', 'RaC5', 'R9C4'],
].map(cells => new Arrow(...value.at(cells)));
const whiteDots = [
  ['R1C8', 'R2C8'], ['R2C8', 'R3C8'], ['R5C1', 'R6C1'], ['R9C2', 'RaC2'],
  ['RaC4', 'RbC4'], ['RbC3', 'RcC3'], ['RbC5', 'RcC5'],
  ['R4C3', 'R4C4'], ['R6Cb', 'R6Cc'], ['R8C5', 'R8C6'],
].map(cells => new WhiteDot(...value.at(cells)));
const blackDots = [
  ['R5C5', 'R6C5'], ['R7C6', 'R7C7'], ['R7C7', 'R7C8'],
].map(cells => new BlackDot(...value.at(cells)));
const renbans = [
  ['R9Cc', 'RaCc', 'RbCb'], ['RaC2', 'RbC2', 'RcC2'],
].map(cells => new Renban(...value.at(cells)));

// The main 13x13 grid is only a host for the Var overlays; pin its unrelated
// row/column Latin square and remove its default boxes.
const filler = grid.cells().map(cell => {
  const { row, col } = parseCellId(cell);
  return new Given(cell, (row - 1 + col - 1) % SIZE);
});
return [
  shape, new NoBoxes(), ...filler, valueVars, labelVars,
  digitDomain,
  ...labelRuns, ...labelBorders, nineBoxes, ...boxDigits,
  ...rowsAndCols,
  ...outsideSums,
  ...arrows,
  ...whiteDots, ...blackDots, ...renbans,
];
