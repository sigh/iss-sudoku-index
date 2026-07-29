// Title: Inner Peas
// Author: SamuPiano
// Video: https://www.youtube.com/watch?v=KNeY8WSAvjY
// Source: https://sudokupad.app/qwd7jxoeym

// Normal Sudoku and Yin-Yang shading are encoded. The hot/cold value modifier
// and split-pea sums are omitted: the shared-corner green stroke does not give
// a uniquely recoverable ordered route, and the rules do not specify how a
// modified value of 0 or 10 participates in a circle concatenation.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Drawn data: every cell belongs to exactly one of the two Yin-Yang shades.
const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], SHADED, UNSHADED));

// No 2x2 region may be monochrome.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(v => v === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

return [
  new Shape('9x9'),
  shade.toVar('Yin-Yang shading'),
  shadeDomain,
  // Each shade forms one orthogonally connected region.
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
];
