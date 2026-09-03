// Title: Rika's Endless Summer
// Author: SUDOOOOOKUfan87
// Video: https://www.youtube.com/watch?v=7f9Ebmslh5c
// Source: https://app.crackingthecryptic.com/sudoku/3QPdQd6Grn

// Normal sudoku rules apply; the grid has no given digits.
// Every cell is either island or water. Each shaded cell is an island cell; the
// digit in it is the number of cells in that island. Each island contains
// exactly one shaded cell, and the island's digits do not repeat and sum to the
// total printed in that shaded cell. Different islands may not touch
// orthogonally. The water cells are orthogonally connected and contain no 2x2
// area of water. Every clause above is encoded. The rules' closing sentence,
// that island totals are not necessarily in the top left most cell of an
// island, is a note about where the number is drawn rather than a constraint:
// the total is read as a property of the whole island wherever its shaded cell
// sits, which is what the model does.
//
// Model. One label overlay VL carries the shading and the island partition:
// 0 is water, k is the island anchored at the kth shaded cell. Naming each
// island after its own shaded cell is a definition rather than a choice --
// every island holds exactly one shaded cell, so islands and shaded cells
// correspond one to one, and no label symmetry remains.
// One masked-digit overlay per island (VA..VK) carries that island's digits,
// with 0 on the cells left off it, which turns "the island's digits" into a
// fixed cell list the digit rules can be stated over.
// The value range is widened to 0-11 to hold those two overlays' values; the
// grid's own cells are restricted back to 1-9.

// Drawn data: the eleven shaded cells and the totals printed in them.
const clues = [
  { cell: 'R1C2', total: 20 },
  { cell: 'R2C3', total: 8 },
  { cell: 'R2C7', total: 8 },
  { cell: 'R1C5', total: 20 },
  { cell: 'R4C1', total: 8 },
  { cell: 'R5C6', total: 8 },
  { cell: 'R6C9', total: 24 },
  { cell: 'R9C9', total: 24 },
  { cell: 'R7C6', total: 20 },
  { cell: 'R8C3', total: 8 },
  { cell: 'R9C2', total: 8 },
];

const WATER = 0;      // VL value for a water cell; 1..11 label the islands
const OFF = 0;        // masked-digit value for a cell left off the island
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// One overlay group per island; the letters are only group names.
const MASK_PREFIXES = [
  'VA', 'VB', 'VC', 'VD', 'VE', 'VF', 'VG', 'VH', 'VI', 'VJ', 'VK'];

const shape = new Shape('9x9', `0-${clues.length}`);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const label = graph.makeOverlay('VL');
const anchors = new Set(clues.map(clue => clue.cell));

// The digit sets an island with this total can hold: distinct digits summing to
// the total, whose count is itself one of them -- the shaded cell's digit is
// both one of the island's digits and the island's cell count.
const digitSets = (total) => {
  const sets = [];
  for (let bits = 1; bits < (1 << DIGITS.length); bits++) {
    const set = DIGITS.filter(d => bits & (1 << (d - 1)));
    const sum = set.reduce((a, b) => a + b, 0);
    if (sum === total && set.includes(set.length)) sets.push(set);
  }
  return sets;
};

// The cells that could lie on the island anchored at `anchor`. Two rules bound
// them: no island cell is another island's shaded cell or orthogonally adjacent
// to one (islands may not touch), and the island is connected with at most
// `maxSize` cells, so every cell is within maxSize-1 steps of the anchor
// through other cells of the island. Dropping unreachable cells can cut the
// path to others, so the reachable set is taken to a fixed point.
const candidateCells = (anchor, maxSize) => {
  let allowed = new Set(gridCells.filter(
    cell => cell === anchor || (
      !anchors.has(cell) &&
      !graph.neighbours(cell).some(n => n !== anchor && anchors.has(n)))));
  for (; ;) {
    const reached = new Set([anchor]);
    let frontier = [anchor];
    for (let step = 1; step < maxSize; step++) {
      const next = [];
      for (const cell of frontier) {
        for (const n of graph.neighbours(cell)) {
          if (allowed.has(n) && !reached.has(n)) {
            reached.add(n);
            next.push(n);
          }
        }
      }
      frontier = next;
    }
    if (reached.size === allowed.size) return gridCells.filter(c => reached.has(c));
    allowed = reached;
  }
};

