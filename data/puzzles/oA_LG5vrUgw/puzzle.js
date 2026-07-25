// Title: Foggy Unique Constraints
// Author: Pychael
// Video: https://www.youtube.com/watch?v=oA_LG5vrUgw
// Source: https://sudokupad.app/1cwhkyc8be

// Normal sudoku rules (standard 3x3 boxes). Eight variant clue types are
// drawn (German Whisper lines, Renban lines, Region Sum lines, black/white
// Kropki dots, V, X, Squares); each type's own semantics is standard and
// needs no gloss below. On top of that, the rules add one meta-rule shared
// by every type in that same list, Squares included (the meta-rule sentence
// immediately follows Squares in the rules text, both under "above"): no
// digit may repeat anywhere among all of a type's cells, not just within
// one instance of it (e.g. a digit used on one Renban line may not also
// appear on the other Renban line; the puzzle's own example). That is
// encoded as one AllDifferent per type, over the deduplicated union of
// every cell belonging to that type, alongside the type's own
// constraint(s).
//
// The grid is covered by dynamically-cleared fog: a UI solving-aid with no
// bearing on the final grid, so it is not encoded.
//
// Every green Whisper line is also outlined in white along the same edges:
// a cosmetic duplicate, so only the green lines are encoded.

// German Whisper lines: adjacent cells differ by >= 5. Provenance: the
// green striped lines.
const whisperLines = [
  ['R4C4', 'R5C5', 'R5C4'],
  ['R6C9', 'R7C8'],
  ['R3C6', 'R4C5'],
];

// Renban lines: cells form a consecutive, non-repeating set. Provenance:
// the thick purple lines.
const renbanLines = [
  ['R2C4', 'R3C5', 'R3C6', 'R4C6', 'R5C7'],
  ['R9C2', 'R9C1', 'R8C1', 'R8C2'],
];

// Region Sum lines: equal sum per box segment. Provenance: the thin blue
// lines; both cross a box border, matching the rules text.
const regionSumLines = [
  ['R6C6', 'R5C6', 'R4C7', 'R4C8'],
  ['R2C5', 'R2C6', 'R1C7'],
];

// White Kropki dots: consecutive. Provenance: the white-filled,
// black-bordered edge dots.
const whiteDotPairs = [
  ['R4C4', 'R4C5'],
  ['R5C9', 'R6C9'],
  ['R1C4', 'R2C4'],
  ['R2C4', 'R2C5'],
];

// Black Kropki dots: 1:2 ratio. Provenance: the black-filled,
// white-bordered edge dots.
const blackDotPairs = [
  ['R5C4', 'R6C4'],
  ['R6C7', 'R6C8'],
  ['R3C2', 'R4C2'],
];

// V markers: sum to 5. Provenance: the "V" edge labels.
const vPairs = [
  ['R4C4', 'R5C4'],
  ['R6C8', 'R6C9'],
];

// X markers: sum to 10. Provenance: the "X" edge labels.
const xPairs = [
  ['R1C2', 'R2C2'],
  ['R8C6', 'R8C7'],
];

// Squares: even digit. Provenance: the square background shading.
const squareCells = ['R1C3', 'R8C5', 'R9C8'];

// One AllDifferent per clue type over the deduplicated union of its cells:
// encodes "Each unique constraint type above must not contain any repeated
// digits anywhere within its specific constraint type" (metadata.rules),
// including the intra-line/pair case that the type's own constraint does
// not already force (e.g. Region Sum and Whisper do not by themselves
// forbid a repeat within one line). Squares gets the same treatment below,
// via a direct AllDifferent since it has no per-instance constraint of its
// own to spread from.
const typeUnion = groups => [...new Set(groups.flat())];

return [
  new Shape('9x9'),

  ...whisperLines.map(cells => new Whisper(5, ...cells)),
  new AllDifferent(...typeUnion(whisperLines)),

  ...renbanLines.map(cells => new Renban(...cells)),
  new AllDifferent(...typeUnion(renbanLines)),

  ...regionSumLines.map(cells => new RegionSumLine(...cells)),
  new AllDifferent(...typeUnion(regionSumLines)),

  ...whiteDotPairs.map(([a, b]) => new WhiteDot(a, b)),
  new AllDifferent(...typeUnion(whiteDotPairs)),

  ...blackDotPairs.map(([a, b]) => new BlackDot(a, b)),
  new AllDifferent(...typeUnion(blackDotPairs)),

  ...vPairs.map(([a, b]) => new V(a, b)),
  new AllDifferent(...typeUnion(vPairs)),

  ...xPairs.map(([a, b]) => new X(a, b)),
  new AllDifferent(...typeUnion(xPairs)),

  ...squareCells.map(cell => new Given(cell, 2, 4, 6, 8)),
  new AllDifferent(...squareCells),
];
