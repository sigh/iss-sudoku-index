// Title: 625
// Author: zetamath
// Video: https://www.youtube.com/watch?v=A_ZPQTpI7Bo
// Source: https://app.crackingthecryptic.com/sudoku/8P6Qq6QRpj

// Rows and columns 1-9 as stated; no box regions -- the cage set is
// unsatisfiable with default 3x3 boxes (checked directly against the
// solver: the first seven cages alone reject every completion with boxes on,
// and accept one with boxes off), so the drawn cages are this grid's only
// regions smaller than a row/column. Digits may not repeat along the drawn
// diagonal R1C9..R9C1 (the '/' diagonal).
// Cages sum to their printed total with no repeats; two drawn cages carry no
// printed total ("??" in the payload) so only their no-repeat property is
// encoded.
// Every cell is shaded or unshaded (the VS overlay below, SHADED=1,
// UNSHADED=2 -- the grid's two lowest values). Every cage is entirely
// shaded or entirely unshaded. Every row/column has at least one shaded
// cell.
// In each row and column, the cell holding the digit equal to that row's/
// column's shaded-cell count is marked with a square or a circle (drawn as
// an underlay); a circle means that row's/column's shaded cells form one
// contiguous orthogonal run, a square means they do not. The rules
// explicitly leave open whether a given mark is read for its row, its
// column, or both -- so every marker drawn in a row is a candidate for that
// row's count-cell (likewise for columns), encoded as an Or, never resolved
// to one reading.

const SHADED = 1, UNSHADED = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');

// Connectivity over a 9-cell row/column scan of shade values, read as a run
// of SHADED cells. State `run`: 0 before any run, 1 inside the first run,
// 2 after it ended (a gap), 3 once a second run has started -- a sink, since
// "not all connected" only needs a second run to exist, however long.
// CONNECTED_SPEC accepts run < 3 (zero or one run); DISCONNECTED_SPEC
// accepts only run === 3 (two or more runs). Verified against a hand-built
// accept/reject fixture (0/1/2/3-run cases) before use.
function runSpec(wantConnected) {
  return NFA.encodeSpec({
    startState: { run: 0 },
    transition: (state, value) => {
      const shaded = value === SHADED;
      switch (state.run) {
        case 0: return { run: shaded ? 1 : 0 };
        case 1: return { run: shaded ? 1 : 2 };
        case 2: return { run: shaded ? 3 : 2 };
        case 3: return { run: 3 };
      }
    },
    accept: state => wantConnected ? state.run !== 3 : state.run === 3,
    maxDepth: 9,
  }, cellGeometry('9x9'));
}
const CONNECTED_SPEC = runSpec(true);
const DISCONNECTED_SPEC = runSpec(false);

// [cells, total|null]. Provenance: the drawn cages' top-left small clues;
// the two null-total cages are the drawn cages with no printed total.
const CAGES = [
  [['R1C4', 'R1C5', 'R2C5'], 7],
  [['R1C7', 'R2C7', 'R2C8', 'R2C9'], 18],
  [['R2C3', 'R3C3', 'R3C4', 'R3C5'], 30],
  [['R3C1', 'R3C2', 'R4C1', 'R5C1', 'R5C2'], 15],
  [['R4C2', 'R4C3', 'R5C3', 'R5C4'], 29],
  [['R4C4', 'R4C5', 'R4C6', 'R5C5', 'R6C5'], 30],
  [['R3C7', 'R4C7', 'R5C6', 'R5C7'], 30],
  [['R6C6', 'R6C7', 'R6C8', 'R7C7'], null],
  [['R3C8', 'R3C9', 'R4C9'], 6],
  [['R4C8', 'R5C8', 'R5C9'], 8],
  [['R6C4', 'R7C4', 'R7C5'], 9],
  [['R8C5', 'R9C5', 'R8C6'], 6],
  [['R9C1', 'R9C2', 'R8C2', 'R8C3'], 19],
  [['R8C7', 'R9C7', 'R9C8', 'R9C9'], null],
];

