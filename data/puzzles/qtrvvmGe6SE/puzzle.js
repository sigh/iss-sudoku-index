// Title: Hidden Pentominoes
// Author: Magnus Josefsson
// Video: https://www.youtube.com/watch?v=qtrvvmGe6SE
// Source: https://app.crackingthecryptic.com/sudoku/PB7bNLRffQ

// Rules encoded here, in full:
//  * Normal sudoku.
//  * Twelve unmarked pentomino-shaped killer cages, one of each of the twelve
//    free pentomino types (F I L N P T U V W X Y Z). Cages do not overlap and
//    may touch. Digits do not repeat within a cage, and the twelve cage totals
//    are all different.
//  * A letter in the corner of a cell: that cell is in that pentomino's cage.
//  * A letter outside the grid with a diagonal arrow: the digits on that
//    diagonal, from the cell the arrow enters to the far edge, total the same
//    as that pentomino's cage.
//  * "?" is an unknown letter. Each cage has at most one clue of each type
//    (corner letter, outside clue). W, X, U, I, Y and T each already carry one
//    clue of each type, so every "?" names one of F, L, N, P, V, Z; the two
//    corner "?"s name different pentominoes, and so do the three outside "?"s.
// Nothing is omitted.
//
// Model. A label overlay VG holds, per cell, the type of the cage covering it
// (1-12 in TYPES order) or 0 for no cage. Each type's cage is one Or over its
// placements on the board (only those through its corner letter, when it has
// one): a branch stamps the type on the placement's five cells, and
// ContainExact keeps the type to exactly five cells. Each type also has a
// masked digit overlay - a cell's digit where the cell is in that cage, 0
// elsewhere - so the cage total is a plain Sum, and the total is held in two
// base-5 Var digits (total = 9 + 5*hi + lo, hi and lo in 1-5, covering 15-35)
// that the outside clues and the all-different-totals rule read. The Shape is
// widened to 0-12 for the labels; grid cells are restricted back to 1-9.

// The twelve free pentominoes, one drawing each. Array order fixes the label
// stamped on VG: F=1, I=2, ..., Z=12.
const TYPES = [
  ['F', '.XX\nXX.\n.X.'],
  ['I', 'XXXXX'],
  ['L', 'X...\nXXXX'],
  ['N', 'XX..\n.XXX'],
  ['P', 'XX\nXX\nX.'],
  ['T', 'XXX\n.X.\n.X.'],
  ['U', 'X.X\nXXX'],
  ['V', 'X..\nX..\nXXX'],
  ['W', 'X..\nXX.\n.XX'],
  ['X', '.X.\nXXX\n.X.'],
  ['Y', '.X..\nXXXX'],
  ['Z', 'XX.\n.X.\n.XX'],
];
const NONE = 0;                       // VG label for a cell in no cage
const labelOf = letter => TYPES.findIndex(([name]) => name === letter) + 1;

// Corner letters, transcribed from the small text in cell corners.
const CORNER_LETTERS = [
  ['R1C1', 'W'], ['R1C7', 'X'], ['R2C1', '?'], ['R3C9', 'U'],
  ['R4C6', '?'], ['R8C8', 'I'], ['R9C4', 'T'], ['R9C9', 'Y'],
];

// Outside clues, transcribed from the large letters and their arrows: the
// letter, the first cell the arrow enters, and the arrow's direction. The
// diagonal runs from that cell to the far edge.
const OUTSIDE_CLUES = [
  ['I', 'R2C1', -1, 1],     // left, arrow up-right
  ['?', 'R4C1', -1, 1],     // left, arrow up-right
  ['X', 'R1C7', 1, 1],      // top, arrow down-right
  ['?', 'R3C9', 1, -1],     // right, arrow down-left
  ['Y', 'R7C9', 1, -1],     // right, arrow down-left
  ['W', 'R9C9', -1, -1],    // bottom-right corner, arrow up-left
  ['?', 'R9C4', -1, -1],    // bottom, arrow up-left
  ['T', 'R9C3', -1, -1],    // bottom, arrow up-left
  ['U', 'R9C2', -1, -1],    // bottom, arrow up-left
];

const shape = new Shape('9x9', '0-12');
const graph = cellGraph(shape);
const gridCells = graph.cells();

// --- Placements --------------------------------------------------------------
const sortCells = cells => cells.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
const normalise = cells => {
  const r0 = Math.min(...cells.map(([r]) => r));
  const c0 = Math.min(...cells.map(([, c]) => c));
  return sortCells(cells.map(([r, c]) => [r - r0, c - c0]));
};
const parseArt = art => normalise(art.split('\n').flatMap(
  (line, r) => [...line].flatMap((ch, c) => ch === 'X' ? [[r, c]] : [])));

// The distinct rotations and reflections of a shape.
const orientations = cells => {
  const seen = new Map();
  let turned = cells;
  for (let i = 0; i < 4; i++) {
    turned = turned.map(([r, c]) => [c, -r]);
    for (const image of [turned, turned.map(([r, c]) => [r, -c])]) {
      const norm = normalise(image);
      seen.set(JSON.stringify(norm), norm);
    }
  }
  return [...seen.values()];
};

// Every placement of a type on the board, as a cell list.
const placementsOf = art => orientations(parseArt(art)).flatMap(offsets => {
  const height = Math.max(...offsets.map(([r]) => r)) + 1;
  const width = Math.max(...offsets.map(([, c]) => c)) + 1;
  const out = [];
  for (let top = 1; top + height - 1 <= 9; top++) {
    for (let left = 1; left + width - 1 <= 9; left++) {
      out.push(offsets.map(([r, c]) => makeCellId(top + r, left + c)));
    }
  }
  return out;
});

