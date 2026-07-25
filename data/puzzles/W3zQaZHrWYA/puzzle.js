// Title: Crystalline Entity
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=W3zQaZHrWYA
// Source: https://sudokupad.app/mdphj3roxm

// Normal sudoku rules apply (default row/column/box all-different).
//
// Rule 1 (counting circles/squares): a digit placed in a circle equals the
// number of times that digit appears among all circle-and-square-marked
// cells combined. Squares carry no such requirement of their own -- they
// only count towards the pooled total that circles are checked against.
//
// Rule 2 (arrows): digits along each arrow's arm sum to the digit in its
// attached circle. Every arrow's bulb cell is itself one of the marked
// circles from rule 1, so it is also a member of the pooled circle/square
// set.

// Circle- and square-marked cells, transcribed from the underlay art
// (white circle vs. white square backgrounds behind those cells).
const circleCells = [
  'R1C1', 'R1C3', 'R1C4', 'R1C6', 'R1C7', 'R1C9',
  'R3C1', 'R3C3', 'R3C4', 'R3C7',
  'R4C1', 'R4C3', 'R4C6', 'R4C7', 'R4C9',
  'R6C1', 'R6C3', 'R6C4', 'R6C6', 'R6C7', 'R6C9',
  'R7C3', 'R7C4', 'R7C6', 'R7C9',
  'R9C1', 'R9C3', 'R9C4', 'R9C6', 'R9C7', 'R9C9',
];
const squareCells = [
  'R2C2', 'R2C3', 'R2C5', 'R2C7', 'R2C9',
  'R3C9',
  'R4C4',
  'R5C2', 'R5C3', 'R5C5', 'R5C8', 'R5C9',
  'R7C1', 'R7C7',
  'R8C2', 'R8C4',
];

// Arrows, transcribed from the arrow waypoints: [bulb (circle) cell, ...arm
// cells]. Every bulb below is also listed in circleCells above.
const arrows = [
  ['R9C9', 'R8C8', 'R8C7'],
  ['R3C4', 'R4C5', 'R5C6'],
  ['R7C6', 'R6C5', 'R5C4'],
  ['R3C7', 'R2C6', 'R1C5'],
  ['R9C3', 'R8C3', 'R9C2'],
  ['R4C3', 'R3C2'],
];

const arrowConstraints = arrows.map(cells => new Arrow(...cells));

// Rule 1: for each digit d, scan the circle cells (segment 1) then the
// square cells (segment 2). `count` tracks total occurrences of d across
// both segments (clamped once it can only fail); `sawCircle` records
// whether some circle cell held d. Accept iff no circle held d, or the
// pooled count equals d exactly -- squares are counted but never gate
// acceptance on their own.
function crystalCountSpec(digit) {
  return NFA.encodeSpec({
    startState: { phase: 'circles', count: 0, sawCircle: false },
    transition: ({ phase, count, sawCircle }, value) => {
      if (value === SEGMENT_BREAK) return { phase: 'squares', count, sawCircle };
      const hit = value === digit;
      return {
        phase,
        count: Math.min(count + (hit ? 1 : 0), digit + 1),
        sawCircle: sawCircle || (hit && phase === 'circles'),
      };
    },
    accept: ({ sawCircle, count }) => !sawCircle || count === digit,
  }, 9, { multiSegment: true });
}

const crystalCounts = Array.from(
  { length: 9 },
  (_, i) => new NFA(
    crystalCountSpec(i + 1), `crystal count ${i + 1}`, circleCells, squareCells));

return [
  new Shape('9x9'),
  ...arrowConstraints,
  ...crystalCounts,
];
