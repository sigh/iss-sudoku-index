// Title: First Group
// Author: Pixeleon
// Video: https://www.youtube.com/watch?v=uAOAfhQ7Xis
// Source: https://app.crackingthecryptic.com/N479qt47Gj

// Normal Sudoku with R7C5=7. Each coloured perimeter circle fixes the sum of
// the first inward run of its colour's parity; preceding opposite-parity digits
// are skipped and the run stops at its first opposite-parity digit. The tables
// are transcribed from the coloured circles.

const cellsInRow = row => Array.from({ length: 9 }, (_, i) => makeCellId(row, i + 1));
const cellsInColumn = col => Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, col));
const shape = new Shape('9x9');

function firstParityGroup(total, parity) {
  return NFA.encodeSpec({
    // `ended` records that the first opposite-parity digit has closed the run.
    startState: { sum: 0, started: false, ended: false },
    transition({ sum, started, ended }, value) {
      if (ended) return { sum, started, ended };
      if (value % 2 === parity) {
        const nextSum = sum + value;
        return nextSum <= total ? { sum: nextSum, started: true, ended: false } : undefined;
      }
      if (!started) return { sum, started, ended };
      return sum === total ? { sum, started, ended: true } : undefined;
    },
    accept: ({ sum, started }) => started && sum === total,
  }, shape);
}

const blueTop = [14, 4, 2, 2, 8, 4, 16, 6, 4];
const blueLeft = [4, 6, 8, 4, 2, 10, 18, 6, 14];
const orangeRight = [7, 5, 4, 3, 9, 11, 20, 5, 9];
const orangeBottom = [21, 1, 3, 6, 16, 9, 16, 9, 5];

const blueClues = [
  ...blueTop.map((total, i) => new NFA(firstParityGroup(total, 0), `blue C${i + 1}`, ...cellsInColumn(i + 1))),
  ...blueLeft.map((total, i) => new NFA(firstParityGroup(total, 0), `blue R${i + 1}`, ...cellsInRow(i + 1))),
  new NFA(firstParityGroup(2, 0), 'blue diagonal', 'R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'),
];

const orangeClues = [
  ...orangeRight.map((total, i) => new NFA(firstParityGroup(total, 1), `orange R${i + 1}`, ...cellsInRow(i + 1).reverse())),
  ...orangeBottom.map((total, i) => new NFA(firstParityGroup(total, 1), `orange C${i + 1}`, ...cellsInColumn(i + 1).reverse())),
  new NFA(firstParityGroup(1, 1), 'orange diagonal', 'R9C9', 'R8C8', 'R7C7', 'R6C6', 'R5C5', 'R4C4', 'R3C3', 'R2C2', 'R1C1'),
];

return [
  shape,
  new Given('R7C5', 7),
  ...blueClues,
  ...orangeClues,
];
