// Title: Skewed Boxes
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=u2QHd-cprko
// Source: https://sudokupad.app/0g7nns4iny

// Nine coloured 9-cell regions replace the standard boxes. A few regions
// have one cell drawn far from the rest of the region (still the same
// colour, per the rules text's own r1c1 example) -- listed here as part of
// the region's cell list, matching the coloured underlay in the source.
const regions = [
  ['R1C2', 'R1C3', 'R1C4', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C9'],
  ['R1C5', 'R1C6', 'R1C7', 'R2C4', 'R2C5', 'R2C6', 'R3C3', 'R3C4', 'R3C5'],
  ['R1C1', 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C6', 'R3C7', 'R3C8'],
  ['R4C2', 'R4C3', 'R4C4', 'R5C1', 'R5C2', 'R5C3', 'R6C1', 'R6C2', 'R6C9'],
  ['R4C5', 'R4C6', 'R4C7', 'R5C4', 'R5C5', 'R5C6', 'R6C3', 'R6C4', 'R6C5'],
  ['R4C1', 'R4C8', 'R4C9', 'R5C7', 'R5C8', 'R5C9', 'R6C6', 'R6C7', 'R6C8'],
  ['R7C2', 'R7C3', 'R7C4', 'R8C1', 'R8C2', 'R8C3', 'R9C1', 'R9C2', 'R9C9'],
  ['R7C5', 'R7C6', 'R7C7', 'R8C4', 'R8C5', 'R8C6', 'R9C3', 'R9C4', 'R9C5'],
  ['R7C1', 'R7C8', 'R7C9', 'R8C7', 'R8C8', 'R8C9', 'R9C6', 'R9C7', 'R9C8'],
];

return [
  new Shape('9x9'),

  new Given('R1C4', 2),
  new Given('R3C8', 8),
  new Given('R4C7', 6),

  // Digits cannot repeat within a bold outlined region -- the coloured
  // regions replace the standard boxes.
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('9x9', ...cells)),

  // Cells separated by a single knight's move cannot contain the same
  // digit.
  new AntiKnight(),

  // No domino in the grid can contain consecutive digits. AntiConsecutive's
  // adjacency is orthogonal-only, matching "domino".
  new AntiConsecutive(),
];
