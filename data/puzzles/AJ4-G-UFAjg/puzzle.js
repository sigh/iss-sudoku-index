// Title: Ace is High
// Author: Lake
// Video: https://www.youtube.com/watch?v=AJ4-G-UFAjg
// Source: https://app.crackingthecryptic.com/LPMhrPLMDQ

// Normal Sudoku rules apply. On each drawn grey line, contiguous groups total
// 10, with digit 1 valued as 10; repeats are allowed within and between groups.
const aceIsHigh = NFA.encodeSpec({
  startState: 0,
  transition: (sum, digit) => {
    const next = sum + (digit === 1 ? 10 : digit);
    if (next > 10) return undefined;
    return next === 10 ? 0 : next;
  },
  accept: sum => sum === 0,
}, 9);

// Grey-line paths transcribed from the drawn line geometry.
const lines = [
  ['R1C4', 'R2C3'],
  ['R1C5', 'R2C4', 'R3C3'],
  ['R2C5', 'R3C6'],
  ['R1C8', 'R2C8'],
  ['R3C9', 'R4C8', 'R4C9'],
  ['R3C7', 'R4C6', 'R5C5'],
  ['R4C4', 'R5C3'],
  ['R2C1', 'R3C1', 'R4C1', 'R5C2'],
  ['R7C1', 'R7C2', 'R7C3'],
  ['R8C2', 'R9C2'],
  ['R9C5', 'R8C4'],
  ['R6C4', 'R7C4'],
  ['R5C7', 'R6C7', 'R7C6'],
  ['R7C7', 'R7C8', 'R7C9'],
  ['R8C7', 'R9C7'],
  ['R8C9', 'R9C9'],
];

return [
  new Shape('9x9'),
  ...lines.map((cells, index) => new NFA(aceIsHigh, `grey line ${index + 1}`, ...cells)),
];
