// Title: Modular Yin Yang
// Author: yttrio
// Video: https://www.youtube.com/watch?v=4SC7itCISLg
// Source: https://sudokupad.app/yttrio/modular-yin-yang

// Full encoding. Shading is the YinYang constraint's YY cell group
// (connected regions, no mono 2x2); clue rules are encoded below.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('YY');
const shadeCell = cell => shade.at(cell);
const gridCells = graph.cells();

// For every 2x2 area, no two shaded cells share a modulo-3 class
// ([1,4,7] / [2,5,8] / [3,6,9]). Scans the block's four cells as interleaved
// (digit, shade) pairs, tracking which classes a shaded cell has already
// claimed; a repeat rejects.
const mod3NFA = NFA.encodeSpec({
  startState: { phase: 'digit', pendingClass: 0, used: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      return { phase: 'shade', pendingClass: value % 3, used: state.used };
    }
    if (value === SHADED) {
      const bit = 1 << state.pendingClass;
      if (state.used & bit) return undefined;
      return { phase: 'digit', pendingClass: 0, used: state.used | bit };
    }
    return { phase: 'digit', pendingClass: 0, used: state.used };
  },
  accept: state => state.phase === 'digit',
}, 9);

const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));

// Arrows: the digit in the arrow's cell counts shaded cells seen from that
// cell to the grid edge along the arrow's direction, not counting itself.
// digit + sum(shade values in sight) = 2 * sight.length, since SHADED=1 and
// UNSHADED=2 make (2 - shadeValue) the 1/0 shaded indicator.
const DIRECTIONS = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
const arrows = [
  ['R1C6', 'right'],
  ['R2C5', 'right'],
  ['R3C5', 'right'],
  ['R9C1', 'right'],
  ['R1C4', 'left'],
  ['R9C9', 'left'],
  ['R3C6', 'down'],
  ['R3C4', 'down'],
  ['R7C4', 'up'],
  ['R7C7', 'up'],
  ['R9C6', 'up'],
  ['R4C7', 'left'],
  ['R7C1', 'right'],
  ['R7C6', 'down'],
  ['R2C8', 'down'],
];

const arrowConstraints = arrows.map(([cell, dir]) => {
  const [dRow, dCol] = DIRECTIONS[dir];
  const sight = graph.ray(cell, dRow, dCol).slice(1);
  return new Sum(2 * sight.length, cell, ...shade.at(sight));
});

// mod3-2x2 interleaves grid cells and shade-overlay cells in one template,
// spanning two cell groups; Replicate requires every referenced cell to
// share the origin's cell group, so this cannot be expressed with Replicate.
const mod3Constraints = blockOrigins.map(cell => {
  const block = graph.block(cell, 2, 2);
  const interleaved = block.flatMap(c => [c, shadeCell(c)]);
  return new NFA(mod3NFA, 'mod3-2x2', ...interleaved);
});

return [
  new Shape('9x9'),
  new YinYang(),

  ...mod3Constraints,
  ...arrowConstraints,
];
