// Title: Diagonal Skyscrapers
// Author: Blashyrkh
// Video: https://www.youtube.com/watch?v=z4yncDzOAP0
// Source: https://app.crackingthecryptic.com/sudoku/gp6TDtR6RN

// Normal sudoku: rows, columns, and boxes all-different (the default Shape
// groups). The diagonals below carry no all-different restriction of their
// own, so digits may repeat along them.
//
// Skyscraper diagonals: "Clues outside the grid indicate how many digits are
// 'seen' along that diagonal, with higher digits blocking lower or identical
// digits from view." Seven diagonals carry a clue; every other of the 17+17
// possible grid diagonals is unclued. Each clue counts strict running-maxima
// scanning from the badge's end of its diagonal inward: a cell counts only
// when its digit exceeds every digit already scanned on that diagonal, so an
// equal-or-shorter digit stays hidden, per the rule text. Cell lists below
// are each diagonal's full run, ordered from the clued end.

// Builds one NFA spec for "exactly `target` strict running-maxima" over a
// single diagonal. State = the tallest digit scanned so far (0 = none) and
// the count of new-maximum cells so far, clamped at target+1 once the clue
// can only fail.
const skyscraperSpec = (target) => NFA.encodeSpec({
  startState: { max: 0, count: 0 },
  transition: ({ max, count }, value) => {
    const hit = value > max ? 1 : 0;
    return { max: Math.max(max, value), count: Math.min(count + hit, target + 1) };
  },
  accept: ({ count }) => count === target,
}, /* numValues= */ 9);

// One compiled spec per distinct clue value (1, 5, 6, 9), reused across
// diagonals that share a target.
const specByTarget = {};
const skyscraperNFA = (target, ...cells) => {
  specByTarget[target] ??= skyscraperSpec(target);
  return new NFA(specByTarget[target], `Skyscraper${target}`, ...cells);
};

return [
  new Shape('9x9'),

  // Diagonal skyscraper clues, cells ordered from the badge inward.
  skyscraperNFA(1, 'R4C1', 'R5C2', 'R6C3', 'R7C4', 'R8C5', 'R9C6'),
  skyscraperNFA(6, 'R9C3', 'R8C4', 'R7C5', 'R6C6', 'R5C7', 'R4C8', 'R3C9'),
  skyscraperNFA(1, 'R9C6', 'R8C7', 'R7C8', 'R6C9'),
  skyscraperNFA(1, 'R6C9', 'R5C8', 'R4C7', 'R3C6', 'R2C5', 'R1C4'),
  skyscraperNFA(1, 'R1C4', 'R2C3', 'R3C2', 'R4C1'),
  skyscraperNFA(9, 'R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'),
  skyscraperNFA(5, 'R1C8', 'R2C7', 'R3C6', 'R4C5', 'R5C4', 'R6C3', 'R7C2', 'R8C1'),
];
