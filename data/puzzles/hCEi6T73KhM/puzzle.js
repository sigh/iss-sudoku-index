// Title: Foggy Banana Split
// Author: SamuPiano
// Video: https://www.youtube.com/watch?v=hCEi6T73KhM
// Source: https://sudokupad.app/23phi9d5m7

// Standard 9x9 sudoku (default row/column/box regions, no givens). Encodes
// the SPLIT PEAS line sums and the XV edge sums. Fog is solving UI, not a
// final-grid rule, and is not encoded.
//
// Omitted: CHOCO BANANA shading (every cell chocolate/banana, chocolate areas
// rectangular, banana areas not) and both CIRCLES rules, which are read off
// that same unknown shading -- SHADING gives a circled area's size, COUNT
// gives the same-shade run length along a circle's attached line. ISS has no
// primitive for an unbounded, unanchored partition into components with a
// per-component shape predicate (rectangular / non-rectangular), so none of
// the three rules can be built.

// Split-peas line segments: [start circle, end circle, interior cells
// in-between]. The source draws 5 polylines end-to-end in circled cells, but
// one of them (start R4C2, end R1C8) passes through a circled cell (R1C3)
// mid-path. The rules state a line "ends in circles on either end," so an
// interior circle marks two lines sharing that endpoint, not a
// straight-through cell of one line; that polyline is split into the two
// segments below at R1C3.
const splitPeaSegments = [
  ['R3C1', 'R1C2', ['R2C1', 'R1C1']],
  ['R4C2', 'R1C3', ['R3C2', 'R3C3', 'R2C3']],
  ['R1C3', 'R1C8', ['R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C7', 'R2C8']],
  ['R3C4', 'R5C5', ['R3C5', 'R2C5', 'R2C6', 'R3C6', 'R4C6', 'R4C5']],
  ['R6C4', 'R7C3', ['R7C4', 'R8C4', 'R8C5', 'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R8C2', 'R8C3']],
  ['R6C7', 'R8C7', ['R5C7', 'R4C7', 'R3C7', 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R7C9', 'R8C9', 'R8C8']],
];

// The rules don't say which endpoint holds the tens digit, so both
// assignments are allowed: interior sum = 10*a + b, or 10*b + a.
const splitPeas = (a, b, interior) => new Or([
  new Sum(0, ...interior, [a, -10], [b, -1]),
  new Sum(0, ...interior, [a, -1], [b, -10]),
]);

// XV edge marks, from the source's edge-centred overlay pairs.
const xMarks = [
  ['R2C5', 'R2C6'],
  ['R3C3', 'R3C4'],
  ['R5C1', 'R6C1'],
  ['R5C2', 'R6C2'],
  ['R8C8', 'R8C9'],
];

return [
  new Shape('9x9'),
  ...splitPeaSegments.map(([a, b, interior]) => splitPeas(a, b, interior)),
  ...xMarks.map(cells => new X(...cells)),
  new V('R4C3', 'R4C4'),
];
