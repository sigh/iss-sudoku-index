// Title: Evenly Odd
// Author: Pixeleon
// Video: https://www.youtube.com/watch?v=Sv2YCK5dE1E
// Source: https://sudokupad.app/j1t45qigg3

// Normal Sudoku rules apply. Each blue outside circle gives the sum of the
// first consecutive run of even digits read inward from that side, after any
// initial odd digits; each orange circle does the analogous thing for odd
// digits after any initial even digits. The clue tables below
// transcribe the colored outside circles from the drawn grid.
const bluePrefix = (sum, cells) => {
  const spec = NFA.encodeSpec({
    // seek skips the opposite parity; run collects the first matching run;
    // stopped ignores the remainder of the row or column.
    startState: { sum: 0, phase: 'seek' },
    transition: ({ sum: total, phase }, value) => {
      if (phase === 'stopped') return { sum: total, phase };
      if (value % 2 === 0 && total + value <= sum) {
        return { sum: total + value, phase: 'run' };
      }
      if (value % 2 === 0) return undefined;
      return { sum: total, phase: phase === 'seek' ? 'seek' : 'stopped' };
    },
    accept: ({ sum: total }) => total === sum,
    maxDepth: 9,
  }, 9);
  return new NFA(spec, `blue ${sum}`, cells);
};

const orangePrefix = (sum, cells) => {
  const spec = NFA.encodeSpec({
    // Its states have the same seek/run/stopped meanings as the blue machine.
    startState: { sum: 0, phase: 'seek' },
    transition: ({ sum: total, phase }, value) => {
      if (phase === 'stopped') return { sum: total, phase };
      if (value % 2 === 1 && total + value <= sum) {
        return { sum: total + value, phase: 'run' };
      }
      if (value % 2 === 1) return undefined;
      return { sum: total, phase: phase === 'seek' ? 'seek' : 'stopped' };
    },
    accept: ({ sum: total }) => total === sum,
    maxDepth: 9,
  }, 9);
  return new NFA(spec, `orange ${sum}`, cells);
};

const graph = cellGraph('9x9');
const blueLeft = [8, 4, 8, 6, 8, 12, 8, 8, 4];
const blueTop = [6, 8, 4, 2, 6, 8, 10, 2, 8];
const orangeRight = [10, 17, 15, 7, 17, 18, 1, 9, 12];
const orangeBottom = [10, 8, 7, 9, 11, 13, 7, 14, 6];

return [
  new Shape('9x9'),
  new Given('R1C3', 5),
  ...blueLeft.map((sum, row) => bluePrefix(sum, graph.row(row + 1))),
  ...blueTop.map((sum, col) => bluePrefix(sum, graph.column(col + 1))),
  ...orangeRight.map((sum, row) => orangePrefix(sum, graph.row(row + 1).reverse())),
  ...orangeBottom.map((sum, col) => orangePrefix(sum, graph.column(col + 1).reverse())),
];
