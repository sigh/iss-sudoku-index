// Title: Cageless (X) Killer
// Author: Shinya
// Video: https://www.youtube.com/watch?v=eGOOzHCCh74
// Source: https://cracking-the-cryptic.web.app/sudoku/F26HHgG7rD

// Rules encoded here:
//  - Normal sudoku.
//  - Killer cages exist but none is drawn: a cage is an orthogonally connected
//    set of cells, cages do not overlap, and digits do not repeat in a cage.
//  - Each outside clue m(n) sits at one end of a row or column. Reading from
//    the clue's end, X is the digit in the first cell of that line, and the
//    X-th cell of the line (counted from the clue's end) belongs to a cage of
//    exactly n cells whose digits sum to m.
// Nothing is omitted. Two clues may name the same cage or different cages.

// The 32 margin clues as [side, line, m, n], read off the white text overlays
// in the margin: side is the grid edge the clue sits on, line the 1-9 row
// (left/right) or column (top/bottom) it heads.
const CLUES = [
  ['top', 1, 3, 2], ['top', 2, 35, 5], ['top', 3, 12, 4], ['top', 4, 19, 3],
  ['top', 5, 32, 5], ['top', 6, 17, 2], ['top', 9, 16, 5],
  ['left', 1, 3, 2], ['left', 2, 13, 2], ['left', 3, 11, 2], ['left', 4, 18, 5],
  ['left', 6, 35, 5], ['left', 7, 24, 5], ['left', 8, 31, 5],
  ['right', 1, 20, 3], ['right', 2, 35, 5], ['right', 3, 30, 6],
  ['right', 4, 31, 5], ['right', 5, 16, 5], ['right', 6, 17, 2],
  ['right', 7, 18, 3], ['right', 8, 22, 5], ['right', 9, 22, 4],
  ['bottom', 1, 30, 6], ['bottom', 2, 12, 4], ['bottom', 3, 9, 2],
  ['bottom', 4, 16, 4], ['bottom', 5, 20, 3], ['bottom', 6, 11, 3],
  ['bottom', 7, 26, 6], ['bottom', 8, 22, 5], ['bottom', 9, 32, 5],
];

// Cages are solved for as labels on Var layers: a cage is the set of cells
// holding one label, so two labels never share a cell. Label 1 (NONE) marks a
// cell in no clued cage. Each clue gets its own label unless it names the cage
// of an earlier clue with the same m(n); 32 labels need three layers of at
// most 11, so the value range is widened to 12 and the grid cells are
// restricted back to 1-9.
const NUM_VALUES = 12;
const NONE = 1;
const LABELS_PER_LAYER = NUM_VALUES - 1;
const shape = new Shape('9x9', NUM_VALUES);
const graph = cellGraph(shape);
const gridCells = graph.cells();

// Group the clues by m(n) and pack the groups into layers (largest first),
// keeping a group on one layer so its clues can point at one another's labels.
const groups = [];
CLUES.forEach(([, , m, n], index) => {
  const group = groups.find(g => g.m === m && g.n === n)
    || groups[groups.push({ m, n, members: [] }) - 1];
  group.members.push(index);
});
const layers = [];
for (const group of [...groups].sort((a, b) => b.members.length - a.members.length)) {
  let layer = layers.find(l => l.groups.reduce((s, g) => s + g.members.length, 0)
    + group.members.length <= LABELS_PER_LAYER);
  if (!layer) layers.push(layer = { groups: [] });
  layer.groups.push(group);
}
if (layers.length > 3) throw new Error('more layers than expected');

// Each layer is an 11x9 Var group: rows 1-9 shadow the grid, row 10 is a
// barrier held at NONE, row 11 holds parking cells. A clue that names an
// earlier clue's cage has no cells of its own, but ConnectedValues needs every
// asserted label present somewhere, so such a clue parks its label on its
// parking cell instead. The barrier keeps a parked label away from the grid.
const BARRIER_ROW = 10;
const PARKING_ROW = 11;
const layerVars = layers.map((_, i) =>
  new Var(String.fromCharCode(65 + i), `cage labels ${i + 1}`, '11x9'));
const layerCell = (layerIndex, cell) => {
  const { row, col } = parseCellId(cell);
  return layerVars[layerIndex].cell(row, col);
};

// Per clue: its layer, label, the labels of earlier same-m(n) clues it may
// share with, and its parking cell when it has any.
const clues = new Array(CLUES.length);
layers.forEach((layer, layerIndex) => {
  let label = NONE;
  let parkingCol = 0;
  for (const group of layer.groups) {
    const earlier = [];
    for (const index of group.members) {
      label += 1;
      const [side, line, m, n] = CLUES[index];
      const park = earlier.length
        ? layerVars[layerIndex].cell(PARKING_ROW, ++parkingCol) : null;
      clues[index] = { side, line, m, n, layerIndex, label, earlier: [...earlier], park };
      earlier.push(label);
    }
  }
});

// The clue's line, first cell nearest the clue.
const lineFromClue = ({ side, line }) => {
  if (side === 'top') return graph.column(line);
  if (side === 'bottom') return graph.column(line).reverse();
  if (side === 'left') return graph.row(line);
  return graph.row(line).reverse();
};

