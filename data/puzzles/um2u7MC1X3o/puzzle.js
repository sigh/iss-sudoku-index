// Title: Fallen Mast in a Storm
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=um2u7MC1X3o
// Source: https://sudokupad.app/68spijnw4s

// Rows and columns remain all-different, but each 3x3 box has exactly three
// distinct digits rather than the usual box all-different rule.
const graph = cellGraph('9x9');
const boxes = graph.boxes();
const boxCount = new Var('D', 'box-distinct-count', boxes.length);
const boxRules = boxes.flatMap((cells, i) => [
  new Given(boxCount.cell(i + 1), 3),
  new CountDistinct(boxCount.cell(i + 1), ...cells),
]);

// Each turquoise line chooses its own constant absolute difference.
const sameDifferenceSpec = NFA.encodeSpec({
  startState: { prev: null, diff: null },
  transition: ({ prev, diff }, value) => {
    if (prev === null) return { prev: value, diff: null };
    const nextDiff = Math.abs(value - prev);
    if (diff === null) return { prev: value, diff: nextDiff };
    if (nextDiff !== diff) return undefined;
    return { prev: value, diff };
  },
  accept: () => true,
}, 9);

const sameDifferenceLines = [
  ['R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9'],
  ['R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9'],
  ['R9C6', 'R8C7', 'R7C8', 'R6C9'],
  ['R5C3', 'R4C4', 'R3C5'],
  ['R9C9', 'R8C8', 'R7C7', 'R6C6', 'R5C5', 'R4C4', 'R3C3', 'R2C2', 'R1C1'],
];

// NoBoxes also makes ISS's RegionSumLine ignore box boundaries, so each drawn
// darker-blue line is expressed directly as equality between its box segments.
const regionSumSegments = [
  [
    ['R2C1', 'R3C1', 'R3C2'],
    ['R4C1', 'R5C2'],
  ],
  [
    ['R1C3'],
    ['R2C4', 'R1C5', 'R1C6'],
  ],
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  boxCount,
  ...boxRules,
  ...sameDifferenceLines.map(cells => new NFA(sameDifferenceSpec, 'same-difference', ...cells)),
  ...regionSumSegments.map(segments => new EqualSum(...segments)),
];
