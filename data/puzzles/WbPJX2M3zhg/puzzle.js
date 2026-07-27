// Title: The Curse of King Minos
// Author: Allagem
// Video: https://www.youtube.com/watch?v=WbPJX2M3zhg
// Source: https://sudokupad.app/011pxhbylc

// Full encoding: normal Sudoku, one given, Anti-King (native), Yin-Yang shading
// (global connectivity per shade + no monochrome 2x2), and the "Sight Squares"
// rule tying 22 named cells' digits to a same-colour visibility count.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Every shade Var is either shaded or unshaded.
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(
  new Given(firstShade, SHADED, UNSHADED));

// No 2x2 block may be all shaded or all unshaded: one NFA on the top-left
// block, replicated to every block origin.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    const allSame = next.every(v => v === next[0]);
    return allSame ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

// Sight Squares (drawn as a white box on the given cell; provenance:
// underlays 0-21 of the source payload, one per box).
const sightCells = [
  'R1C1', 'R1C9', 'R2C3', 'R2C5', 'R3C4', 'R3C6', 'R3C7', 'R4C4', 'R4C7',
  'R5C3', 'R5C8', 'R6C2', 'R6C4', 'R6C7', 'R7C3', 'R7C6', 'R7C8', 'R7C9',
  'R8C2', 'R8C5', 'R8C7', 'R9C4',
];
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

// A single machine, shared by every sight square, reads: the clue's own
// digit (sets the target), the clue's own shade (sets the colour being
// counted and starts the running total at 1 for the clue cell itself), then
// one segment per orthogonal ray (nearest cell first), separated by
// SEGMENT_BREAK. Within a ray, cells matching the target colour keep adding
// to the total; the first mismatch "blocks" the rest of that ray (no further
// additions) until the next SEGMENT_BREAK resets the block for the next ray.
// The clue is satisfied when the accumulated total equals its own digit.
// All fields are bounded (target/color fixed once read, sum clamped at
// target+1, blocked a flag), so no maxDepth is needed to bound state growth.
const sightSpec = NFA.encodeSpec({
  startState: { target: null, color: null, sum: 0, blocked: false },
  transition: ({ target, color, sum, blocked }, value) => {
    if (target === null) return { target: value, color: null, sum: 0, blocked: false };
    if (color === null) return { target, color: value, sum: 1, blocked: false };
    if (value === SEGMENT_BREAK) return { target, color, sum, blocked: false };
    if (blocked) return { target, color, sum, blocked };
    if (value === color) {
      return { target, color, sum: Math.min(sum + 1, target + 1), blocked: false };
    }
    return { target, color, sum, blocked: true };
  },
  accept: ({ target, sum }) => sum === target,
}, geometry.numValues, { multiSegment: true });

const sightConstraints = sightCells.map(cell => {
  const rayCells = DIRS
    .map(([dRow, dCol]) => graph.ray(cell, dRow, dCol).slice(1))
    .filter(cells => cells.length > 0);
  const rays = shade.at(rayCells);
  return new NFA(sightSpec, 'Sight', [cell, shade.at(cell)], ...rays);
});

return [
  new Shape('9x9'),
  new Given('R6C6', 1),
  new AntiKing(),
  shade.toVar('shade'),
  shadeDomain,
  // Yin-Yang connectivity: each shade forms one orthogonally connected region.
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...sightConstraints,
];
