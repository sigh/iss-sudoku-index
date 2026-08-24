// Title: Colored Dot Sums
// Author: PetLov
// Video: https://www.youtube.com/watch?v=lGe9xXvcvL0
// Source: https://app.crackingthecryptic.com/sudoku/gdr8L98QBn

// Normal sudoku rules apply. Each of the four dot colours (yellow-green, gold,
// red, purple) represents a different number. Cells connected by a dot of
// that colour sum to the colour's number: 2 cells for a dot drawn on a shared
// edge, 4 cells for a dot drawn on a shared corner ("Each of the four colours
// represents a different number, and cells connected by such a dot sum to
// that number").
//
// No dot carries a printed value, so each colour's number is unknown. Same-
// colour equality ("every dot of this colour sums to this colour's number")
// is `EqualSum` over that colour's dots -- it ties them to one common,
// unmaterialized total without needing an aux Var (a dot's own sum can run to
// 34, above the grid's 9-value range). Cross-colour distinctness ("a
// different number") is checked pairwise on one representative dot per
// colour, via a small NFA that reads that dot's cells then the other
// colour's dot's cells (SEGMENT_BREAK between them) and accepts only when the
// two running totals differ -- carrying the signed running difference, not
// both totals, keeps the state space tiny (a handful of values in [-34,34]).
// Fixture-tested against a same/differ accept-reject table before use.
//
// Dot cell membership is transcribed from the source payload's overlay
// entries (fill colour + edge/corner position).

const yellowgreen = {
  edges: [
    ['R1C1', 'R1C2'], ['R2C1', 'R3C1'], ['R2C2', 'R3C2'], ['R2C3', 'R3C3'],
    ['R1C5', 'R2C5'], ['R2C6', 'R2C7'], ['R1C8', 'R2C8'],
  ],
  corners: [
    ['R4C8', 'R4C9', 'R5C8', 'R5C9'],
    ['R7C2', 'R7C3', 'R8C2', 'R8C3'],
  ],
};
const gold = {
  edges: [
    ['R1C2', 'R1C3'], ['R1C5', 'R1C6'], ['R2C5', 'R2C6'], ['R3C5', 'R3C6'],
    ['R2C4', 'R3C4'], ['R3C8', 'R4C8'], ['R5C3', 'R5C4'], ['R7C4', 'R7C5'],
    ['R9C4', 'R9C5'], ['R8C3', 'R9C3'],
  ],
  corners: [],
};
const red = {
  edges: [
    ['R1C2', 'R2C2'], ['R2C7', 'R3C7'], ['R1C8', 'R1C9'], ['R2C8', 'R2C9'],
    ['R3C8', 'R3C9'], ['R7C5', 'R7C6'], ['R9C5', 'R9C6'],
  ],
  corners: [
    ['R3C2', 'R3C3', 'R4C2', 'R4C3'],
  ],
};
const purple = {
  edges: [],
  corners: [
    ['R5C6', 'R5C7', 'R6C6', 'R6C7'],
    ['R7C5', 'R7C6', 'R8C5', 'R8C6'],
    ['R7C4', 'R7C5', 'R8C4', 'R8C5'],
    ['R8C4', 'R8C5', 'R9C4', 'R9C5'],
    ['R8C5', 'R8C6', 'R9C5', 'R9C6'],
  ],
};

const colours = { G: yellowgreen, Y: gold, R: red, P: purple };
const dotsOf = group => [...group.edges, ...group.corners];

// Same colour, same (unmaterialized) total.
const sameColourTotals = Object.values(colours).map(
  group => new EqualSum(...dotsOf(group))
);

// Different colours, different totals: a signed running-difference NFA
// (segment 1 adds, segment 2 subtracts), reading one representative dot's
// cells per colour. Grid digits only (1-9), so no widened Shape is needed.
const differSpec = NFA.encodeSpec({
  startState: { diff: 0, segment: 0 },
  transition: ({ diff, segment }, value) => {
    // Saturate segment at 1: only two segments ever appear (one break).
    if (value === SEGMENT_BREAK) return { diff, segment: Math.min(segment + 1, 1) };
    return { diff: diff + (segment === 0 ? value : -value), segment };
  },
  accept: ({ diff }) => diff !== 0,
  // Longest instance: a 4-cell corner dot vs a 4-cell corner dot, plus 1 break.
  maxDepth: 9,
}, 9, { multiSegment: true });

const representative = Object.fromEntries(
  Object.entries(colours).map(([code, group]) => [code, dotsOf(group)[0]])
);
const codes = Object.keys(colours);
const crossColourDiffers = [];
for (let i = 0; i < codes.length; i++) {
  for (let j = i + 1; j < codes.length; j++) {
    crossColourDiffers.push(new NFA(
      differSpec, `${codes[i]}${codes[j]}-differ`,
      representative[codes[i]], representative[codes[j]],
    ));
  }
}

return [
  new Shape('9x9'),
  ...sameColourTotals,
  ...crossColourDiffers,
];
