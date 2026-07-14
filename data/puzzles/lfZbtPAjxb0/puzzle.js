// Title: Triple Trouble
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=lfZbtPAjxb0
// Source: https://sudokupad.app/3mjyxrx5og

// Each box may only contain three distinct digits: a Var per box holds that
// count and CountDistinct ties it to the box's nine cells. NoBoxes drops the
// default box all-different, since a box's cells are no longer pairwise
// distinct (rows/columns keep their normal all-different groups).
const boxes = cellGraph('9x9').boxes();
const boxCount = new Var('D', 'box-distinct-count', boxes.length);
const boxRules = boxes.flatMap((cells, i) => [
  new Given(boxCount.cell(i + 1), 3),
  new CountDistinct(boxCount.cell(i + 1), ...cells),
]);

// Arrows: bulb cell first, then arm cells (sum of arm = bulb digit).
const arrows = [
  new Arrow('R4C6', 'R3C7', 'R2C8', 'R1C9'),
  new Arrow('R3C3', 'R2C3', 'R1C2', 'R2C1', 'R3C2'),
  new Arrow('R8C8', 'R9C7', 'R9C8', 'R8C9'),
];

// German whispers: adjacent difference >= 5.
const whispers = [
  new Whisper(5, 'R6C3', 'R5C2', 'R4C2'),
  new Whisper(5, 'R4C5', 'R3C6'),
];

// Nabners: no two cells on the line (any pair, not just adjacent ones) share
// a value or are consecutive.
const nabnerKey = PairX.fnToKey((a, b) => a !== b && Math.abs(a - b) !== 1, 9);
const nabnerLines = [
  ['R7C1', 'R8C2', 'R9C3'],
  ['R5C1', 'R6C2', 'R7C3'],
  ['R9C6', 'R8C7', 'R7C8', 'R6C9'],
];
const nabners = nabnerLines.map(
  cells => new PairX(nabnerKey, 'Nabner', ...cells));

// Same difference: adjacent cells on the line have a constant difference,
// but that difference is not given and can differ line to line. Scan with an
// NFA that records the difference on the first step and requires every later
// step to match it.
const sameDifferenceSpec = NFA.encodeSpec({
  startState: { prev: null, diff: null },
  transition: ({ prev, diff }, value) => {
    if (prev === null) return { prev: value, diff: null };
    const d = Math.abs(value - prev);
    if (diff === null) return { prev: value, diff: d };
    if (d !== diff) return undefined;
    return { prev: value, diff };
  },
  accept: () => true,
}, 9);
const sameDifferenceLines = [
  ['R1C3', 'R1C4', 'R1C5'],
  ['R4C3', 'R5C4', 'R6C5'],
  ['R9C4', 'R8C5', 'R7C6', 'R6C7', 'R5C8', 'R4C9'],
];
const sameDifferences = sameDifferenceLines.map(
  cells => new NFA(sameDifferenceSpec, 'same-difference', ...cells));

// Black dots: one value double the other.
const blackDots = [
  new BlackDot('R8C3', 'R8C4'),
  new BlackDot('R2C8', 'R3C8'),
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  boxCount,
  ...boxRules,
  ...arrows,
  ...whispers,
  ...nabners,
  ...sameDifferences,
  ...blackDots,
];
