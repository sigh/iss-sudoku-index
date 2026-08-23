// Title: Inner Peas
// Author: SamuPiano
// Video: https://www.youtube.com/watch?v=KNeY8WSAvjY
// Source: https://sudokupad.app/qwd7jxoeym

// Yin-Yang (native): every cell is shaded HOT or COLD; each shade is one
// orthogonally connected region, and no 2x2 block is monochrome. Hot/cold: a
// cell's "value" (as used by the split-pea sums below) is its digit + 1 when
// HOT, digit - 1 when COLD; the plain digit alone still fills the row/column/box.
// Split peas: every circle-to-circle run on the drawn green polylines sums
// its non-circle cells to the concatenation of its two circles' values, in
// either order -- encoded as an Or of both digit/coefficient orderings.
// A drawn stroke threading more than two circles is split into one segment
// per adjacent circle pair.

// Native YinYang restricts its shading to the grid's two lowest values (this
// puzzle's Shape starts at 0), so HOT=0, COLD=1.
const HOT = 0;
const COLD = 1;

const graph = cellGraph('9x9');

// Circle-to-circle segments, transcribed in path order from the drawn
// geometry. R4C1/R2C1 and R1C5/R1C7 each anchor more than one segment,
// summed separately per the rules. The R4C1-R2C1 stroke is a closed loop
// (its waypoints start and end at the same grid corner) threading both
// circles, so it splits into its two arcs between them: the short arc
// through R3C1, and the long arc the other way round through R2C2, R3C3,
// R4C2. R4C1-R3C2-R2C1 is a separate, third route between the same two
// circles.
const segments = [
  { circles: ['R1C9', 'R2C7'], arm: ['R2C8', 'R3C8', 'R4C7', 'R3C6'] },
  { circles: ['R9C9', 'R8C6'], arm: ['R9C8', 'R9C7'] },
  { circles: ['R8C6', 'R6C8'], arm: ['R7C7'] },
  { circles: ['R6C8', 'R4C6'], arm: ['R5C8', 'R5C7'] },
  { circles: ['R4C6', 'R7C5'], arm: ['R5C6', 'R6C6'] },
  { circles: ['R7C5', 'R7C3'], arm: ['R6C4', 'R5C3', 'R5C2', 'R6C2'] },
  { circles: ['R7C3', 'R9C3'], arm: ['R7C2', 'R8C1', 'R9C2'] },
  { circles: ['R2C4', 'R1C5'], arm: ['R1C3', 'R1C4'] },
  { circles: ['R1C5', 'R1C7'], arm: ['R1C6'] },
  { circles: ['R1C7', 'R1C5'], arm: ['R2C6'] },
  { circles: ['R5C4', 'R4C5'], arm: ['R4C4'] },
  { circles: ['R4C1', 'R2C1'], arm: ['R3C1'] },
  { circles: ['R2C1', 'R4C1'], arm: ['R2C2', 'R3C3', 'R4C2'] },
  { circles: ['R4C1', 'R2C1'], arm: ['R3C2'] },
];
const segmentCells = [
  ...new Set(segments.flatMap(({ circles, arm }) => [...circles, ...arm]))];

// Shade overlay: every grid cell is HOT or COLD (the two Yin-Yang regions).
const shade = graph.makeOverlay('YY');

// Effective-value overlay, only for cells that sit on a pea line. A hot
// digit-9 cell reads as 10 and a cold digit-1 cell reads as 0, so the alphabet
// is widened to 0-10 (main-grid cells are then restricted back to 1-9 below).
// eff - digit + 2*shade = 1 <=> eff = digit + 1 (shade=HOT=0) or digit - 1
// (shade=COLD=1).
const eff = graph.makeOverlay('VE', segmentCells);
const effLinks = segmentCells.map(cell => new Sum(
  1, [eff.at(cell), 1], [cell, -1], [shade.at(cell), 2]));

function segmentConstraint({ circles: [a, b], arm }) {
  const armEff = eff.at(arm);
  const [effA, effB] = eff.at([a, b]);
  return new Or([
    new Sum(0, ...armEff, [effA, -10], [effB, -1]),
    new Sum(0, ...armEff, [effA, -1], [effB, -10]),
  ]);
}

return [
  new Shape('9x9', '0-10'),
  graph.makeReplicate(new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  new YinYang(),
  eff.toVar('effective value'),
  ...effLinks,
  ...segments.map(segmentConstraint),
];
