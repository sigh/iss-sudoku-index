// Title: String Quartet
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=g90GStLnFxk
// Source: https://sudokupad.app/fGbtDGPpTN

// Normal Sudoku applies. The VQ overlay labels a cell by the line rule used by
// its section: 1 renban, 2 palindrome, 3 German whisper, or 4 region sum.
// Each drawn path is monochromatic; all four labels are connected sections,
// every pair of labels meets orthogonally, and no 2x2 block is monochromatic.
const RENBAN = 1;
const PALINDROME = 2;
const WHISPER = 3;
const REGION_SUM = 4;
const SECTION_TYPES = [RENBAN, PALINDROME, WHISPER, REGION_SUM];

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const section = graph.makeOverlay('VQ');

// Payload line paths, transcribed in payload order from the light-grey strokes.
const lines = [
  ['R4C1', 'R5C1', 'R6C1', 'R7C1', 'R7C2'],
  ['R5C2', 'R6C2', 'R6C3', 'R7C3'],
  ['R8C1', 'R9C1', 'R9C2', 'R9C3', 'R8C4', 'R7C5', 'R7C6'],
  ['R9C4', 'R9C5'],
  ['R2C5', 'R2C6', 'R1C7'],
  ['R5C6', 'R5C7'],
  ['R1C9', 'R2C8', 'R3C7', 'R4C7', 'R5C8'],
  ['R9C8', 'R9C9', 'R8C9', 'R7C9', 'R6C9', 'R5C9', 'R4C9', 'R3C9'],
  ['R1C1', 'R2C1', 'R3C1', 'R4C2', 'R4C3'],
  ['R5C3', 'R4C4', 'R3C4', 'R3C5', 'R2C4'],
  ['R2C2', 'R3C2', 'R3C3'],
  ['R2C7', 'R1C8'],
  ['R9C6', 'R9C7'],
  ['R6C4', 'R5C5', 'R6C6', 'R6C7', 'R7C8', 'R8C7', 'R8C6'],
];

const sameSectionLines = lines.map(cells =>
  new SameValues(cells.length, ...section.at(cells)));

// The first section label selects this path's one rule. Monochromatic paths
// above make the first overlay cell representative of the whole path.
const typedLines = lines.map(cells => {
  const label = section.at(cells[0]);
  return new Or([
    new And([new Given(label, RENBAN), new Renban(...cells)]),
    new And([new Given(label, PALINDROME), new Palindrome(...cells)]),
    new And([new Given(label, WHISPER), new Whisper(5, ...cells)]),
    new And([new Given(label, REGION_SUM), new RegionSumLine(...cells)]),
  ]);
});

// A two-by-two block may not be contained in a single section.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(v => v === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = section.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...section.at(graph.block(gridCells[0], 2, 2))),
  section.at(blockOrigins));

const edges = gridCells.flatMap(cell => graph.neighbours(cell)
  .filter(other => graph.parseCellId(other).cellIndex > graph.parseCellId(cell).cellIndex)
  .map(other => [cell, other]));

// For each pair of section types, one of the grid's orthogonal edges joins it.
const contacts = SECTION_TYPES.flatMap((a, i) => SECTION_TYPES.slice(i + 1)
  .map(b => new Or(edges.flatMap(([left, right]) => [
    new And([new Given(section.at(left), a), new Given(section.at(right), b)]),
    new And([new Given(section.at(left), b), new Given(section.at(right), a)]),
  ]))));

return [
  new Shape('9x9'),
  section.toVar('quartet section rule'),
  section.makeReplicate(new Given(section.cells()[0], ...SECTION_TYPES)),

  ...sameSectionLines,
  ...typedLines,
  ...SECTION_TYPES.map(type => new ConnectedValues('VQ', type)),
  ...contacts,
  noMono2x2,
];
