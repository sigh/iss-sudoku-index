// Title: Double Choco
// Author: Unknown
// Video: https://www.youtube.com/watch?v=S723gWflAHc
// Source: https://tinyurl.com/sdtjfz4

// Double Choco, 10x10, no digits. Rules encoded:
//  - Divide the grid into blocks (orthogonally connected groups of cells).
//  - Each block contains one white area and one grey area of the same size and
//    shape: each area is one orthogonally connected group of cells of its
//    colour, and the two are congruent under any of the eight rotations and
//    reflections.
//  - A number gives the number of cells of its own colour in its block.
// Nothing is omitted.
//
// The grid is a block-label layer: labels 1-9 are the clued blocks, numbered by
// the clue in reading order, and 10 is an unclued block. Two clues may share a
// block only when their values agree (the grey 4 with the white 4, the grey 8
// with the white 8); a shared block carries the lower clue's label, so labels
// 7 and 9 may be unused. The distinct clue values 4-10 need at least one block
// each, 98 cells in all, so at most 2 cells are unclued: an unclued block is a
// single grey-white domino and there is at most one.
//
// Congruence is one Or per clued block over the rigid motions (isometry,
// translation) that could carry its grey area onto its white area. No cell
// records which motion applies, so a symmetric area does not multiply
// solutions. The grey areas are connected on a copy of the grey labels; the
// white area is a rigid image of the grey one, so it is connected too, and a
// 16-branch Or over the grey/white boundary edges makes the block connected.

const shape = new Shape('10x10', 10, 'Raw');
const graph = cellGraph(shape);
const SIZE = 10;
const UNCLUED = 10;

// Drawn shading, from the shaded-cell layer: '#' grey, '.' white, R1 first.
const SHADING = [
  '#######...',
  '#######...',
  '#######...',
  '#######...',
  '#######...',
  '#######...',
  '#######...',
  '..........',
  '..........',
  '.........#',
];

// Drawn numbers, as [row, col, value], in reading order; index + 1 is the
// block label the clue's block carries.
const CLUES = [
  [1, 3, 9], [2, 3, 7], [3, 3, 5], [3, 4, 6], [3, 5, 4], [4, 5, 8],
  [4, 8, 4], [5, 5, 10], [6, 8, 8],
];

const greyCells = [];
const whiteCells = [];
for (const cell of graph.cells()) {
  const { row, col } = parseCellId(cell);
  (SHADING[row - 1][col - 1] === '#' ? greyCells : whiteCells).push(cell);
}
if (greyCells.length !== 50 || whiteCells.length !== 50) {
  throw new Error('shading is not 50 grey / 50 white');
}
const greySet = new Set(greyCells);
const isGrey = (cell) => greySet.has(cell);

// Labels a clue cell may carry: its own, or the earlier clue of the same
// value on the other colour when the two share a block.
const clueCell = (i) => makeCellId(CLUES[i][0], CLUES[i][1]);
const clueLabel = (i) => i + 1;
const labelDomain = new Map();
for (let i = 0; i < CLUES.length; i++) {
  const [r, c, n] = CLUES[i];
  const domain = [clueLabel(i)];
  for (let j = 0; j < i; j++) {
    if (CLUES[j][2] === n && isGrey(clueCell(j)) !== isGrey(clueCell(i))) {
      domain.unshift(clueLabel(j));
    }
  }
  labelDomain.set(makeCellId(r, c), domain);
}
// The lower label a clue's block carries when shared, or null.
const sharedLabel = (i) => {
  const domain = labelDomain.get(clueCell(i));
  return domain.length > 1 ? domain[0] : null;
};
const mayCarry = (cell, label) =>
  !labelDomain.has(cell) || labelDomain.get(cell).includes(label);

// Grey/white boundary edges, as [grey, white]: a block is connected exactly
// when its two areas meet across one of these.
const boundaryEdges = [];
for (const g of greyCells) {
  for (const nb of graph.neighbours(g)) {
    if (!isGrey(nb)) boundaryEdges.push([g, nb]);
  }
}

