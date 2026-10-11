// Title: This Hits Different
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=1BNVloYKrEc
// Source: https://sudokupad.app/xvrdqbvla1

// Normal Sudoku; hitlines have no repeated digits and pairwise different
// totals of digits matching their positions counted from the square.
const shape = new Shape('9x9');
// Beige paths, ordered from their drawn square endpoints.
const lines = [
  [
    "R3C6",
    "R2C6",
    "R2C5",
    "R2C4",
    "R2C3",
    "R2C2",
    "R1C1"
  ],
  [
    "R1C4",
    "R1C5",
    "R1C6"
  ],
  [
    "R2C7",
    "R2C8",
    "R1C9",
    "R1C8",
    "R1C7"
  ],
  [
    "R3C7",
    "R3C8",
    "R4C9",
    "R5C9",
    "R6C9",
    "R6C8"
  ],
  [
    "R4C7",
    "R5C7",
    "R6C7"
  ],
  [
    "R6C6",
    "R5C6",
    "R4C6"
  ],
  [
    "R6C5",
    "R5C5",
    "R4C5"
  ],
  [
    "R6C4",
    "R5C4",
    "R4C4"
  ],
  [
    "R6C3",
    "R5C3",
    "R4C3"
  ],
  [
    "R6C2",
    "R6C1",
    "R5C1"
  ],
  [
    "R7C7",
    "R8C6",
    "R9C7",
    "R8C8",
    "R7C9"
  ],
  [
    "R8C5",
    "R9C5",
    "R9C4",
    "R8C4"
  ],
  [
    "R3C5",
    "R3C4",
    "R3C3",
    "R3C2",
    "R3C1",
    "R4C1",
    "R4C2"
  ],
  [
    "R9C1",
    "R8C2",
    "R8C3",
    "R7C2",
    "R7C3",
    "R7C4",
    "R7C5",
    "R7C6"
  ]
];

function differentHitTotals(a, b) {
  // State stores the consumed position and the first hit total minus the
  // second. Positions restart at 1 when the second line begins.
  const length = a.length + b.length;
  const spec = NFA.encodeSpec({
    startState: { position: 0, difference: 0 },
    transition: ({ position, difference }, value) => {
      if (position >= length) return undefined;
      const first = position < a.length;
      const index = first ? position + 1 : position - a.length + 1;
      return { position: position + 1,
        difference: difference + (value === index ? (first ? value : -value) : 0) };
    },
    accept: ({ position, difference }) => position === length && difference !== 0,
    maxDepth: length,
  }, shape);
  return new NFA(spec, 'Distinct hit totals', ...a, ...b);
}
const totalComparisons = lines.flatMap((a, i) =>
  lines.slice(i + 1).map(b => differentHitTotals(a, b)));
return [shape, ...lines.map(line => new AllDifferent(...line)), ...totalComparisons];
