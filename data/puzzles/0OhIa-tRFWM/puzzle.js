// Title: Region Summary
// Author: Erin Toler
// Video: https://www.youtube.com/watch?v=0OhIa-tRFWM
// Source: https://sudokupad.app/erin-toler/region-summary

// Box borders split each blue line into equal-sum segments. The shared sum is
// the two-digit number at the line's extreme ends, read in either direction.

const regionSummaryLines = [
  {
    endpoints: ['R2C6', 'R2C7'],
    segments: [
      ['R2C6', 'R3C6', 'R3C5', 'R3C4'],
      ['R4C5', 'R5C5', 'R4C6'],
      ['R5C7', 'R4C8'],
      ['R3C9', 'R3C8', 'R3C7', 'R2C7'],
    ],
  },
  {
    endpoints: ['R3C2', 'R5C6'],
    segments: [
      ['R3C2', 'R2C1', 'R3C1'],
      ['R4C2', 'R5C1', 'R5C2', 'R5C3'],
      ['R5C4', 'R6C5', 'R5C6'],
    ],
  },
  {
    endpoints: ['R2C5', 'R1C1'],
    segments: [
      ['R2C5', 'R1C6', 'R1C5', 'R1C4'],
      ['R1C3', 'R2C3', 'R3C3', 'R2C2', 'R1C1'],
    ],
  },
  {
    endpoints: ['R7C2', 'R5C9'],
    segments: [
      ['R7C2', 'R8C2', 'R9C2', 'R8C3'],
      ['R7C4', 'R7C5', 'R8C6', 'R7C6'],
      ['R7C7', 'R8C8', 'R9C9', 'R8C9', 'R7C8', 'R7C9'],
      ['R6C8', 'R6C9', 'R5C8', 'R5C9'],
    ],
  },
  {
    endpoints: ['R9C4', 'R8C5'],
    segments: [['R9C4', 'R8C4', 'R9C5', 'R8C5']],
  },
];

const blackDots = [
  ['R2C6', 'R2C7'],
  ['R5C5', 'R5C6'],
  ['R9C7', 'R9C8'],
];

const whiteDots = [['R6C6', 'R7C6']];

function endpointTotal([a, b], segment) {
  return new Or([
    new Sum(0, ...segment, [a, -10], [b, -1]),
    new Sum(0, ...segment, [a, -1], [b, -10]),
  ]);
}

const lineConstraints = regionSummaryLines.flatMap(({endpoints, segments}) => [
  ...(segments.length > 1 ? [new EqualSum(...segments)] : []),
  endpointTotal(endpoints, segments[0]),
]);

return [
  new Shape('9x9'),
  ...lineConstraints,
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
];