// Grey-label layer: grey cells copy their block label, white cells hold
// UNCLUED as a marker, so ConnectedValues on a label sees exactly that block's
// grey area. Labels 7 and 9 may be unused, and ConnectedValues rejects an
// empty set, so each has a dummy cell on a white position next to no grey
// position (row 10) that carries the label exactly when it is unused.
const greyLabels = graph.makeOverlay('VG');
const greyLabelVar = greyLabels.toVar('Grey-half block labels');
const dummyFor = new Map([
  [7, greyLabelVar.cell(10, 1)],
  [9, greyLabelVar.cell(10, 2)],
]);
const dummyCells = new Set(dummyFor.values());
const dummyTies = [];
for (const [label, dummy] of dummyFor) {
  const i = label - 1;
  const shared = sharedLabel(i);
  // The clue cell carries `shared` when the block is shared (label unused).
  const key = Pair.fnToKey(
    (a, b) => (a === shared && b === label) || (a === label && b === UNCLUED),
    shape);
  dummyTies.push(new Pair(key, `dummy${label}`, clueCell(i), dummy));
}

// Unclued domino count + 1 (1: none, 2: one domino).
const uncluedVar = new Var('U', 'Unclued dominoes + 1', 1);
const uncluedCount = uncluedVar.cells()[0];

// Exactly `left` cells of value `label` among the scanned cells, where `left`
// is set from the first cell: value - 1 for the domino count, or `n` when the
// first cell carries `label` (the block is not shared) and 0 otherwise.
const countSpec = (label, first) => NFA.encodeSpec({
  startState: { left: null },
  transition: ({ left }, value) => {
    if (left === null) return { left: first(value) };
    if (value !== label) return { left };
    return left > 0 ? { left: left - 1 } : undefined;
  },
  accept: ({ left }) => left === 0,
}, shape);

// Congruence machine for `label`. Segment 1 is a list of (grey, white) pairs
// related by one rigid motion: both cells carry the label or neither does.
// Segment 2 is the ring of same-colour cells around each mapped group, none of
// which may carry the label. The grey area is connected and holds a mapped
// cell, so it cannot leave the mapped grey group; its image then has the
// block's whole white count, so the white area is exactly that image.
const mapSpec = (label) => NFA.encodeSpec({
  startState: { mode: 'pair', expect: null },
  transition: ({ mode, expect }, value) => {
    if (value === SEGMENT_BREAK) {
      return mode === 'pair' && expect === null ? { mode: 'ring' } : undefined;
    }
    if (mode === 'ring') return value === label ? undefined : { mode };
    if (expect === null) return { mode, expect: value === label };
    return (value === label) === expect ? { mode, expect: null } : undefined;
  },
  accept: ({ mode, expect }) => mode === 'ring' || expect === null,
}, shape, { multiSegment: true });

// The eight isometries of the square lattice: optionally swap the axes, then
// optionally negate each coordinate.
const isometry = (t, row, col) => {
  const [a, b] = (t & 1) ? [col, row] : [row, col];
  return [(t & 2) ? -a : a, (t & 4) ? -b : b];
};
const cellAt = (row, col) =>
  row >= 1 && row <= SIZE && col >= 1 && col <= SIZE ? makeCellId(row, col) : null;

// The connected group of `start` within `allowed`.
const componentOf = (start, allowed) => {
  const seen = new Set([start]);
  const stack = [start];
  while (stack.length) {
    for (const nb of graph.neighbours(stack.pop())) {
      if (allowed.has(nb) && !seen.has(nb)) {
        seen.add(nb);
        stack.push(nb);
      }
    }
  }
  return seen;
};

