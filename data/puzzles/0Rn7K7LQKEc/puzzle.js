// Title: Wirral
// Author: Hraf
// Video: https://www.youtube.com/watch?v=0Rn7K7LQKEc
// Source: https://app.crackingthecryptic.com/sudoku/GMmTTqFhp2

// Normal sudoku rules (default row/column/box all-different on Shape('9x9')).
// Land cells hold skyscraper heights; water cells hold digits with no
// skyscraper meaning (any digit is legal there and it never blocks or counts
// on a sightline). Each photograph cage sits on a water cell and clues, for
// one arrow direction, how many land-cell skyscrapers are visible looking
// from that cell to the edge of the grid, skipping over any water cells in
// the line entirely (they are transparent, per the rules' closing note). A
// cage with two direction+count pairs is two photographs taken from the same
// boat position. R4C6's digit is additionally even (grey square), which is
// unrelated to its own skyscraper clues since R4C6 is itself water.

// visSpec(n): visible-skyscraper-count NFA, run over two segments so the
// generated constraint still names the boat/cage cell itself (clue coverage)
// even though its water digit takes no part in the count. Segment 0 is the
// single cage cell, read and discarded; SEGMENT_BREAK then resets the scan;
// segment 1 is the land-only sightline, nearest cell first, under standard
// skyscraper visibility (a cell is visible if taller than every earlier cell
// in the sequence). Water cells beyond the cage cell are simply absent from
// segment 1, so they cannot appear here at all. Rejects (returns undefined)
// as soon as the visible count would exceed n, per the NFA state-blowup
// guidance.
const visSpecCache = new Map();
function visSpec(n) {
  if (!visSpecCache.has(n)) {
    visSpecCache.set(n, NFA.encodeSpec({
      startState: { phase: 0, tallest: 0, count: 0 },
      transition: ({ phase, tallest, count }, value) => {
        if (value === SEGMENT_BREAK) return { phase: 1, tallest: 0, count: 0 };
        if (phase === 0) return { phase, tallest, count };  // cage cell: ignored
        const visible = value > tallest ? 1 : 0;
        const newCount = count + visible;
        if (newCount > n) return undefined;
        return { phase, tallest: Math.max(tallest, value), count: newCount };
      },
      accept: ({ phase, count }) => phase === 1 && count === n,
      maxDepth: 10,  // cage cell + break + up to 8 land cells
    }, 9, { multiSegment: true }));
  }
  return visSpecCache.get(n);
}

// One entry per photograph: [cageCell, n, ...landCellsNearestFirst]. Cell
// lists are the land-only sightlines, derived from the drawn land/water
// underlays, one per cage direction.
const sightlines = [
  ['R2C3', 5, 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R8C3'],       // down
  ['R2C4', 2, 'R2C5', 'R2C8', 'R2C9'],                                // right
  ['R1C5', 4, 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5'], // down
  ['R2C7', 2, 'R2C8', 'R2C9'],                                        // right
  ['R3C6', 1, 'R3C5', 'R3C4', 'R3C3', 'R3C2'],                        // left
  ['R3C7', 1, 'R3C8', 'R3C9'],                                        // right
  ['R4C6', 5, 'R5C6', 'R6C6', 'R7C6', 'R8C6', 'R9C6'],                // down
  ['R4C6', 1, 'R4C5', 'R4C4', 'R4C3', 'R4C2', 'R4C1'],                // left
  ['R5C7', 2, 'R5C6', 'R5C5', 'R5C4', 'R5C3', 'R5C2', 'R5C1'],        // left
  ['R6C7', 2, 'R6C6', 'R6C5', 'R6C4', 'R6C3', 'R6C2'],                // left
  ['R7C7', 3, 'R7C6', 'R7C5', 'R7C4', 'R7C3'],                        // left
  ['R8C8', 3, 'R8C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3'],                // left
  ['R9C9', 2, 'R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C1'],        // left
  ['R5C8', 4, 'R4C8', 'R3C8', 'R2C8', 'R1C8'],                        // up
  ['R3C1', 4, 'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C8', 'R3C9'],        // right
  ['R6C1', 4, 'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6'],                // right
  ['R7C2', 4, 'R6C2', 'R5C2', 'R4C2', 'R3C2'],                        // up
  ['R7C2', 2, 'R7C3', 'R7C4', 'R7C5', 'R7C6'],                        // right
  ['R9C3', 4, 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8'],                // right
];

const sightlineConstraints = sightlines.map(
  ([cageCell, n, ...cells]) => new NFA(visSpec(n), 'sky', [cageCell], cells));

return [
  new Shape('9x9'),
  new Given('R4C6', 2, 4, 6, 8),
  ...sightlineConstraints,
];
