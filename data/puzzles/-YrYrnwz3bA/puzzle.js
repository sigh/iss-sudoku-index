// Title: Rigmarole
// Author: Nicolas Duhail
// Video: https://www.youtube.com/watch?v=-YrYrnwz3bA
// Source: https://sudokupad.app/g4olqfawhb

// Outside clues sum the same-parity prefix of the indicated diagonal. The first
// opposite-parity digit stops the sum and is not included.
const parityPrefixSum = (target) => NFA.encodeSpec({
  startState: { parity: null, sum: 0, done: false },
  transition: ({ parity, sum, done }, value) => {
    if (done) return { parity, sum, done };

    const valueParity = value % 2;
    if (parity === null) {
      if (value > target) return [];
      return { parity: valueParity, sum: value, done: false };
    }

    if (valueParity !== parity) {
      if (sum === target) return { parity, sum, done: true };
      return [];
    }

    const nextSum = sum + value;
    if (nextSum > target) return [];
    return { parity, sum: nextSum, done: false };
  },
  accept: ({ sum, done }) => done || sum === target,
}, 9);

const ray = (start, dr, dc) => {
  const { row, col } = parseCellId(start);
  const cells = [];
  for (let r = row, c = col; r >= 1 && r <= 9 && c >= 1 && c <= 9; r += dr, c += dc) {
    cells.push(makeCellId(r, c));
  }
  return cells;
};

const clues = [
  [11, "R4C1", 1, 1],
  [22, "R9C2", -1, 1],
  [34, "R9C7", -1, -1],
  [28, "R1C5", 1, 1],
  [24, "R1C6", 1, -1],
  [16, "R1C3", 1, 1],
  [28, "R3C9", 1, -1],
  [20, "R9C1", -1, 1],
  [16, "R9C3", -1, 1],
  [10, "R7C9", -1, -1],
];

return [
  new Shape("9x9"),
  ...clues.map(([target, start, dr, dc]) =>
    new NFA(parityPrefixSum(target), `parity prefix ${target}`, ...ray(start, dr, dc))),
];
