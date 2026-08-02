// Title: Circular Unreasoning
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=fo-xEJXVL0I
// Source: https://sudokupad.app/4mtPGFb6dm

// Normal Sudoku applies. Each shaft sums to its circle. For every digit that
// occurs in a circle or on a shaft, its occurrences are exactly the number of
// circles or shafts, respectively, that do not contain it.
const arrows = [
  ['R9C4', 'R9C3', 'R9C2', 'R9C1'],
  ['R4C3', 'R3C3', 'R2C3', 'R1C3'],
  ['R1C8', 'R2C7', 'R3C8', 'R2C9'],
  ['R7C8', 'R8C7', 'R9C8', 'R8C9'],
  ['R2C6', 'R1C5', 'R2C4', 'R3C5'],
  ['R9C5', 'R8C4', 'R7C5', 'R8C6'],
  ['R4C4', 'R4C5', 'R5C4', 'R6C4'],
  ['R5C7', 'R6C7', 'R5C8', 'R4C8'],
  ['R8C2', 'R7C2', 'R6C2', 'R5C2'],
  ['R2C1', 'R3C1', 'R4C1', 'R5C1'],
]; // Transcribed from the ten circle overlays and their arrow waypoints.

const circles = arrows.map(([circle]) => circle);

function occurrenceCount(digit) {
  const required = 10 - digit;
  return NFA.encodeSpec({
    startState: { count: 0 },
    transition: ({ count }, value) => {
      const next = count + (value === digit ? 1 : 0);
      return next > required ? undefined : { count: next };
    },
    accept: ({ count }) => count === 0 || count === required,
    maxDepth: 10,
  }, 9);
}

function shaftContainmentCount(digit) {
  const required = 10 - digit;
  return NFA.encodeSpec({
    // `seen` records whether the current arrow shaft contains this digit;
    // segment breaks commit that one shaft to the count.
    startState: { count: 0, seen: false },
    transition: ({ count, seen }, value) => {
      if (value === SEGMENT_BREAK) {
        const next = count + (seen ? 1 : 0);
        return next > required ? undefined : { count: next, seen: false };
      }
      return { count, seen: seen || value === digit };
    },
    accept: ({ count, seen }) => {
      const total = count + (seen ? 1 : 0);
      return total === 0 || total === required;
    },
    maxDepth: 39,
  }, 9, { multiSegment: true });
}

const circleCounts = Array.from({ length: 9 }, (_, i) =>
  new NFA(occurrenceCount(i + 1), `circle-${i + 1}`, ...circles));
const shaftCounts = Array.from({ length: 9 }, (_, i) =>
  new NFA(shaftContainmentCount(i + 1), `shaft-${i + 1}`, ...arrows.map(arrow => arrow.slice(1))));

return [
  new Shape('9x9'),
  ...arrows.map(arrow => new Arrow(...arrow)),
  ...circleCounts,
  ...shaftCounts,
];
