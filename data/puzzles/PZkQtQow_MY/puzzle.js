// Title: Assembly Required
// Author: Staxis
// Video: https://www.youtube.com/watch?v=PZkQtQow_MY
// Source: https://sudokupad.app/vanmy8509l
//
// Normal sudoku. Arrows, region sum lines, Renban lines, Dutch whisper
// lines, and parity lines are not given and must be placed by the solver.
// A white circle must be on an arrow, a blue circle on a region sum line, a
// pink circle on a Renban line, an orange circle on a Dutch whisper, and a
// red circle on a parity line. There are exactly 9 cells belonging to
// arrows (circles and lines combined), and they contain every digit 1-9
// once each; the same is true separately for region sums, Renbans, Dutch
// whispers, and parity lines. No cell belongs to more than one of these
// five groups.
//
// Encoded: a category Var overlay (VC1..VC81) assigns every cell to
// NONE/ARROW/RSUM/RENBAN/DUTCH/PARITY (values 1-6); the known circled cells
// are fixed to their category. For each of the five line categories, an NFA
// scans all 81 cells in order, reading (category, digit); whenever the
// category matches the target it marks the digit's bit in a 9-bit mask and
// rejects a repeat, and only accepts once the mask covers every digit
// 1-9. Since only 9 distinct digits exist, this simultaneously forces
// "exactly 9 member cells" and "those cells contain every digit once" for
// that category, without needing a separate count constraint. A single Var
// per cell already makes the five categories mutually exclusive.
//
// Omitted (the puzzle's central "assembly" challenge): which specific cells
// form each individual arrow/region-sum/Renban/Dutch-whisper/parity line,
// their connectivity, and every digit-adjacency rule that depends on a
// line's actual path -- arrow arm sums equalling the circled digit, region
// sum line box-segment equality, Renban per-line consecutiveness, Dutch
// whisper per-line minimum difference, and parity per-line alternation.
// Only the aggregate bookkeeping (exclusivity, per-category cardinality,
// and per-category digit coverage) is enforced; individual line topology
// and order are not.

const CATEGORY = { NONE: 1, ARROW: 2, RSUM: 3, RENBAN: 4, DUTCH: 5, PARITY: 6 };

const graph = cellGraph('9x9');
const category = graph.makeOverlay('VC');
const catCell = cell => category.at(cell);
const gridCells = graph.cells();

// Restrict every category Var to the 6 real category codes (the Var's
// default domain otherwise runs 1-9, matching the main grid's value range).
// All 81 Givens share the same value set, so Replicate stamps the template
// instead of hand-rolling each copy.
const domainTargets = category.at(gridCells);
const domainOrigin = domainTargets[0];

// Known circled cells (color from the source drawing), fixed to their line
// category. Exact line paths from each circle are not known.
const circledCells = {
  ARROW: ['R2C5', 'R6C6', 'R6C4'],
  RSUM: ['R4C4', 'R5C7', 'R9C2'],
  DUTCH: ['R5C5', 'R9C4', 'R8C1', 'R5C1', 'R4C3'],
  RENBAN: ['R8C5', 'R9C1', 'R1C4', 'R2C8'],
  PARITY: ['R8C3', 'R2C2', 'R6C9', 'R8C9', 'R3C9'],
};

// For a target category: scan all 81 cells in order, reading (category,
// digit). While category != target, stay in the current mask. When
// category == target, mark the digit's bit; a repeat digit rejects. Only
// accepts once every one of the 9 digit bits has been set -- forcing
// exactly 9 member cells with all-different digits covering 1-9.
const FULL_MASK = 0b111111111;
const makeCoverageMachine = target => NFA.encodeSpec({
  startState: { phase: 'category', isTarget: false, mask: 0 },
  transition: ({ phase, isTarget, mask }, value) => {
    if (phase === 'category') return { phase: 'digit', isTarget: value === target, mask };
    if (!isTarget) return { phase: 'category', isTarget: false, mask };
    const bit = 1 << (value - 1);
    if (mask & bit) return undefined;
    return { phase: 'category', isTarget: false, mask: mask | bit };
  },
  accept: ({ phase, mask }) => phase === 'category' && mask === FULL_MASK,
}, graph.gridGeometry().numValues);

const coverageArgs = [];
for (const cell of gridCells) coverageArgs.push(catCell(cell), cell);

return [
  new Shape('9x9'),
  category.toVar('category'),
  category.makeReplicate(
    new Given(domainOrigin, CATEGORY.NONE, CATEGORY.ARROW, CATEGORY.RSUM,
      CATEGORY.RENBAN, CATEGORY.DUTCH, CATEGORY.PARITY),
    domainTargets),
  ...Object.entries(circledCells).flatMap(([categoryName, cells]) =>
    cells.map(cell => new Given(catCell(cell), CATEGORY[categoryName]))
  ),
  ...Object.entries(CATEGORY)
    .filter(([categoryName]) => categoryName !== 'NONE')
    .map(([categoryName, target]) =>
      new NFA(makeCoverageMachine(target), 'coverage-' + categoryName, ...coverageArgs)
    ),
];
