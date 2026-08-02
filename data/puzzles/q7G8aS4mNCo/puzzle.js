// Title: Heisenberg
// Author: randall
// Video: https://www.youtube.com/watch?v=q7G8aS4mNCo
// Source: https://app.crackingthecryptic.com/sudoku/FQQf6HQfm7

// Rules encoded: normal sudoku; eight arrows (the arm sums to the circled
// digit); six two-cell-arm Build-your-own X-Sum clues; and the inequality
// mark, whose pointed end faces the smaller digit.

// Each two-cell arrow arm is a two-digit clue: the arm cell nearest the circle
// is the tens digit and the arrowhead cell is the units digit. For each possible
// X that fits the remaining ray, the first ray cell is X and those first X ray
// cells sum to the two-digit clue.
function buildYourOwnXSum(tens, units, ray) {
  return new Or(ray.map((_, index) => {
    const count = index + 1;
    return new And([
      new Given(ray[0], count),
      new Sum(0, ...ray.slice(0, count), [tens, -10], [units, -1]),
    ]);
  }));
}

function oneDigitBuildYourOwnXSum(clue, ray) {
  return new Or(ray.map((_, index) => {
    const count = index + 1;
    return new And([
      new Given(ray[0], count),
      new EqualSum(ray.slice(0, count), [clue]),
    ]);
  }));
}

return [
  new Shape('9x9'),

  // Arrow paths transcribed from the eight payload arrows.
  new Arrow('R9C2', 'R9C1', 'R8C2'),
  new Arrow('R3C5', 'R2C6', 'R3C6'),
  new Arrow('R8C9', 'R9C9', 'R8C8'),
  new Arrow('R1C1', 'R2C2', 'R3C3'),
  new Arrow('R1C8', 'R2C8', 'R3C7'),
  new Arrow('R5C9', 'R4C9', 'R5C8'),
  new Arrow('R7C3', 'R6C4'),
  new Arrow('R7C7', 'R6C6'),

  // Arrow arms are Build-your-own X-Sums; six two-cell arms spell two-digit
  // clues, while the two one-cell arms give one-digit clues.
  buildYourOwnXSum('R9C1', 'R8C2', ['R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9']),
  buildYourOwnXSum('R2C6', 'R3C6', ['R4C6', 'R5C6', 'R6C6', 'R7C6', 'R8C6', 'R9C6']),
  buildYourOwnXSum('R9C9', 'R8C8', ['R7C7', 'R6C6', 'R5C5', 'R4C4', 'R3C3', 'R2C2', 'R1C1']),
  buildYourOwnXSum('R2C2', 'R3C3', ['R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9']),
  buildYourOwnXSum('R2C8', 'R3C7', ['R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1']),
  buildYourOwnXSum('R4C9', 'R5C8', ['R6C7', 'R7C6', 'R8C5', 'R9C4']),
  oneDigitBuildYourOwnXSum('R6C4', ['R5C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9']),
  oneDigitBuildYourOwnXSum('R6C6', ['R5C5', 'R4C4', 'R3C3', 'R2C2', 'R1C1']),

  // The `<` overlay points toward R4C1, the smaller digit.
  new GreaterThan('R4C2', 'R4C1'),
];
