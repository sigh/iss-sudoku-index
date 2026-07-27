// Title: Look at those lines
// Author: Lithium-Ion
// Video: https://www.youtube.com/watch?v=nASawD3elfg
// Source: https://sudokupad.app/h3oqqmu2wp

// Normal sudoku, antiknight (no two cells a knight's move apart share a
// digit), and six drawn lines. Every line carries a "look-and-say" clue:
// reading the digits at its two endpoints as {a, b}, the line must contain
// exactly a copies of b AND exactly b copies of a, counting every cell on
// the line (endpoints included). The rules state the six colors exist only
// to disambiguate crossings, so each drawn stroke below is one independent
// clue even though several strokes cross each other's cells.
//
// Cell paths below are each line's full drawn path in order, so the first
// and last entries are its two endpoint cells.
const lines = [
  ['R4C4', 'R3C3', 'R3C2', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R7C2',
    'R7C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R9C8', 'R8C9', 'R7C9', 'R6C9',
    'R5C9', 'R4C8', 'R3C7', 'R2C7', 'R1C6'],
  ['R1C5', 'R2C6', 'R1C7'],
  ['R1C4', 'R2C3', 'R2C2', 'R2C1', 'R3C2', 'R4C3', 'R5C2', 'R6C2', 'R7C1',
    'R8C1', 'R8C2', 'R8C3', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8',
    'R9C9', 'R8C8', 'R8C7', 'R7C6', 'R6C6', 'R6C7', 'R5C8', 'R4C8', 'R3C8',
    'R2C9', 'R1C8'],
  ['R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C8', 'R6C8', 'R7C7', 'R7C6', 'R7C5',
    'R6C4', 'R5C4', 'R4C3', 'R3C3', 'R2C3'],
  ['R1C3', 'R2C4', 'R3C4', 'R3C5', 'R4C5', 'R5C5', 'R5C4', 'R6C3', 'R6C2',
    'R5C3', 'R4C2', 'R3C2', 'R2C2', 'R1C1'],
  ['R1C2', 'R2C3', 'R2C4', 'R2C5', 'R3C6', 'R4C7', 'R5C7', 'R5C6', 'R6C5',
    'R7C4', 'R8C3', 'R9C2', 'R9C1'],
];

// Look-and-say state: d1/d2 are the digits read at the line's two endpoints
// (fed first, in path order, ahead of the remaining cells -- only total
// occurrence counts matter, not scan order). count1/count2 tally, over the
// whole line, cells matching d1 and d2 respectively; each is clamped at the
// other endpoint's value + 1 (a sink meaning "already too many"), since a
// valid tally can never need to exceed the other endpoint digit. `accept`
// requires both look-and-say readings to hold (not just one), matching the
// rules' "AND" wording.
const lookAndSay = NFA.encodeSpec({
  startState: { d1: null, d2: null, count1: 0, count2: 0 },
  transition: ({ d1, d2, count1, count2 }, value) => {
    if (d1 === null) {
      // First endpoint: it trivially matches itself once.
      return { d1: value, d2: null, count1: 1, count2: 0 };
    }
    if (d2 === null) {
      // Second endpoint: cross-check against d1, and seed count2. Clamp
      // count1 at d2+1 and count2 at d1+1 now that both targets are known.
      const same = value === d1;
      return {
        d1, d2: value,
        count1: Math.min(count1 + (same ? 1 : 0), value + 1),
        count2: Math.min(1 + (same ? 1 : 0), d1 + 1),
      };
    }
    // Remaining line cells: tally matches against both endpoint digits.
    return {
      d1, d2,
      count1: Math.min(count1 + (value === d1 ? 1 : 0), d2 + 1),
      count2: Math.min(count2 + (value === d2 ? 1 : 0), d1 + 1),
    };
  },
  accept: ({ d1, d2, count1, count2 }) =>
    d2 !== null && count1 === d2 && count2 === d1,
  maxDepth: 29,
}, 9);

// The NFA reads its two endpoint digits first (d1, d2), so each line's cell
// list is reordered to [first, last, ...middle] -- physical scan order does
// not matter, only total occurrence counts do.
const lookAndSays = lines.map((cells, i) => {
  const [first, ...rest] = cells;
  const last = rest.pop();
  return new NFA(lookAndSay, `look-and-say ${i}`, first, last, ...rest);
});

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...lookAndSays,
];