const cageConstraints = CAGES.flatMap(([cells, total]) => [
  total === null ? new AllDifferent(...cells) : new Cage(total, ...cells),
  // Every cage is entirely shaded or entirely unshaded: force its shade
  // cells to a single common value (SameValues with as many sets as cells
  // makes each singleton set -- i.e. every cell -- equal).
  new SameValues(cells.length, ...shade.at(cells)),
]);

// Diagonal R1C9..R9C1 is the '/' diagonal (direction 1; '\' is -1).
const diagonal = new Diagonal(1);

// Vars carry no implicit domain restriction, so every shade cell needs its
// own two-value Given to stay in {SHADED, UNSHADED}; Replicate stamps the
// one-cell template onto all 81 rather than writing 81 explicit Givens.
const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], SHADED, UNSHADED), shade.cells());

const atLeastOneShaded = [
  ...graph.rows().map(cells => new ContainAtLeast('1', ...shade.at(cells))),
  ...graph.columns().map(cells => new ContainAtLeast('1', ...shade.at(cells))),
];

// Drawn underlays: cell + shape (a rounded underlay is a circle, a
// square-cornered one is a square). R6C2 carries both a square and a circle
// underlay at the same cell -- two independent marker instances at one
// position.
const MARKERS = [
  { cell: 'R1C5', shape: 'square' },
  { cell: 'R2C7', shape: 'square' },
  { cell: 'R4C7', shape: 'square' },
  { cell: 'R5C6', shape: 'square' },
  { cell: 'R7C6', shape: 'square' },
  { cell: 'R6C2', shape: 'square' },
  { cell: 'R3C4', shape: 'square' },
  { cell: 'R4C1', shape: 'circle' },
  { cell: 'R6C2', shape: 'circle' },
  { cell: 'R5C7', shape: 'circle' },
  { cell: 'R1C8', shape: 'circle' },
  { cell: 'R3C7', shape: 'circle' },
  { cell: 'R5C9', shape: 'circle' },
  { cell: 'R7C5', shape: 'circle' },
  { cell: 'R8C5', shape: 'circle' },
  { cell: 'R9C1', shape: 'circle' },
  { cell: 'R4C3', shape: 'circle' },
];

// A marker "serves" a line (its own row or its own column) when its digit
// equals that line's shaded-cell count and the line's shaded cells satisfy
// its shape's connectivity. The count equality uses an affine Sum trick:
// with SHADED=1/UNSHADED=2, summing all `n` line cells' shade values gives
// 2n - shadedCount, so shadeSum + markerDigit == 2n exactly when
// markerDigit == shadedCount (verified against hand cases before use).
function markerServes(marker, lineCells) {
  const shadeCells = shade.at(lineCells);
  const spec = marker.shape === 'circle' ? CONNECTED_SPEC : DISCONNECTED_SPEC;
  return new And([
    new Sum(2 * lineCells.length, ...shadeCells, marker.cell),
    new NFA(spec, 'RUN', ...shadeCells),
  ]);
}

// Every row/column is served by at least one of its own drawn markers --
// never resolved to a single "the" marker, per the rules' own ambiguity.
const lineClues = [];
for (let r = 1; r <= 9; r++) {
  const candidates = MARKERS.filter(m => parseCellId(m.cell).row === r);
  lineClues.push(new Or(candidates.map(m => markerServes(m, graph.row(r)))));
}
for (let c = 1; c <= 9; c++) {
  const candidates = MARKERS.filter(m => parseCellId(m.cell).col === c);
  lineClues.push(new Or(candidates.map(m => markerServes(m, graph.column(c)))));
}

return [
  new Shape('9x9'),
  new NoBoxes(),
  shade.toVar('shading'),
  diagonal,
  ...cageConstraints,
  shadeDomain,
  ...atLeastOneShaded,
  ...lineClues,
];
