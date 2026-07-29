// Title: Galapagos
// Author: Niverio
// Video: https://www.youtube.com/watch?v=fPBKIxjUU14
// Source: https://sudokupad.app/DhFTHL63t7

// Normal Sudoku applies. Shade 1 is one connected region with no shaded 2x2.
// Labels 2-9 are the eight clue-anchored islands: each is connected, contains
// its clue, has that digit sum without repeats, and crosses a box boundary.
// Omitted: the equal nonzero digit sums in every box an island enters.

const SHADED = 1;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const islands = graph.makeOverlay('VI');
const gridCells = graph.cells();
const clueData = [
  ['R1C6', 12], ['R2C2', 21], ['R4C1', 16], ['R5C5', 16],
  ['R6C7', 16], ['R8C9', 45], ['R9C1', 16], ['R9C5', 36],
];

// The source's eight small-number overlays, in label order; label 1 is shade.
const clues = clueData.map(([cell, sum], index) => ({
  cell, sum, label: index + 2,
}));
const entries = gridCells.flatMap(cell => [islands.at(cell), cell]);

// Scan alternating island label and digit. A bit mask records the selected
// island's seen digits, so duplicate digits and a non-matching clue sum reject.
function islandSumMachine(label, target) {
  return NFA.encodeSpec({
    startState: { labelPhase: true, selected: false, seen: 0 },
    transition: ({ labelPhase, selected, seen }, value) => {
      if (labelPhase) return { labelPhase: false, selected: value === label, seen };
      if (seen === null || !selected) return { labelPhase: true, selected: false, seen };
      const next = seen | (1 << (value - 1));
      return { labelPhase: true, selected: false, seen: next === seen ? null : next };
    },
    accept: ({ labelPhase, selected, seen }) => labelPhase && !selected && seen !== null &&
      [...Array(9)].reduce((sum, _, i) => sum + (((seen >> i) & 1) ? i + 1 : 0), 0) === target,
    maxDepth: entries.length,
  }, geometry);
}

// Every label is a real island rather than an island wholly inside its clue box.
function leavesClueBoxMachine(label, clueCell) {
  const clueBox = graph.boxes().find(box => box.includes(clueCell));
  return NFA.encodeSpec({
    startState: { found: false },
    transition: ({ found }, value) => ({ found: found || value === label }),
    accept: ({ found }) => found,
    maxDepth: gridCells.length - clueBox.length,
  }, geometry);
}

// A 2x2 may not be entirely shaded; only shade 1 is restricted this way.
const noShade2x2Machine = NFA.encodeSpec({
  startState: { allShaded: true },
  transition: ({ allShaded }, value) => ({ allShaded: allShaded && value === SHADED }),
  accept: ({ allShaded }) => !allShaded,
}, geometry);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noShade2x2 = islands.makeReplicate(
  new NFA(noShade2x2Machine, 'no-shaded-2x2',
    ...islands.at(graph.block(gridCells[0], 2, 2))),
  islands.at(blockOrigins));

const islandRules = clues.flatMap(({ cell, sum, label }) => [
  new Given(islands.at(cell), label),
  new ConnectedValues('VI', label),
  new NFA(islandSumMachine(label, sum), `island-${label}-sum`, ...entries),
  new NFA(leavesClueBoxMachine(label, cell), `island-${label}-crosses-box`,
    ...islands.at(gridCells.filter(candidate =>
      !graph.boxes().find(box => box.includes(cell)).includes(candidate)))),
]);

return [
  new Shape('9x9'),
  islands.toVar('island labels'),
  new Given('R1C8', 4),
  islands.makeReplicate(new Given(islands.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  new ConnectedValues('VI', SHADED),
  noShade2x2,
  ...islandRules,
];
