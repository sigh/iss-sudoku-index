// Title: Rising Regions
// Author: Derek LeClair
// Video: https://www.youtube.com/watch?v=GSyQiFEF_3w
// Source: https://sudokupad.app/pyvvk21c84

// Normal 9x9 sudoku. The blue line is split by 3x3 box borders into segments.
// Segment sums strictly increase along the line, and adjacent segments share no
// digits. Black Kropki dots mark 2:1 pairs.

const blueSegments = [
  ['R6C1', 'R5C1', 'R4C1', 'R4C2'],
  ['R3C2', 'R3C3'],
  ['R2C4', 'R2C5', 'R2C6'],
  ['R2C7', 'R2C8', 'R3C8'],
  ['R4C8', 'R5C8', 'R5C7', 'R4C7'],
  ['R4C6', 'R5C5', 'R6C4'],
  ['R6C3', 'R6C2'],
  ['R7C1', 'R8C1', 'R9C2', 'R9C3'],
  ['R9C4', 'R9C5', 'R8C5', 'R8C6'],
  ['R8C7', 'R8C8', 'R8C9', 'R7C9'],
  ['R6C9', 'R5C9', 'R4C9'],
];

const risingSumPair = NFA.encodeSpec({
  startState: { firstSum: null, sum: 0 },
  transition: ({ firstSum, sum }, value) => {
    if (value === SEGMENT_BREAK) {
      if (firstSum !== null) return undefined;
      return { firstSum: sum, sum: 0 };
    }
    const nextSum = sum + value;
    if (nextSum > 45) return undefined;
    return { firstSum, sum: nextSum };
  },
  accept: ({ firstSum, sum }) => firstSum !== null && sum > firstSum,
}, 9, { multiSegment: true });

const blueLineConstraints = [];
for (let i = 0; i < blueSegments.length - 1; i++) {
  blueLineConstraints.push(
    new NFA(risingSumPair, 'rising-sum', blueSegments[i], blueSegments[i + 1]));
  blueLineConstraints.push(
    new AllDifferent(...blueSegments[i], ...blueSegments[i + 1]));
}

return [
  new Shape('9x9'),

  ...blueLineConstraints,

  new BlackDot('R3C5', 'R3C6'),
  new BlackDot('R6C5', 'R7C5'),
  new BlackDot('R2C9', 'R3C9'),
  new BlackDot('R1C2', 'R2C2'),
];
