// Title: Heated Arrow Battle
// Author: TheRiddler
// Video: https://www.youtube.com/watch?v=RLsKZ3usSQo
// Source: https://tinyurl.com/rdbyr7v7

// Standard 9x9 sudoku. Digits along an arrow sum to the circled digit
// (bulb). Digits on the thermometer strictly increase from the bulb.
//
// Two of the eleven arrow circles (bulbs R8C3 and R1C1) each feed two
// separate arm strokes -- a branching arrow. Per iss-constraints, a line
// drawn as several strokes is encoded per drawn segment: each arm is its
// own Arrow sharing the bulb cell, so it sums to the bulb independently of
// the other arm.

const shape = new Shape('9x9');

// Arrow bulb + arm cells, transcribed from the drawn arrow circles.
const ARROWS = [
  ['R1C9', ['R1C8', 'R1C7', 'R2C6']],
  ['R7C1', ['R7C2', 'R7C3', 'R8C4']],
  ['R7C9', ['R7C8', 'R7C7', 'R8C6']],
  ['R6C1', ['R6C2', 'R6C3']],
  ['R6C9', ['R6C8', 'R6C7']],
  ['R3C9', ['R4C8', 'R4C7']],
  ['R4C1', ['R5C2', 'R5C3']],
  ['R8C7', ['R9C6']],
  ['R8C3', ['R9C4']],
  ['R8C3', ['R9C2', 'R9C1']],
  ['R1C1', ['R1C2', 'R1C3', 'R2C4']],
  ['R1C1', ['R2C2', 'R3C3']],
  ['R5C7', ['R6C6']],
];

const arrowConstraints = ARROWS.map(
  ([bulb, arm]) => new Arrow(bulb, ...arm));

// Thermometer, bulb-first.
const THERMO = ['R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5'];
const thermoConstraint = new Thermo(...THERMO);

return [
  shape,
  ...arrowConstraints,
  thermoConstraint,
];