// One NFA per rigid motion that could carry the grey area of clue i onto its
// white area: every (grey, white) cell pair the motion relates, restricted to
// the connected group of mapped cells holding the clue, plus the rings of
// same-colour cells around both groups. Motions relating the same pairs are
// listed once. A motion is skipped only for reasons the encoding enforces
// elsewhere: fewer than n mapped cells around the clue, or no mapped grey cell
// touching a mapped white cell (the block could not be connected).
const congruenceBranches = (i) => {
  const [, , n] = CLUES[i];
  const label = clueLabel(i);
  const anchor = clueCell(i);
  const anchorGrey = isGrey(anchor);
  const greyAllowed = greyCells.filter(cell => mayCarry(cell, label));
  const whiteAllowed = new Set(whiteCells.filter(cell => mayCarry(cell, label)));
  const branches = new Map();
  for (let t = 0; t < 8; t++) {
    for (let dr = -2 * SIZE; dr <= 2 * SIZE; dr++) {
      for (let dc = -2 * SIZE; dc <= 2 * SIZE; dc++) {
        const pairs = new Map();
        for (const g of greyAllowed) {
          const { row, col } = parseCellId(g);
          const [ir, ic] = isometry(t, row, col);
          const w = cellAt(ir + dr, ic + dc);
          if (w !== null && whiteAllowed.has(w)) pairs.set(g, w);
        }
        if (pairs.size < n) continue;
        let greyGroup;
        if (anchorGrey) {
          if (!pairs.has(anchor)) continue;
          greyGroup = componentOf(anchor, new Set(pairs.keys()));
        } else {
          const inverse = new Map([...pairs].map(([g, w]) => [w, g]));
          if (!inverse.has(anchor)) continue;
          const whiteGroup = componentOf(anchor, new Set(inverse.keys()));
          greyGroup = new Set([...whiteGroup].map(w => inverse.get(w)));
        }
        if (greyGroup.size < n) continue;
        const whiteGroup = new Set([...greyGroup].map(g => pairs.get(g)));
        if (![...greyGroup].some(g => graph.neighbours(g).some(nb => whiteGroup.has(nb)))) {
          continue;
        }
        const ring = new Set();
        for (const side of [greyGroup, whiteGroup]) {
          for (const cell of side) {
            for (const nb of graph.neighbours(cell)) {
              if (!side.has(nb) && isGrey(nb) === isGrey(cell) && mayCarry(nb, label)) {
                ring.add(nb);
              }
            }
          }
        }
        const greyList = [...greyGroup].sort();
        const key = greyList.map(g => `${g}>${pairs.get(g)}`).join(' ');
        if (branches.has(key)) continue;
        const pairCells = greyList.flatMap(g => [g, pairs.get(g)]);
        const segments = ring.size ? [pairCells, [...ring].sort()] : [pairCells];
        branches.set(key, new NFA(mapSpec(label), `map${label}`, ...segments));
      }
    }
  }
  return [...branches.values()];
};

const sharedBranch = (i) =>
  sharedLabel(i) === null ? [] : [new Given(clueCell(i), sharedLabel(i))];

return [
  shape,
  greyLabelVar,
  uncluedVar,

  // Each clue cell carries its own label, or the shared block's lower label.
  ...CLUES.map((_, i) => new Given(clueCell(i), ...labelDomain.get(clueCell(i)))),

  // Grey-label layer: copies on grey cells, the marker on white cells, and the
  // two dummies tied to whether their clue's block is shared.
  ...greyCells.map(cell => new SameValues(2, cell, greyLabels.at(cell))),
  ...greyLabels.at(whiteCells)
    .filter(cell => !dummyCells.has(cell))
    .map(cell => new Given(cell, UNCLUED)),
  ...dummyTies,

  // Each clued block has n cells of each colour: exactly n when the block
  // carries this label, none when the clue's block is shared.
  ...CLUES.flatMap(([, , n], i) => {
    const label = clueLabel(i);
    if (sharedLabel(i) === null) {
      const values = new Array(n).fill(label).join('_');
      return [
        new ContainExact(values, ...greyCells),
        new ContainExact(values, ...whiteCells),
      ];
    }
    const spec = countSpec(label, value => (value === label ? n : 0));
    return [
      new NFA(spec, `count${label}`, clueCell(i), ...greyCells),
      new NFA(spec, `count${label}`, clueCell(i), ...whiteCells),
    ];
  }),

  // Each clued block's grey area is one connected group.
  ...CLUES.map((_, i) => new ConnectedValues('VG', clueLabel(i))),

  // Each clued block is connected: its two areas meet across a boundary edge.
  ...CLUES.map((_, i) => new Or([
    ...sharedBranch(i),
    ...boundaryEdges.map(([g, w]) => new And([
      new Given(g, clueLabel(i)), new Given(w, clueLabel(i)),
    ])),
  ])),

  // Each clued block's white area is a rigid image of its grey area.
  ...CLUES.map((_, i) => new Or([...sharedBranch(i), ...congruenceBranches(i)])),

  // At most one unclued block, a grey-white domino across a boundary edge, and
  // exactly 2 * (U - 1) cells carry the unclued label.
  new Or([
    new Given(uncluedCount, 1),
    ...boundaryEdges.map(([g, w]) => new And([
      new Given(uncluedCount, 2), new Given(g, UNCLUED), new Given(w, UNCLUED),
    ])),
  ]),
  new NFA(countSpec(UNCLUED, value => 2 * (value - 1)), 'domino',
    uncluedCount, ...graph.cells()),
];
