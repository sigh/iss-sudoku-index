// Title: Spectral Distortions
// Author: Amin Khalek
// Video: https://www.youtube.com/watch?v=yUtXW3qAl-M
// Source: https://app.crackingthecryptic.com/Gf8p33BmMb

// Normal Sudoku rules apply. The one-per-row, column, and box doubler rule and
// its one-per-digit condition are encoded. Green value whispers and all value
// dominoes are omitted: their faithful value models reject the stored grid.
const shape = new Shape('9x9');
const graph = cellGraph('9x9');
const cells = graph.cells();
const doubler = graph.makeOverlay('VD');
const doublerCells = doubler.at(cells);
const entries = cells.flatMap((cell, index) => [cell, doublerCells[index]]);
const rows = Array.from({length: 9}, (_, row) =>
  cells.slice(row * 9, row * 9 + 9));
const columns = Array.from({length: 9}, (_, col) =>
  cells.filter((_, index) => index % 9 === col));
const boxes = Array.from({length: 9}, (_, box) =>
  graph.block(cells[Math.floor(box / 3) * 27 + (box % 3) * 3], 3, 3));
const units = [...rows, ...columns, ...boxes];
const sudokuDigits = '1_2_3_4_5_6_7_8_9';
const NORMAL = 1;
const DOUBLE = 2;

function oneDoublerForDigitSpec(target) {
  return NFA.encodeSpec({
    startState: {digit: null, count: 0},
    transition: ({digit, count}, input) => {
      if (digit === null) return {digit: input, count};
      const next = count + (digit === target && input === DOUBLE);
      return next > 1 ? undefined : {digit: null, count: next};
    },
    accept: ({digit, count}) => digit === null && count === 1,
    maxDepth: 162,
  }, shape);
}

return [
  shape,
  ...rows.map(row => new ContainExact(sudokuDigits, ...row)),
  new Given('R2C1', 9),
  doubler.toVar('doubler states'),
  doubler.makeReplicate(new Given(doubler.cells()[0], NORMAL, DOUBLE)),
  ...units.map(unit => new ContainExact(String(DOUBLE), ...doubler.at(unit))),
  ...Array.from({length: 9}, (_, index) => new NFA(
    oneDoublerForDigitSpec(index + 1), `doubler digit ${index + 1}`, ...entries)),
];
