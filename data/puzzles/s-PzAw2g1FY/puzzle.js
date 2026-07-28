// Title: Paths Through the Mist
// Author: Chilly
// Video: https://www.youtube.com/watch?v=s-PzAw2g1FY
// Source: https://sudokupad.app/i0jnn0206n

// Rows, columns, and unknown orthogonally connected nine-cell regions each
// contain 1-9. An arrow digit counts region borders along its drawn ray, and a
// circle digit counts the cells visible in its own region along the four rays.
const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');
const DIRS = { N: [-1, 0], S: [1, 0], W: [0, -1], E: [0, 1] };

// Drawn black arrowheads, transcribed as [cell, direction].
const arrows = [
  ['R1C6', 'S'], ['R2C6', 'N'], ['R3C6', 'N'], ['R4C5', 'N'], ['R4C5', 'S'],
  ['R5C1', 'N'], ['R5C3', 'S'], ['R5C4', 'N'], ['R5C5', 'W'], ['R5C5', 'S'],
  ['R6C2', 'E'], ['R6C4', 'W'], ['R6C4', 'E'], ['R7C3', 'W'], ['R7C3', 'S'],
  ['R8C2', 'W'], ['R8C2', 'S'], ['R8C4', 'E'], ['R8C5', 'N'], ['R9C3', 'W'],
  ['R9C5', 'N'],
];
const circles = [
  'R1C1', 'R1C7', 'R1C8', 'R2C3', 'R3C7', 'R5C2', 'R5C6', 'R6C1', 'R7C1',
  'R7C3', 'R8C4', 'R9C1', 'R9C5', 'R9C8',
];

// State is {target, previousRegion, borders}; labels change exactly at borders.
const borderCountNfa = NFA.encodeSpec({
  startState: { target: null, previousRegion: null, borders: 0 },
  transition(state, value) {
    const { target, previousRegion, borders } = state;
    if (target === null) return { target: value, previousRegion: null, borders: 0 };
    if (previousRegion === null) return { target, previousRegion: value, borders };
    const nextBorders = borders + (value === previousRegion ? 0 : 1);
    return nextBorders > target ? undefined : {
      target, previousRegion: value, borders: nextBorders,
    };
  },
  accept: ({ target, borders }) => target !== null && borders === target,
  maxDepth: 9,
}, 9);

const arrowConstraints = arrows.map(([origin, direction]) => {
  const ray = cc.ray(cc.at(origin), ...DIRS[direction]);
  return new NFA(borderCountNfa, 'border-count', origin, ...ray);
});
// A circle counts the contiguous same-region run in each orthogonal direction,
// with its shared origin counted once.
const circleConstraints = circles.map(cell => new ChaosArrow(cell, 0));

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  ...arrowConstraints,
  ...circleConstraints,
];
