// Title: Ren Ban Sandwich Sudoku
// Author: Rocky Roer
// Video: https://www.youtube.com/watch?v=K5Pyq4XjVMM
// Source: https://app.crackingthecryptic.com/sudoku/m2gNRfdF24

// Rules encoded here:
//  - Normal sudoku: each row, column and 3x3 box holds 1-9 once each. There are
//    no given digits.
//  - Numbers outside the grid, which are not printed and must be deduced, are
//    the sums of the digits sandwiched between the 1 and the 9 in that row or
//    column.
//  - Each purple line holds a set of non-repeating consecutive integers, in any
//    order; an integer is any whole number including zero.
// Nothing is omitted.
//
// The source canvas is 11x11: a 9x9 sudoku inside a one-cell frame that carries
// no sudoku rule. The frame is where the outside numbers are written, and some
// purple strokes run over frame cells as well as sudoku cells, so a frame value
// is a member of its line's consecutive run alongside ordinary digits.
//
// A sandwich sum runs from 0 (the 1 and the 9 adjacent) to 35 (2+3+4+5+6+7+8
// between them), which is past any cell's value range, so each one is carried as
// a tens cell and a units cell and read as 10*tens + units.

const SANDWICH_MAX = 35;  // 2+3+4+5+6+7+8

// Values 0-12: sudoku digits 1-9, plus 0 and the ren-ban offsets up to 12 that
// the 13-cell line below needs.
const shape = new Shape('9x9', '0-12');
const graph = cellGraph(shape);

const rangeI = (from, to) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

const DIGITS = rangeI(1, 9);
const TENS = rangeI(0, Math.floor(SANDWICH_MAX / 10));
const UNITS = rangeI(0, 9);

// The purple strokes, in payload order, as the cells each one covers.
// `R#C#` is a sudoku cell; `top#`/`bot#` is the frame cell against that column
// and `left#`/`right#` the frame cell against that row.
const LINES = [
  ['top2', 'top3', 'top4', 'R1C4'],
  ['top5', 'R1C5', 'R2C5', 'R3C5'],
  ['R3C8', 'R3C9'],
  ['bot8', 'bot9'],
  ['R5C7', 'R5C8', 'R5C9', 'right5'],
  ['R4C5', 'R5C5', 'R5C4'],
  ['R7C6', 'R8C6', 'R9C6', 'bot6'],
  ['bot5', 'R9C5', 'R8C5', 'R7C5', 'R7C4', 'R7C3',
    'R6C3', 'R5C3', 'R5C2', 'R5C1', 'left5', 'left4', 'left3'],
  ['left6', 'left7'],
  ['left9', 'R9C1', 'R9C2'],
];

// Which row or column a frame cell reports on. A row or column has one sandwich
// sum however many sides it is clued from, so `top5` and `bot5` are two cells
// showing the one column-5 total, as are `left5` and `right5` for row 5.
const frameTarget = (name) => {
  const m = /^(top|bot|left|right)([1-9])$/.exec(name);
  return m === null ? null
    : (m[1] === 'top' || m[1] === 'bot' ? 'col' : 'row') + m[2];
};

// Only the rows and columns a stroke actually touches carry a written number.
const sumTargets = [...new Set(
  LINES.flat().map(frameTarget).filter(t => t !== null))];
const targetCells = (target) => (
  target.startsWith('row') ? graph.row(+target.slice(3))
    : graph.column(+target.slice(3)));

const sumTens = new Var('ST', 'Sandwich tens', sumTargets.length);
const sumUnits = new Var('SU', 'Sandwich units', sumTargets.length);
const sumCells = (target) => {
  const n = sumTargets.indexOf(target) + 1;
  return [sumTens.cell(n), sumUnits.cell(n)];
};
// The same total as summable terms: 10*tens + units.
const sumValueTerms = (target) => {
  const [tensCell, unitsCell] = sumCells(target);
  return [[tensCell, 10], unitsCell];
};

// Reads [tens, units, then the nine cells of the row or column]. `before` scans
// up to whichever of 1/9 comes first; `inside` spends the declared total one
// digit at a time and requires it to reach exactly 0 as the other of 1/9 closes
// the sandwich; `after` is the accepting tail. Carrying the remainder rather
// than a running sum keeps the state count at the total's range.
const sandwichSpec = NFA.encodeSpec({
  startState: { phase: 'tens' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'tens':
        return value <= TENS.at(-1) ? { phase: 'units', tens: value } : undefined;
      case 'units': {
        if (value > UNITS.at(-1)) return undefined;
        const total = 10 * state.tens + value;
        return total <= SANDWICH_MAX ? { phase: 'before', total } : undefined;
      }
      case 'before':
        return (value === 1 || value === 9)
          ? { phase: 'inside', remaining: state.total } : state;
      case 'inside':
        if (value === 1 || value === 9) {
          return state.remaining === 0 ? { phase: 'after' } : undefined;
        }
        return state.remaining >= value
          ? { phase: 'inside', remaining: state.remaining - value } : undefined;
      case 'after':
        return state;
    }
  },
  accept: (state) => state.phase === 'after',
  maxDepth: 11,  // two clue cells plus the nine line cells
}, shape);

// A ren-ban line whose values are all sudoku digits is the plain constraint.
const plainLines = LINES.filter(line => line.every(c => frameTarget(c) === null));

// A line that includes a frame cell has to compare a two-cell sandwich total
// against ordinary digits, so it is stated as "value = min + offset": one
// minimum per line (again as tens and units, since a frame-only line's minimum
// can itself exceed the value range), one offset cell per line cell restricted
// to 0..n-1, and all offsets different. n distinct offsets drawn from n values
// are a permutation of 0..n-1, which is exactly a run of n consecutive values
// with no repeats.
const framedLines = LINES.filter(line => line.some(c => frameTarget(c) !== null));
const minTens = new Var('MT', 'Ren-ban minimum tens', framedLines.length);
const minUnits = new Var('MU', 'Ren-ban minimum units', framedLines.length);
const offsetVars = framedLines.map((line, i) => new Var(
  'O' + String.fromCharCode('A'.charCodeAt(0) + i),
  `Ren-ban offsets ${i + 1}`, line.length));

const framedLineConstraints = framedLines.flatMap((line, i) => {
  const offsets = offsetVars[i];
  const minTerms = [[minTens.cell(i + 1), -10], [minUnits.cell(i + 1), -1]];
  return [
    offsets,
    ...offsets.cells().map(c => new Given(c, ...rangeI(0, line.length - 1))),
    new AllDifferent(...offsets.cells()),
    ...line.map((name, j) => {
      const target = frameTarget(name);
      const valueTerms = target === null ? [name] : sumValueTerms(target);
      return new Sum(
        0, ...valueTerms, ...minTerms, [offsets.cell(j + 1), -1]);
    }),
  ];
});

return [
  shape,
  // The sudoku cells hold digits, not the extra values the shape carries.
  graph.makeReplicate(new Given(graph.cells()[0], ...DIGITS)),

  sumTens,
  sumUnits,
  ...sumTargets.flatMap((target, i) => [
    new Given(sumTens.cell(i + 1), ...TENS),
    new Given(sumUnits.cell(i + 1), ...UNITS),
    new NFA(sandwichSpec, `sandwich ${target}`,
      ...sumCells(target), ...targetCells(target)),
  ]),

  ...plainLines.map(line => new Renban(...line)),

  minTens,
  minUnits,
  ...framedLines.flatMap((_, i) => [
    new Given(minTens.cell(i + 1), ...TENS),
    new Given(minUnits.cell(i + 1), ...UNITS),
  ]),
  ...framedLineConstraints,
];