// A connected n-cell cage holding a cell of the clue's line stays within n-1
// lines of it, so a label can only appear in that band.
const inBand = (clue, cell) => {
  const { row, col } = parseCellId(cell);
  const across = clue.side === 'top' || clue.side === 'bottom' ? col : row;
  return Math.abs(across - clue.line) <= clue.n - 1;
};
const bandCells = clue => gridCells.filter(cell => inBand(clue, cell));

// Grid cells hold digits; layer cells hold NONE or a label whose band covers
// them; barrier and unused parking cells hold NONE; a parking cell holds NONE
// or its own label.
const gridDigits = graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));
const layerDomains = layers.flatMap((_, layerIndex) => {
  const layerClues = clues.filter(clue => clue.layerIndex === layerIndex);
  const parkingCells = new Map(layerClues.filter(c => c.park).map(c => [c.park, c.label]));
  return [
    ...gridCells.map(cell => new Given(layerCell(layerIndex, cell), NONE,
      ...layerClues.filter(clue => inBand(clue, cell)).map(clue => clue.label))),
    ...Array.from({ length: 9 }, (_, i) => layerVars[layerIndex].cell(BARRIER_ROW, i + 1))
      .map(cell => new Given(cell, NONE)),
    ...Array.from({ length: 9 }, (_, i) => layerVars[layerIndex].cell(PARKING_ROW, i + 1))
      .map(cell => parkingCells.has(cell)
        ? new Given(cell, NONE, parkingCells.get(cell)) : new Given(cell, NONE)),
  ];
});

// The X-th cell from the clue's end carries the clue's label; a clue with a
// parking cell may instead park its label, and then that cell carries the
// label of an earlier clue with the same m(n) (the cage they share is labelled
// by its first clue).
const anchors = clues.map(clue => {
  const line = lineFromClue(clue);
  const anchorLabel = cell => {
    const labelCell = layerCell(clue.layerIndex, cell);
    if (!clue.park) return new Given(labelCell, clue.label);
    const shareKey = Pair.fnToKey((park, label) =>
      (park === NONE && label === clue.label)
      || (park === clue.label && clue.earlier.includes(label)), shape);
    return new Pair(shareKey, `${clue.m}(${clue.n}) own or shared cage`, clue.park, labelCell);
  };
  return new Or(line.map((cell, i) =>
    new And([new Given(line[0], i + 1), anchorLabel(cell)])));
});

// Each label is one orthogonally connected set (the cage, or the parking cell).
const cageRegions = clues.map(clue =>
  new ConnectedValues('V' + layerVars[clue.layerIndex].prefix, clue.label));

// Each label's cells hold n different digits summing to m. The machine reads
// the band as (label, digit) pairs, after the parking cell when there is one:
// `phase` says which symbol comes next (`take` and `skip` both precede a digit,
// `take` meaning the cell just read carries this label), `mask` is the set of
// digits collected, `parked` whether the label sits on the parking cell, in
// which case no grid cell may carry it.
const bitCount = mask => [...Array(10).keys()].filter(d => mask & (1 << d)).length;
const bitSum = mask => [...Array(10).keys()].filter(d => mask & (1 << d)).reduce((s, d) => s + d, 0);
const cageMachine = ({ m, n, label, park }) => NFA.encodeSpec({
  startState: { parked: false, phase: park ? 'park' : 'label', mask: 0 },
  transition: ({ parked, phase, mask }, value) => {
    if (phase === 'park') return { parked: value === label, phase: 'label', mask };
    if (phase === 'label') {
      if (value !== label) return { parked, phase: 'skip', mask };
      return parked ? undefined : { parked, phase: 'take', mask };
    }
    if (phase === 'skip') return { parked, phase: 'label', mask };
    if (value > 9) return undefined;
    const bit = 1 << value;
    if (mask & bit) return undefined;
    const next = mask | bit;
    if (bitCount(next) > n || bitSum(next) > m) return undefined;
    return { parked, phase: 'label', mask: next };
  },
  accept: ({ parked, phase, mask }) => phase === 'label'
    && (parked ? mask === 0 : bitCount(mask) === n && bitSum(mask) === m),
}, shape);
const cageContents = clues.map(clue => new NFA(
  cageMachine(clue), `${clue.m}(${clue.n}) cage`,
  ...(clue.park ? [clue.park] : []),
  ...bandCells(clue).flatMap(cell => [layerCell(clue.layerIndex, cell), cell])));

// Cages do not overlap across layers either: a cell is labelled on at most one.
const exclusiveKey = Pair.fnToKey((a, b) => a === NONE || b === NONE, shape);
const oneCagePerCell = gridCells.flatMap(cell =>
  layers.flatMap((_, a) => layers.slice(a + 1).map((_, offset) =>
    new Pair(exclusiveKey, 'one cage per cell',
      layerCell(a, cell), layerCell(a + 1 + offset, cell)))));

return [
  shape,
  ...layerVars,
  gridDigits,
  ...layerDomains,
  ...anchors,
  ...cageRegions,
  ...cageContents,
  ...oneCagePerCell,
];
