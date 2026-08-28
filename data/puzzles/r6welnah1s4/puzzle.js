// Title: Skyscraper Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=r6welnah1s4
// Source: https://cracking-the-cryptic.web.app/sudoku/phfJMfM9T4

// Normal sudoku rules on a 9x9 grid (default rows/columns/3x3 boxes).
// The 7x7 interior (R2-R8, C2-C8) holds skyscraper heights equal to each
// cell's digit. Every green-shaded border cell (row 1, row 9, column 1,
// column 9) holds a digit that must equal the number of skyscrapers visible
// looking into the interior along that cell's row/column, from that cell's
// side -- "Green cells around the border indicate how many skyscrapers are
// visible from that cell along the corresponding row/column" applies to the
// whole shaded class, not only the two cells the source pre-fills (R1C2,
// R9C8). The other nine green cells (R1C4, R1C6, R3C1, R6C1, R7C1, R9C3,
// R3C9, R4C9, R6C9) get no `Given`, but still carry the same rule -- their
// digit is solved for, not free.
//
// The self-referential visibility count is modeled with one multi-segment
// NFA per green cell: segment 1 is the clue cell itself (sets `target` to
// its own digit), segment 2 scans the 7 interior cells nearest-first from
// that side, tracking the tallest height seen (`max`) and how many new
// tallest heights (visible skyscrapers, `count`) have appeared, clamped once
// `count` exceeds `target` so the state space stays bounded. Accept only
// when the final count equals the clue cell's own digit.
const skyscraperSpec = NFA.encodeSpec({
  startState: { target: null, max: 0, count: 0 },
  transition: ({ target, max, count }, value) => {
    // A SEGMENT_BREAK precedes the scan segment; reset the running scan
    // state but keep the target captured from the clue cell.
    if (value === SEGMENT_BREAK) return { target, max: 0, count: 0 };
    if (target === null) return { target: value, max: 0, count: 0 };
    if (value > max) {
      return { target, max: value, count: Math.min(count + 1, target + 1) };
    }
    return { target, max, count };
  },
  accept: ({ target, count }) => target !== null && count === target,
  maxDepth: 9,
}, 9, { multiSegment: true });

// [clue cell, ...cells scanned nearest-first] for each green border cell.
// Provenance: the source's own drawn shading marks the border clue
// positions (yellowgreen) and the 7x7 skyscraper interior (deepskyblue).
const skyscraperClues = [
  ['R1C2', ['R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C2']],
  ['R1C4', ['R2C4', 'R3C4', 'R4C4', 'R5C4', 'R6C4', 'R7C4', 'R8C4']],
  ['R1C6', ['R2C6', 'R3C6', 'R4C6', 'R5C6', 'R6C6', 'R7C6', 'R8C6']],
  ['R9C3', ['R8C3', 'R7C3', 'R6C3', 'R5C3', 'R4C3', 'R3C3', 'R2C3']],
  ['R9C8', ['R8C8', 'R7C8', 'R6C8', 'R5C8', 'R4C8', 'R3C8', 'R2C8']],
  ['R3C1', ['R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8']],
  ['R6C1', ['R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8']],
  ['R7C1', ['R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8']],
  ['R3C9', ['R3C8', 'R3C7', 'R3C6', 'R3C5', 'R3C4', 'R3C3', 'R3C2']],
  ['R4C9', ['R4C8', 'R4C7', 'R4C6', 'R4C5', 'R4C4', 'R4C3', 'R4C2']],
  ['R6C9', ['R6C8', 'R6C7', 'R6C6', 'R6C5', 'R6C4', 'R6C3', 'R6C2']],
];

return [
  new Shape('9x9'),

  new Given('R1C2', 4),
  new Given('R1C8', 7),
  new Given('R2C5', 3),
  new Given('R3C2', 1),
  new Given('R3C6', 4),
  new Given('R3C7', 9),
  new Given('R5C1', 8),
  new Given('R5C3', 4),
  new Given('R5C4', 5),
  new Given('R5C9', 6),
  new Given('R6C4', 8),
  new Given('R6C7', 1),
  new Given('R7C5', 2),
  new Given('R8C2', 7),
  new Given('R9C5', 9),
  new Given('R9C8', 4),

  ...skyscraperClues.map(([clueCell, scanCells]) =>
    new NFA(skyscraperSpec, 'Skyscraper', [clueCell], scanCells)),
];
