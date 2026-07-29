// Title: Take More U-Turns
// Author: Black_Doom
// Video: https://www.youtube.com/watch?v=Rk8Gubtt6SQ
// Source: https://sudokupad.app/hb6eo13lg1

// Normal Sudoku rules apply. Peach lines are entropic; each grey line is
// partitioned into contiguous groups summing to 10; circled cells equal the
// average of their arrow shafts. The one drawn black dot has a 1:2 ratio.

const entropicLines = [
  ['R3C5', 'R2C5', 'R2C4', 'R3C4', 'R4C4', 'R4C3', 'R4C2', 'R5C2', 'R5C3'],
  ['R3C8', 'R2C8', 'R2C9', 'R3C9'],
  ['R8C3', 'R8C2', 'R9C2', 'R9C3'],
  ['R6C6', 'R6C7', 'R6C8', 'R6C9', 'R7C9'],
  ['R8C5', 'R9C5', 'R9C4', 'R8C4', 'R7C4'],
  ['R5C4', 'R5C5', 'R4C5'],
];

const tenLines = [
  ['R3C2', 'R3C3', 'R2C3', 'R2C2', 'R2C1', 'R1C1', 'R1C2'],
  ['R7C8', 'R7C7', 'R8C7', 'R8C8', 'R8C9', 'R9C9', 'R9C8'],
];

const averageArrows = [
  ['R3C6', ['R2C6', 'R1C6', 'R1C5', 'R1C4']],
  ['R3C7', ['R2C7', 'R1C7', 'R1C8', 'R1C9']],
  ['R6C3', ['R6C2', 'R6C1', 'R5C1', 'R4C1']],
  ['R7C3', ['R7C2', 'R7C1', 'R8C1', 'R9C1']],
  ['R9C7', ['R9C6', 'R8C6', 'R7C6', 'R6C6']],
  ['R4C9', ['R4C8', 'R5C8']],
];

// The state is the current unfinished group total. Reaching 10 closes a group
// and resets to zero, so acceptance requires a complete partition of the line.
const tenLineMachine = NFA.encodeSpec({
  startState: 0,
  transition: (total, value) => {
    const next = total + value;
    if (next > 10) return undefined;
    return next === 10 ? 0 : next;
  },
  accept: total => total === 0,
}, 9);

return [
  new Shape('9x9'),
  ...entropicLines.map(cells => new Entropic(...cells)),
  ...tenLines.map(cells => new NFA(tenLineMachine, 'sum-10-partition', ...cells)),
  ...averageArrows.map(([circle, shaft]) => new Sum(0, ...shaft, [circle, -shaft.length])),
  new BlackDot('R1C2', 'R1C3'),
];