// A corner letter puts its cell in that type's cage, so the type's candidate
// placements are the ones through that cell.
const anchorOf = new Map(CORNER_LETTERS
  .filter(([, letter]) => letter !== '?')
  .map(([cell, letter]) => [labelOf(letter), cell]));
const cages = TYPES.map(([letter, art], index) => {
  const label = index + 1;
  const anchor = anchorOf.get(label);
  const placements = placementsOf(art)
    .filter(cells => !anchor || cells.includes(anchor));
  const candidates = gridCells.filter(
    cell => placements.some(cells => cells.includes(cell)));
  return { letter, label, placements, candidates };
});

// The types no clue names: what a "?" can stand for.
const uncluedLabels = cages
  .filter(cage => !anchorOf.has(cage.label))
  .map(cage => cage.label);

// --- Overlays and Vars --------------------------------------------------------
const labels = graph.makeOverlay('VG');
const MASK_PREFIXES = ['VA', 'VB', 'VC', 'VD', 'VE', 'VF', 'VI', 'VJ', 'VK', 'VM', 'VN', 'VP'];
const masks = cages.map((cage, i) => graph.makeOverlay(MASK_PREFIXES[i], cage.candidates));
const totalHi = new Var('H', 'cage total, high base-5 digit', TYPES.length);
const totalLo = new Var('L', 'cage total, low base-5 digit', TYPES.length);
// Prefix S: VA..VP are the masks, VG the labels, VH/VL the totals, VQ the "?"s.
const maskDistinct = new Var('S', 'distinct values in each mask', TYPES.length);
const unknownOutside = OUTSIDE_CLUES.filter(([letter]) => letter === '?');
const outsideTypes = new Var('Q', 'type named by each outside "?"', unknownOutside.length);

const hiOf = label => totalHi.cell(label);
const loOf = label => totalLo.cell(label);
// total(cage) = 9 + 5*hi + lo, as the coefficient terms of a Sum.
const totalTerms = label => [[hiOf(label), -5], [loOf(label), -1]];
const TOTAL_BASE = 9;

// --- Cages: shape, membership, digits ----------------------------------------
const maskIsDigitOrEmpty = Pair.fnToKey(
  (digit, mask) => mask === NONE || mask === digit, shape);
const maskSelectsLabel = label => Pair.fnToKey(
  (cellLabel, mask) => (cellLabel === label) === (mask !== NONE), shape);

const cageConstraints = cages.flatMap((cage, i) => {
  const mask = masks[i];
  const { label } = cage;
  // A mask wider than the cage always shows a 0 alongside the five digits.
  const distinctValues = 5 + (cage.candidates.length > 5 ? 1 : 0);
  return [
    new Or(cage.placements.map(cells => new And(
      cells.map(cell => new Given(labels.at(cell), label))))),
    new ContainExact(Array(5).fill(label).join('_'), ...labels.cells()),
    ...cage.candidates.flatMap(cell => [
      new Pair(maskIsDigitOrEmpty, 'masked digit', cell, mask.at(cell)),
      new Pair(maskSelectsLabel(label), 'cage membership', labels.at(cell), mask.at(cell)),
    ]),
    new Sum(TOTAL_BASE, ...mask.cells(), ...totalTerms(label)),
    new Given(maskDistinct.cell(label), distinctValues),
    new CountDistinct(maskDistinct.cell(label), ...mask.cells()),
  ];
});

// Two totals agree exactly when both base-5 digits agree.
const distinctTotals = cages.flatMap((a, i) => cages.slice(i + 1).map(b => new Or([
  new AllDifferent(hiOf(a.label), hiOf(b.label)),
  new AllDifferent(loOf(a.label), loOf(b.label)),
])));

// --- Corner "?" letters -------------------------------------------------------
const unknownCorners = CORNER_LETTERS
  .filter(([, letter]) => letter === '?')
  .map(([cell]) => labels.at(cell));
const cornerUnknowns = [
  ...unknownCorners.map(cell => new Given(cell, ...uncluedLabels)),
  new AllDifferent(...unknownCorners),
];

// --- Outside clues -------------------------------------------------------------
const diagonalOf = (start, dRow, dCol) => graph.ray(start, dRow, dCol);
const outsideConstraints = OUTSIDE_CLUES.map(([letter, start, dRow, dCol]) => {
  const diagonal = diagonalOf(start, dRow, dCol);
  if (letter !== '?') {
    return new Sum(TOTAL_BASE, ...diagonal, ...totalTerms(labelOf(letter)));
  }
  const typeCell = outsideTypes.cell(unknownOutside.findIndex(clue => clue[1] === start) + 1);
  return new Or(uncluedLabels.map(label => new And([
    new Given(typeCell, label),
    new Sum(TOTAL_BASE, ...diagonal, ...totalTerms(label)),
  ])));
});

return [
  shape,
  labels.toVar('cage type per cell'),
  ...masks.map((mask, i) => mask.toVar(`${cages[i].letter} cage digits`)),
  totalHi,
  totalLo,
  maskDistinct,
  outsideTypes,
  // The widened alphabet is for the labels; grid digits stay 1-9.
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  ...totalHi.cells().map(cell => new Given(cell, 1, 2, 3, 4, 5)),
  ...totalLo.cells().map(cell => new Given(cell, 1, 2, 3, 4, 5)),
  ...outsideTypes.cells().map(cell => new Given(cell, ...uncluedLabels)),
  new AllDifferent(...outsideTypes.cells()),
  ...cageConstraints,
  ...distinctTotals,
  ...cornerUnknowns,
  ...outsideConstraints,
];
