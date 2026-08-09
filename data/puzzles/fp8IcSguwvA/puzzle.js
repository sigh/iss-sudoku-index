// Title: Broken Pencil
// Author: the_cogito
// Video: https://www.youtube.com/watch?v=fp8IcSguwvA
// Source: https://app.crackingthecryptic.com/sudoku/R2hQpqmG63

// Normal sudoku rules apply (givens below). Every row, column, and box holds
// exactly one negator cell (a 'VF' flag overlay, 1 = negator); the 9 negator
// cells hold all of 1-9 between them. On a line, a negator cell's digit
// counts as its negative. Four lines require equal (negated) sums across
// every box each one visits -- the box groupings below are the boxes each
// drawn line visits, in order, with the line's cells lying in that box.
//
// The grid is widened to alphabet 0-9 (offset -1) purely to give the 'VN'
// negated-part overlay a 0 candidate; playable grid, flag, and negator-part
// cells are each restricted back to their own true range via Given/Replicate.

const graph = cellGraph('9x9~0-9');
const cells = graph.cells();

const flags = graph.makeOverlay('VF');           // 1 = this cell is a negator
const flag = cell => flags.at(cell);

// Lines, as the boxes they visit and the cells of the line lying in that box
// (unique cells; a revisited box's cells are listed once, since the box's
// sum is over the set of cells the line covers there, not a per-visit total).
const lineBoxSegments = {
  A: [
    ['R1C1', 'R1C2', 'R2C1', 'R2C2', 'R3C3'],  // box1
    ['R3C4'],                                   // box2
    ['R4C3'],                                   // box4
    ['R4C4', 'R5C4', 'R5C5', 'R6C5', 'R6C6'],  // box5
    ['R6C7'],                                   // box6
    ['R7C6'],                                   // box8
    ['R7C7', 'R8C8', 'R9C8', 'R9C9', 'R8C9'],  // box9
  ],
  B: [
    ['R5C3', 'R6C2'],                           // box4
    ['R7C2', 'R7C3', 'R8C2', 'R8C3'],          // box7 (both drawn strokes)
    ['R6C4'],                                   // box5
    ['R8C4', 'R7C5', 'R7C4'],                  // box8
  ],
  C: [
    ['R3C6', 'R2C6'],                           // box2
    ['R2C7', 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R3C8'],  // box3
    ['R4C8', 'R4C7'],                           // box6
  ],
  D: [
    ['R9C7'],                                   // box9
    ['R9C6', 'R8C5', 'R9C4'],                  // box8
  ],
};

const lineCells = [...new Set(Object.values(lineBoxSegments).flat(2))];
const negParts = graph.makeOverlay('VN', lineCells);   // digit if negator else 0
const negPart = cell => negParts.at(cell);

// Effective (possibly negated) value of a line cell is digit - 2*negPart:
// negPart is 0 for a non-negator (effective value = digit) and equal to the
// digit for a negator (effective value = digit - 2*digit = -digit).
const segCoeffs = (segment, sign) => segment.flatMap(
  cell => [[cell, sign], [negPart(cell), -2 * sign]]);
const equalSum = (segA, segB) =>
  new Sum(0, ...segCoeffs(segA, 1), ...segCoeffs(segB, -1));

const equalSumConstraints = Object.values(lineBoxSegments).flatMap(
  segments => segments.slice(1).map(seg => equalSum(segments[0], seg)));

// Links a line cell's digit and flag to its negPart: negPart = digit when
// flag = 1 (negator), else 0.
const negPartLinkSpec = NFA.encodeSpec({
  startState: { phase: 'digit' },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'flag', digit: value };
    if (state.phase === 'flag') return { phase: 'negPart', digit: state.digit, flag: value };
    const expected = state.flag === 1 ? state.digit : 0;
    return value === expected ? { phase: 'done' } : undefined;
  },
  accept: state => state.phase === 'done',
}, 10, { valueOffset: -1 });

// Exactly one negator digit-value equal to `target` across the whole grid
// (scanned as interleaved digit/flag pairs) -- the 9 negator cells hold all
// of 1-9 between them.
const negatorDigitSpec = target => NFA.encodeSpec({
  startState: { phase: 'digit', count: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'flag', digit: value, count: state.count };
    const hit = (state.digit === target && value === 1) ? 1 : 0;
    return { phase: 'digit', count: Math.min(state.count + hit, 2) };
  },
  accept: state => state.phase === 'digit' && state.count === 1,
}, 10, { valueOffset: -1 });
const interleaveDigitFlag = someCells => someCells.flatMap(cell => [cell, flag(cell)]);

return [
  new Shape('9x9', '0-9'),
  new Given('R3C3', 7),
  new Given('R3C7', 2),
  new Given('R7C7', 6),

  // Restrict the playable grid back to true digits 1-9 (0 is a widening
  // artifact for the VN overlay only).
  graph.makeReplicate(new Given(cells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9), cells),

  flags.toVar('negator flags'),
  flags.makeReplicate(new Given(flags.at(cells[0]), 0, 1), flags.cells()),
  // Exactly one negator per row, column, and box (9 ones sum to 1 with 8
  // zeros, since flag values are 0/1).
  ...flags.rows().map(row => new Sum(1, ...row)),
  ...flags.columns().map(col => new Sum(1, ...col)),
  ...flags.boxes().map(box => new Sum(1, ...box)),
  ...Array.from({ length: 9 }, (_, i) => new NFA(
    negatorDigitSpec(i + 1), `negator digit ${i + 1}`, ...interleaveDigitFlag(cells))),

  negParts.toVar('negator part'),
  ...lineCells.map(cell => new NFA(
    negPartLinkSpec, 'negator part link', cell, flag(cell), negPart(cell))),

  ...equalSumConstraints,
];
