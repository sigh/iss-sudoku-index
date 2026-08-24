// Title: Shamrocks
// Author: Gray Kanarek
// Video: https://www.youtube.com/watch?v=zZcMg59YW2E
// Source: https://app.crackingthecryptic.com/sudoku/dM9JP4TgGR

// Normal sudoku rules apply (row/column/box all-different is the ISS default).
// Disjoint subset rules apply: a digit can never repeat in the same
// box-relative position across any two boxes -- DisjointSets().
// Digits increase along thermometers from the bulb(s) to the end. Each green
// line is drawn as a "shamrock": 2, 3, or 4 short leaves, each ending in a
// circled bulb, meeting at one shared junction cell that continues one more
// cell to a single non-circled end cell -- matching the rules text's plural
// "bulb(s)". Encoded as one Thermo per drawn edge (bulb->junction,
// junction->end); transitivity across the shared junction/end edge then
// forces every bulb-to-end path to be strictly increasing, which is exactly
// the stated rule. One shamrock has a plain two-cell leg with no junction.
// Shamrock cell groups and bulb/junction/end roles are read off the drawn
// lines and circle overlays: each bulb carries a solid yellowgreen circle
// (40 total, matching the 40 bulb cells below), the junction is the cell
// where several leaves meet, and the end is the one non-circled cell
// continuing past the junction.

const shamrocks = [
  { bulbs: ['R1C2', 'R2C2', 'R3C1'], junction: 'R2C1', end: 'R1C1' },
  { bulbs: ['R4C2', 'R5C1', 'R5C3'], junction: 'R5C2', end: 'R6C2' },
  { bulbs: ['R2C3', 'R3C2', 'R3C4'], junction: 'R3C3', end: 'R4C3' },
  { bulbs: ['R3C5', 'R4C4', 'R4C6'], junction: 'R4C5', end: 'R5C5' },
  { bulbs: ['R1C6', 'R2C5', 'R2C7'], junction: 'R2C6', end: 'R3C6' },
  { bulbs: ['R2C8', 'R3C7', 'R3C9'], junction: 'R3C8', end: 'R4C8' },
  { bulbs: ['R9C4', 'R9C5', 'R9C6'], junction: 'R8C5', end: 'R8C4' },
  { bulbs: ['R5C4', 'R6C3', 'R6C5'], junction: 'R6C4', end: 'R7C4' },
  { bulbs: ['R6C6', 'R7C5', 'R7C7'], junction: 'R7C6', end: 'R8C6' },
  { bulbs: ['R4C7', 'R5C6', 'R5C8'], junction: 'R5C7', end: 'R6C7' },
  { bulbs: ['R7C8', 'R8C7', 'R8C9'], junction: 'R8C8', end: 'R9C8' },
  // Four-leaf shamrock (the puzzle's "lucky clover").
  { bulbs: ['R7C1', 'R7C3', 'R8C1', 'R8C3'], junction: 'R8C2', end: 'R9C2' },
  // Two-leaf shamrock.
  { bulbs: ['R6C8', 'R6C9'], junction: 'R5C9', end: 'R4C9' },
];

const shamrockThermos = shamrocks.flatMap(({ bulbs, junction, end }) => [
  ...bulbs.map((bulb) => new Thermo(bulb, junction)),
  new Thermo(junction, end),
]);

return [
  new Shape('9x9'),
  new Given('R1C5', 2),
  new Given('R6C1', 1),
  new DisjointSets(),
  // Plain two-cell thermometer, no junction (lines[12]).
  new Thermo('R1C7', 'R1C8'),
  ...shamrockThermos,
];
