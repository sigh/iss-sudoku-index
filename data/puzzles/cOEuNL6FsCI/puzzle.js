// Title: Wedged Sum II
// Author: AndreasV
// Video: https://www.youtube.com/watch?v=cOEuNL6FsCI
// Source: https://app.crackingthecryptic.com/sudoku/FDtFbt7HM4

// Normal sudoku rules apply (default row/col/box AllDifferent).
// Rule: "Digits in a green cell and the next green cell in the same column
// or row must sum to a digit in one of the cells between them." For each
// green cell and its nearest green neighbour sharing a row or column, the
// two digits' sum must equal at least one of the (possibly non-green) cells
// strictly between them -- encoded as an Or over one EqualSum([a,b],[mid])
// per between-cell (a + b == mid).

// Green cells (drawn 1x1 yellowgreen fills).
const GREEN_CELLS = [
  'R1C3', 'R1C6', 'R2C4', 'R3C3', 'R3C5', 'R3C7', 'R4C1', 'R4C4', 'R4C8',
  'R5C3', 'R5C5', 'R5C7', 'R6C6', 'R7C3', 'R7C5', 'R7C7', 'R7C9', 'R8C2',
  'R8C4', 'R9C7',
].map(parseCellId);

// A wedge-sum constraint for one ordered pair of same-row or same-col green
// cells: Or over the cells strictly between them of (a + b == that cell).
function wedgeSumConstraint(a, b, between) {
  return new Or(between.map(
    mid => new EqualSum([makeCellId(a), makeCellId(b)], [makeCellId(mid)])));
}

// Group green cells by row and by column, sort along the line, and pair up
// consecutive members -- that is "the next green cell in the same row/column".
function wedgeSumConstraintsAlongLines(cells, laneKey, posKey) {
  const lanes = new Map();
  for (const cell of cells) {
    const lane = lanes.get(cell[laneKey]) || [];
    lane.push(cell[posKey]);
    lanes.set(cell[laneKey], lane);
  }
  return [...lanes.entries()].flatMap(([lane, positions]) => {
    const sorted = [...positions].sort((x, y) => x - y);
    return sorted.slice(0, -1).map((pos, i) => {
      const next = sorted[i + 1];
      const a = posKey === 'col' ? { row: lane, col: pos } : { row: pos, col: lane };
      const b = posKey === 'col' ? { row: lane, col: next } : { row: next, col: lane };
      const between = [];
      for (let p = pos + 1; p < next; p++) {
        between.push(posKey === 'col' ? { row: lane, col: p } : { row: p, col: lane });
      }
      return wedgeSumConstraint(a, b, between);
    });
  });
}

const wedgeSumConstraints = [
  ...wedgeSumConstraintsAlongLines(GREEN_CELLS, 'row', 'col'),
  ...wedgeSumConstraintsAlongLines(GREEN_CELLS, 'col', 'row'),
];

return [
  new Shape('9x9'),

  // Givens.
  new Given('R1C5', 7),
  new Given('R2C5', 9),
  new Given('R3C4', 8),
  new Given('R8C5', 6),
  new Given('R9C5', 8),

  ...wedgeSumConstraints,
];
