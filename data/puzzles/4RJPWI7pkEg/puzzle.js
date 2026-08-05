// Title: Ripple
// Author: Mormagli
// Video: https://www.youtube.com/watch?v=4RJPWI7pkEg
// Source: https://app.crackingthecryptic.com/sudoku/4gn88G8Ftt

// Normal Sudoku rules apply. Each blue path is a region-sum line: every
// contiguous pass through a 3x3 box has the same sum, including separate
// passes where a path re-enters a box. White dots join consecutive digits.
const regionSumLines = [
  ['R5C4', 'R4C4', 'R3C4', 'R3C5', 'R4C5', 'R4C6', 'R4C7', 'R5C7', 'R5C6', 'R6C6', 'R7C6', 'R7C5', 'R6C5', 'R6C4', 'R6C3', 'R5C3', 'R5C4'],
  ['R3C3', 'R2C4', 'R2C5', 'R2C6', 'R3C7', 'R3C8', 'R4C8', 'R5C8', 'R6C7', 'R7C7', 'R8C6', 'R8C5', 'R7C4', 'R8C3', 'R7C3', 'R6C2', 'R5C2', 'R4C3', 'R3C3'],
  ['R1C2', 'R2C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C7', 'R2C8', 'R3C9', 'R4C9', 'R5C9', 'R6C8', 'R7C8', 'R8C8', 'R8C7', 'R9C6', 'R9C5', 'R8C4', 'R9C3', 'R9C2', 'R8C2', 'R7C2', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1', 'R1C1', 'R1C2'],
];

const boxOf = (cell) => {
  const { row, col } = parseCellId(cell);
  return `${Math.floor((row - 1) / 3)}:${Math.floor((col - 1) / 3)}`;
};

// Split each drawn path at box borders. On a closed path whose endpoint is its
// first cell, the two end fragments are one continuous pass through that box.
const regionSegments = (cells) => {
  const segments = [];
  for (const cell of cells) {
    if (!segments.length || boxOf(segments.at(-1)[0]) !== boxOf(cell)) {
      segments.push([cell]);
    } else {
      segments.at(-1).push(cell);
    }
  }
  if (boxOf(cells[0]) === boxOf(cells.at(-1))) {
    const first = segments.shift();
    const last = segments.pop();
    segments.unshift([...last, ...first.slice(1)]);
  }
  return segments;
};

// White-dot pairs from the two drawn white dots.
const whiteDots = [['R4C6', 'R5C6'], ['R5C4', 'R6C4']];

return [
  new Shape('9x9'),
  ...regionSumLines.map(cells => new EqualSum(...regionSegments(cells))),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
];
