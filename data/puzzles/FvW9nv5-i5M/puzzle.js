// Title: What Number Am I Thinking Of? (<3)
// Author: Br1312te
// Video: https://www.youtube.com/watch?v=FvW9nv5-i5M
// Source: https://sudokupad.app/k32j83erb7

// Pick five digits from 1-9: every row, column, and jigsaw region below holds
// the same setter-chosen five-digit set.
const shape = new Shape('5x5', 9);

// Jigsaw regions (pentominoes), from the payload's `regions` array.
const regions = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C1'],
  ['R1C5', 'R2C4', 'R2C5', 'R3C5', 'R4C5'],
  ['R2C2', 'R2C3', 'R3C2', 'R3C3', 'R3C4'],
  ['R3C1', 'R4C1', 'R5C1', 'R5C2', 'R5C3'],
  ['R4C2', 'R4C3', 'R4C4', 'R5C4', 'R5C5'],
];

// Slow thermometers: starting from the bulb (first cell), digits increase or
// stay the same -- never decrease. Cell order and bulb ends come from the
// payload's `lines[].wayPoints`, confirmed by the bulb markers in `underlays`.
const thermometers = [
  ['R5C1', 'R4C2', 'R3C3', 'R2C4', 'R1C5'],
  ['R5C2', 'R4C3', 'R3C4', 'R2C5'],
];
const slowKey = Pair.fnToKey((a, b) => a <= b, shape);

// Red Kropki dot: digits are in a strict 1:3 ratio (no native class for this
// ratio). From the red-filled edge overlay between R5C3 and R5C4.
const tripleKey = Pair.fnToKey((a, b) => a === b * 3 || b === a * 3, shape);

return [
  shape,
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('5x5', ...cells)),
  new RegionSameValues(),

  ...thermometers.map(cells => new Pair(
    slowKey, 'Slow thermometer', ...cells
  )),

  // Black Kropki dots: digits are in a 1:2 ratio (BlackDot's native semantics).
  new BlackDot('R4C3', 'R4C4'),
  new BlackDot('R2C3', 'R2C4'),
  new Pair(tripleKey, 'Red dot (1:3)', 'R5C3', 'R5C4'),
];
