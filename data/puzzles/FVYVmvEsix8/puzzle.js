// Title: Ten to N
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=FVYVmvEsix8
// Source: https://sudokupad.app/6si77ldvw5

// Normal Sudoku rules apply. Black dots are 1:2 ratios. Each listed outside
// 10 clue sums the digits before digit N in its numbered row or column, read
// from that clue's edge; digit N is not part of the sum.
const nSum = (n, cells) => new NFA(NFA.encodeSpec({
  startState: 0,
  transition: (sum, value) => {
    if (sum === 'done') return 'done';
    if (value === n) return sum === 10 ? 'done' : undefined;
    const next = sum + value;
    return next <= 10 ? next : undefined;
  },
  accept: sum => sum === 'done',
}, 9), `10 before ${n}`, cells);

// These ordered rays are transcribed from the drawn outside 10 clue badges.
const nSums = [
  nSum(3, ['R1C3', 'R2C3', 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R8C3', 'R9C3']),
  nSum(8, ['R1C8', 'R2C8', 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8', 'R9C8']),
  nSum(2, ['R9C2', 'R8C2', 'R7C2', 'R6C2', 'R5C2', 'R4C2', 'R3C2', 'R2C2', 'R1C2']),
  nSum(4, ['R9C4', 'R8C4', 'R7C4', 'R6C4', 'R5C4', 'R4C4', 'R3C4', 'R2C4', 'R1C4']),
  nSum(6, ['R9C6', 'R8C6', 'R7C6', 'R6C6', 'R5C6', 'R4C6', 'R3C6', 'R2C6', 'R1C6']),
  nSum(7, ['R9C7', 'R8C7', 'R7C7', 'R6C7', 'R5C7', 'R4C7', 'R3C7', 'R2C7', 'R1C7']),
  nSum(3, ['R3C1', 'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9']),
  nSum(4, ['R4C1', 'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8', 'R4C9']),
  nSum(5, ['R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9']),
  nSum(6, ['R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8', 'R6C9']),
  nSum(7, ['R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R7C9']),
  nSum(8, ['R8C1', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R8C9']),
  nSum(9, ['R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9']),
  nSum(2, ['R2C9', 'R2C8', 'R2C7', 'R2C6', 'R2C5', 'R2C4', 'R2C3', 'R2C2', 'R2C1']),
];

return [
  new Shape('9x9'),
  new BlackDot('R2C6', 'R3C6'),
  new BlackDot('R3C8', 'R4C8'),
  new BlackDot('R4C8', 'R4C9'),
  ...nSums,
];