// An island also cannot be larger than its own candidate set, and dropping an
// oversized digit set lowers the reach bound above, so the two are taken to a
// joint fixed point.
const islandShape = (anchor, total) => {
  let sets = digitSets(total);
  for (; ;) {
    const cells = candidateCells(anchor, Math.max(...sets.map(s => s.length)));
    const feasible = sets.filter(set => set.length <= cells.length);
    if (feasible.length === sets.length) return { sets, cells };
    sets = feasible;
  }
};

const islands = clues.map(({ cell, total }, i) => {
  const { sets, cells } = islandShape(cell, total);
  return {
    id: i + 1,
    anchor: cell,
    sets,
    cells,
    mask: graph.makeOverlay(MASK_PREFIXES[i], cells),
  };
});

// The playable grid holds ordinary digits; the widened range exists only to
// give the overlays their 0 and their labels 10 and 11.
const gridDigits = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

// Which island a cell may belong to. A shaded cell is an island cell and is the
// one shaded cell of its own island, so its label is fixed; any other cell is
// water or on an island whose candidate cells include it.
const labelDomains = gridCells.map(cell => {
  const anchored = islands.find(island => island.anchor === cell);
  const values = anchored ? [anchored.id] : [
    WATER, ...islands.filter(i => i.cells.includes(cell)).map(i => i.id)];
  return new Given(label.at(cell), ...values);
});

// Each island is one orthogonally-connected region, and so is the water.
const connected = [
  ...islands.map(island => new ConnectedValues('VL', island.id)),
  new ConnectedValues('VL', WATER),
];

// Different islands may not touch orthogonally: two adjacent island cells carry
// the same label.
const sameIslandKey = Pair.fnToKey(
  (a, b) => a === WATER || b === WATER || a === b, shape);
const noTouch = [[0, 1], [1, 0]].map(([dRow, dCol]) => label.makeReplicate(
  new Pair(sameIslandKey, 'no touching islands',
    label.at(gridCells[0]), label.at(graph.step(gridCells[0], dRow, dCol))),
  label.at(gridCells.filter(cell => graph.step(cell, dRow, dCol)))));

// No 2x2 area of water: reading a 2x2 block of labels, state 0 means every cell
// so far was water and state 1 means an island cell has been seen; only state 1
// accepts.
const seenIslandNFA = NFA.encodeSpec({
  startState: 0,
  transition: (state, value) => value === WATER ? state : 1,
  accept: (state) => state === 1,
}, shape);
const no2x2Water = label.makeReplicate(
  new NFA(seenIslandNFA, 'no 2x2 water',
    ...label.at(graph.block(gridCells[0], 2, 2))),
  label.at(gridCells.filter(cell => graph.block(cell, 2, 2))));

// The masked-digit overlays: a candidate cell's mask is its own digit when the
// cell is on this island, and 0 when it is not.
const maskVars = islands.map(
  island => island.mask.toVar(`island ${island.id} digits`));
const maskDigitKey = Pair.fnToKey(
  (mask, digit) => mask === OFF || mask === digit, shape);
const maskDigits = islands.flatMap(island => island.cells.map(
  cell => new Pair(maskDigitKey, 'masked digit', island.mask.at(cell), cell)));
const maskMembership = islands.flatMap(island => {
  const key = Pair.fnToKey(
    (mask, id) => (mask !== OFF) === (id === island.id), shape);
  return island.cells.map(cell => new Pair(
    key, `on island ${island.id}`, island.mask.at(cell), label.at(cell)));
});

// The island's digits do not repeat and sum to the printed total, and the
// shaded cell's digit is the island's cell count. Each branch is one admissible
// digit set: it names the whole multiset the island's mask cells hold -- that
// digit set, plus one 0 for every candidate cell left off the island -- and
// pins the shaded cell to the set's size.
const islandDigits = islands.map(island => new Or(island.sets.map(set => new And([
  new Given(island.anchor, set.length),
  new ContainExact(
    [...Array(island.cells.length - set.length).fill(OFF), ...set].join('_'),
    ...island.mask.cells()),
]))));

return [
  shape,
  gridDigits,
  label.toVar('island'),
  ...labelDomains,
  ...connected,
  ...noTouch,
  no2x2Water,
  ...maskVars,
  ...maskDigits,
  ...maskMembership,
  ...islandDigits,
];
