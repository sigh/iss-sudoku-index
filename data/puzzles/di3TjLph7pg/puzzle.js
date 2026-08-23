// Title: Sweepdoku
// Author: Zelbulon
// Video: https://www.youtube.com/watch?v=di3TjLph7pg
// Source: https://app.crackingthecryptic.com/sudoku/8RprrG92pb

// Rules: normal sudoku. 24 cells carry a single-cell cage whose small corner
// total is a fixed target digit T (not the digit ultimately entered there).
// The digit d entered in a caged cell must equal the number of cells among
// {the cell itself, the rest of its row, the rest of its column, its
// diagonal neighbours} that hold digit T.
//
// Each cage is one NFA over two segments: the cage cell alone, then every
// other cell in its region (row union column union diagonal neighbours, deduplicated
// -- row and column only overlap at the cage cell, which the first segment
// already covers, and diagonal neighbours never share a row or column with
// the cage cell). `originDigit` captures the cage cell's own value on the
// first token (also counted toward T if it equals T, since the rule counts
// the cell itself); every later token adds to `count` when it equals T. The
// NFA accepts iff the final count equals the cage cell's own digit.

// R#C#=T for each single-cell cage's cell and corner total.
const cages = {
  'R1C1': 8, 'R3C2': 6, 'R3C3': 8, 'R4C1': 1, 'R4C2': 4, 'R4C3': 3,
  'R7C1': 1, 'R9C3': 5, 'R1C4': 5, 'R5C4': 5, 'R5C5': 1, 'R6C5': 5,
  'R7C4': 2, 'R2C6': 6, 'R3C6': 1, 'R9C6': 7, 'R8C7': 5, 'R7C7': 9,
  'R5C7': 7, 'R2C8': 9, 'R3C8': 7, 'R4C8': 5, 'R6C9': 5, 'R8C9': 3,
};

function regionOf(cageCellId) {
  const { row, col } = parseCellId(cageCellId);
  const rest = [];
  for (let c = 1; c <= 9; c++) {
    if (c !== col) rest.push(makeCellId(row, c));
  }
  for (let r = 1; r <= 9; r++) {
    if (r !== row) rest.push(makeCellId(r, col));
  }
  for (const dr of [-1, 1]) {
    for (const dc of [-1, 1]) {
      const r = row + dr, c = col + dc;
      if (r >= 1 && r <= 9 && c >= 1 && c <= 9) rest.push(makeCellId(r, c));
    }
  }
  return rest;
}

function sweepSpec(target) {
  return NFA.encodeSpec({
    startState: { originDigit: null, count: 0 },
    transition: ({ originDigit, count }, value) => {
      // Break first: it precedes the second segment, and must not be read as
      // a region cell.
      if (value === SEGMENT_BREAK) return { originDigit, count };
      if (originDigit === null) {
        // First token: the cage cell itself. It is part of its own counted
        // region, so it can contribute to `count` too.
        return { originDigit: value, count: value === target ? 1 : 0 };
      }
      const hit = value === target ? 1 : 0;
      // Clamp: the domain is 1-9, so count can never need to exceed 9.
      return { originDigit, count: Math.min(count + hit, 9) };
    },
    accept: ({ originDigit, count }) => originDigit !== null && count === originDigit,
  }, 9, { multiSegment: true });
}

function sweepNFAs() {
  return Object.entries(cages).map(([cell, target]) =>
    new NFA(sweepSpec(target), `Sweep${cell}=${target}`, [cell], regionOf(cell)));
}

return [
  new Shape('9x9'),
  new Given('R1C2', 1),
  new Given('R3C4', 7),
  new Given('R9C5', 6),
  new Given('R9C9', 7),
  ...sweepNFAs(),
];
