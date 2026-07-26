// Title: Po-Boy
// Author: Sniglett & cornishjohn
// Video: https://www.youtube.com/watch?v=0KYJrcoksbE
// Source: https://sudokupad.app/h8znpkd7qs

// Coral: odd digits are "coral", even digits are "water" -- shading is a
// direct function of parity, not a separate state. Coral cells form a single
// orthogonally-connected region (ConnectedValues). No 2x2 block is
// monochrome (all-coral or all-water). Water may be several separate bodies
// each touching the grid edge; that per-component "reaches the edge, no
// enclosed lake" clause has no ISS primitive for a multi-component class
// (ConnectedValues only proves exactly one region) and is omitted.
//
// Coral clues (outside marks): each clued row/column lists every coral/water
// run in that line, outer edge to inner. A number is one run's exact length;
// `*` is "one or more runs of unspecified length" filling that stretch. Only
// adjacent explicit runs must differ in parity (automatic from run
// maximality) -- encoded per line below as a 2-branch Regex, one branch per
// possible starting parity, since a `*` stretch's own run count is free and
// does not pin the parity of an explicit run across it.
//
// Sandwich: the same clue numbers (the run lengths, `*` excluded), read in
// the same outer-to-inner order and concatenated into one multi-digit
// number, are the sum of the digits strictly between the 1 and the 9 of that
// line -- ISS's native Sandwich class.
//
// Little killer: the R1C1-R9C9 diagonal sums to 43.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

const ODD = '[13579]';   // coral
const EVEN = '[2468]';   // water

// One Regex per clued line: two alternatives, for which parity the first
// explicit run takes (the puzzle does not pin this; it's forced only where
// two explicit runs are directly adjacent, which the fixed class order
// below already captures).
const coralLine = (cells, patternOdd, patternEven) =>
  new Regex(`(${patternOdd})|(${patternEven})`, ...cells);

// R#C# provenance: overlay/underlay `center` positions in the source payload,
// matched to the nearest row/column and ordered outer-to-inner (ascending row
// for columns, ascending col for rows).
const coralClues = [
  // Column 1: *, 1, 3, *
  coralLine(graph.column(1),
    `.*${EVEN}${ODD}${EVEN}{3}${ODD}.*`,
    `.*${ODD}${EVEN}${ODD}{3}${EVEN}.*`),
  // Column 4: *, 3
  coralLine(graph.column(4),
    `.*${EVEN}${ODD}{3}`,
    `.*${ODD}${EVEN}{3}`),
  // Column 7: *, 1, 2
  coralLine(graph.column(7),
    `.*${EVEN}${ODD}${EVEN}{2}`,
    `.*${ODD}${EVEN}${ODD}{2}`),
  // Column 9: *, 5
  coralLine(graph.column(9),
    `.*${EVEN}${ODD}{5}`,
    `.*${ODD}${EVEN}{5}`),
  // Row 3: *, 2, 1
  coralLine(graph.row(3),
    `.*${EVEN}${ODD}{2}${EVEN}`,
    `.*${ODD}${EVEN}{2}${ODD}`),
  // Row 5: *, 2, 3
  coralLine(graph.row(5),
    `.*${EVEN}${ODD}{2}${EVEN}{3}`,
    `.*${ODD}${EVEN}{2}${ODD}{3}`),
  // Row 7: *, 1, 1
  coralLine(graph.row(7),
    `.*${EVEN}${ODD}${EVEN}`,
    `.*${ODD}${EVEN}${ODD}`),
  // Row 9: *, 2
  coralLine(graph.row(9),
    `.*${EVEN}${ODD}{2}`,
    `.*${ODD}${EVEN}{2}`),
];

// Sandwich sums: the same clue numbers, concatenated outer-to-inner.
const sandwiches = [
  Sandwich.fromCells(13, graph.column(1), geometry),
  Sandwich.fromCells(3, graph.column(4), geometry),
  Sandwich.fromCells(12, graph.column(7), geometry),
  Sandwich.fromCells(5, graph.column(9), geometry),
  Sandwich.fromCells(21, graph.row(3), geometry),
  Sandwich.fromCells(23, graph.row(5), geometry),
  Sandwich.fromCells(11, graph.row(7), geometry),
  Sandwich.fromCells(2, graph.row(9), geometry),
];

// No 2x2 block is monochrome (all-coral or all-water): scan each block for
// an adjacent pair of differing parity, which every non-monochrome 4-cell
// set must contain somewhere. One NFA on the canonical top-left block,
// replicated to every valid block origin.
const gridCells = graph.cells();
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const parity = value % 2;
    const next = [...seen, parity];
    if (next.length < 4) return { seen: next };
    const allSame = next.every(p => p === next[0]);
    return allSame ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = graph.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2', ...graph.block(gridCells[0], 2, 2)),
  blockOrigins);

return [
  new Shape('9x9'),
  new ConnectedValues('', [1, 3, 5, 7, 9]),
  noMono2x2,
  ...coralClues,
  ...sandwiches,
  LittleKiller.fromCells(43, graph.ray('R1C1', 1, 1), geometry),
];
