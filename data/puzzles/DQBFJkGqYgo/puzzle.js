// Title: X's and Y's
// Author: The Barg
// Video: https://www.youtube.com/watch?v=DQBFJkGqYgo
// Source: https://sudokupad.app/n92swt0tdm

// Normal sudoku rules apply.
//
// Yin Yang: color the grid using two colors, such that all cells of the same
// color are orthogonally connected, and no 2x2 area is fully one color.
//
// X-Sums: 19 outside clues. Each gives the sum of the first X digits of that
// row/column, of a certain color, from the direction of the clue, where X is
// the first digit of that color seen from that direction. Each clue sees
// only one color; which color is not given and must be worked out. Each clue
// sees at least X digits of its color.

const graph = cellGraph('9x9');

// Yin-Yang shade overlay: 1 or 2 per cell, one value per color.
const shade = graph.makeOverlay('VS');
const shadeAt = cell => shade.at(cell);

// No 2x2 block of cells is a single color: scan the 4 shade cells of each
// window (order doesn't matter, only "are they all equal") and reject if
// they are.
function no2x2Spec() {
  return NFA.encodeSpec({
    startState: { first: null, allSame: true },
    transition: (state, value) =>
      state.first === null ? { first: value, allSame: true }
        : { first: state.first, allSame: state.allSame && value === state.first },
    accept: (state) => !state.allSame,
  }, 9);
}

// The 64 windows are one template (the no-monochrome-2x2 NFA over a 2x2 block)
// stamped at every top-left corner R1C1..R8C8 with a uniform grid offset, so a
// single Replicate over the shade overlay expresses all of them. The template
// reads the 2x2 shade window at R1C1; each target origin shifts that window by
// the same relative offsets within the shade subgraph.
function no2x2Constraints() {
  const window = shade.at(graph.block(makeCellId(1, 1), 2, 2));
  const targets = [];
  for (let r = 1; r <= 8; r++) {
    for (let c = 1; c <= 8; c++) {
      targets.push(shadeAt(makeCellId(r, c)));
    }
  }
  return [shade.makeReplicate(
    [new NFA(no2x2Spec(), 'no2x2', ...window)],
    targets)];
}

// X-Sum-of-one-color state machine: reads an interleaved [digit, shade,
// digit, shade, ...] sequence (one row/column, in the clue's reading
// direction). Skips cells of the other color. On the first cell of `color`,
// remembers its digit as X and starts summing; freezes the sum once X cells
// of `color` have been counted. Accepts iff that frozen sum equals `total`.
function xsumSpec(color, total) {
  // In 'count' mode the state only needs stepsLeft = (x - cellsSeenSoFar) and
  // remaining = (total - sumSoFar): the accept condition only cares that both
  // hit 0 together, so x and the running sum are never stored directly. That
  // keeps the reachable state count small enough for the compiler's state
  // limit even though 9x9 rows allow a lot of digit combinations.
  const inRange = (stepsLeft, remaining) =>
    remaining >= stepsLeft && remaining <= stepsLeft * 9;
  return NFA.encodeSpec({
    // phase: waiting for a digit ('digit') or its paired shade ('shade').
    // mode: 'seek' (haven't found the first `color` cell yet), 'count'
    // (found it, still counting down stepsLeft), or 'accepted' (target
    // total reached; nothing more is tracked past this point).
    startState: { phase: 'digit', mode: 'seek' },
    transition: (state, value) => {
      if (state.mode === 'accepted') {
        return { phase: state.phase === 'digit' ? 'shade' : 'digit', mode: 'accepted' };
      }
      if (state.phase === 'digit') {
        return { ...state, phase: 'shade', digit: value };
      }
      // state.phase === 'shade': value is the shade paired with state.digit.
      const { digit, mode, stepsLeft, remaining } = state;
      if (value !== color) return { phase: 'digit', mode, stepsLeft, remaining };
      if (mode === 'seek') {
        if (digit > total) return undefined;
        const nextStepsLeft = digit - 1;
        const nextRemaining = total - digit;
        if (nextStepsLeft === 0) return nextRemaining === 0 ? { phase: 'digit', mode: 'accepted' } : undefined;
        if (!inRange(nextStepsLeft, nextRemaining)) return undefined;
        return { phase: 'digit', mode: 'count', stepsLeft: nextStepsLeft, remaining: nextRemaining };
      }
      // mode === 'count'
      const nextRemaining = remaining - digit;
      if (nextRemaining < 0) return undefined;
      const nextStepsLeft = stepsLeft - 1;
      if (nextStepsLeft === 0) return nextRemaining === 0 ? { phase: 'digit', mode: 'accepted' } : undefined;
      if (!inRange(nextStepsLeft, nextRemaining)) return undefined;
      return { phase: 'digit', mode: 'count', stepsLeft: nextStepsLeft, remaining: nextRemaining };
    },
    accept: (state) => state.mode === 'accepted',
  }, 9);
}

// Outside clues: edge is the border the clue sits on, idx is the 1-indexed
// row (left/right clues) or column (top/bottom clues) it reads.
const CLUES = [
  { edge: 'top', idx: 1, value: 31 },
  { edge: 'top', idx: 3, value: 18 },
  { edge: 'top', idx: 4, value: 32 },
  { edge: 'top', idx: 8, value: 32 },
  { edge: 'top', idx: 9, value: 40 },
  { edge: 'right', idx: 1, value: 30 },
  { edge: 'right', idx: 2, value: 5 },
  { edge: 'right', idx: 3, value: 21 },
  { edge: 'right', idx: 6, value: 27 },
  { edge: 'right', idx: 7, value: 28 },
  { edge: 'right', idx: 9, value: 8 },
  { edge: 'bottom', idx: 9, value: 32 },
  { edge: 'bottom', idx: 8, value: 13 },
  { edge: 'bottom', idx: 7, value: 11 },
  { edge: 'bottom', idx: 5, value: 24 },
  { edge: 'bottom', idx: 1, value: 7 },
  { edge: 'left', idx: 8, value: 30 },
  { edge: 'left', idx: 4, value: 36 },
  { edge: 'left', idx: 1, value: 45 },
];

function clueCells({ edge, idx }) {
  switch (edge) {
    case 'top': return graph.ray(makeCellId(1, idx), 1, 0);
    case 'bottom': return graph.ray(makeCellId(9, idx), -1, 0);
    case 'left': return graph.ray(makeCellId(idx, 1), 0, 1);
    case 'right': return graph.ray(makeCellId(idx, 9), 0, -1);
  }
}

function xsumConstraints() {
  return CLUES.map(clue => {
    const cells = clueCells(clue);
    const interleaved = cells.flatMap(cell => [cell, shadeAt(cell)]);
    const label = `${clue.edge}${clue.idx}`;
    return new Or([
      new NFA(xsumSpec(1, clue.value), `${label}_color1`, ...interleaved),
      new NFA(xsumSpec(2, clue.value), `${label}_color2`, ...interleaved),
    ]);
  });
}

// Every cell is shade 1 or 2: one Given template stamped over every grid
// cell via the shade overlay.
function shadeDomainConstraints() {
  const targets = shade.at(graph.cells());
  return [shade.makeReplicate([new Given(targets[0], 1, 2)], targets)];
}

return [
  new Shape('9x9'),
  shade.toVar('Shade'),
  ...shadeDomainConstraints(),
  ...no2x2Constraints(),
  // Global Yin-Yang connectivity: each shade forms one orthogonally
  // connected region (closes the previously-omitted half of the rule).
  new ConnectedValues('VS', 1),
  new ConnectedValues('VS', 2),
  ...xsumConstraints(),
];
