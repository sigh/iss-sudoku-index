// Title: Duel of the Fates
// Author: Darth Paradox
// Video: https://www.youtube.com/watch?v=5SCb-wXmSpI
// Source: https://app.crackingthecryptic.com/sudoku/mhd2mbpddH

// Normal sudoku rules: default Shape('9x9') with its default 3x3 boxes,
// which match the puzzle's drawn regions exactly (nine standard boxes).
//
// Arrows: "the digits along each arrow must sum to the number in its
// circle" -- the circle sits on a grid cell (drawn with no printed number),
// so that cell's own digit is the target and Arrow's first cell is the
// circle per its documented semantics.
//
// Colored lines: "There are six different colors of lines in this puzzle.
// Each color corresponds to a different one of these constraints" (Dutch
// Whispers / Entropic / German Whispers / Palindrome / Region Sums /
// Renban), but nothing in the rules text or the drawn art says which color
// is which -- that correspondence is left for the solver to work out. This
// is encoded directly: one auxiliary Var per color holding its constraint
// type (1-6), AllDifferent across the six Vars (the quoted sentence commits
// to a bijection since there are exactly six colors and six named types),
// and each line becomes an Or of six branches -- one per type -- gated by
// its color's type Var via Given. No color-to-type mapping is chosen by the
// worker; the solver discovers it as part of solving, exactly as intended.

const shape = new Shape('9x9');

const givens = [
  new Given('R1C1', 9),
  new Given('R9C9', 1),
];

// Arrows: circle cell first, then the shaft cells.
// Provenance: each drawn arrow's blank circle sits exactly on the arrow's
// starting cell.
const arrows = [
  [['R2C7'], ['R1C8', 'R2C8', 'R3C8']],
  [['R3C7'], ['R4C8', 'R5C8']],
  [['R6C6'], ['R5C7', 'R4C6']],
  [['R4C4'], ['R5C4', 'R4C5']],
  [['R6C3'], ['R7C2', 'R8C2', 'R9C3']],
  [['R9C6'], ['R9C5', 'R8C5', 'R7C6']],
].map(([[circle], shaft]) => new Arrow(circle, ...shaft));

// Colored lines, grouped by color. Provenance: each stroke's drawn colour
// and interpolated cell path.
const linesByColor = {
  gold: [
    ['R4C2', 'R3C3', 'R2C4'],
    ['R3C4', 'R4C5', 'R5C5'],
    ['R6C8', 'R7C7', 'R8C6'],
  ],
  brown: [
    ['R7C6', 'R7C7', 'R7C8'],
    ['R3C2', 'R3C3', 'R3C4'],
  ],
  blue: [
    ['R1C3', 'R2C3', 'R3C3', 'R4C3', 'R5C3', 'R6C3'],
  ],
  yellowgreen: [
    ['R9C7', 'R8C7', 'R7C7', 'R6C7', 'R5C7', 'R4C7'],
  ],
  red: [
    ['R1C1', 'R2C2', 'R3C3', 'R4C4'],
    ['R6C6', 'R7C7', 'R8C8', 'R9C9'],
  ],
  gray: [
    ['R1C7', 'R2C7', 'R3C7', 'R4C7'],
    ['R4C4', 'R5C5', 'R6C6'],
    ['R6C3', 'R7C3', 'R8C3', 'R9C3'],
  ],
};

// The six named types, arbitrarily numbered 1-6 for the type Vars.
const TYPES = [
  cells => new Whisper(4, ...cells),  // 1: Dutch Whispers
  cells => new Entropic(...cells),    // 2: Entropic
  cells => new Whisper(5, ...cells),  // 3: German Whispers
  cells => new Palindrome(...cells),  // 4: Palindrome
  cells => new RegionSumLine(...cells), // 5: Region Sums
  cells => new Renban(...cells),      // 6: Renban
];

const colorType = new Var('CT', 'colour to constraint-type map', Object.keys(linesByColor).length);
const colorNames = Object.keys(linesByColor);

// Each color's type Var ranges only over the 6 named types, and the six
// Vars are all different -- together forcing a bijection between colors and
// types, per "Each color corresponds to a different one of these
// constraints."
const typeDomain = colorNames.map(
  (name, i) => new Given(colorType.cell(i + 1), 1, 2, 3, 4, 5, 6));
const typeBijection = new AllDifferent(...colorNames.map((_, i) => colorType.cell(i + 1)));

// Every line's constraint is unresolved: an Or over all six types, each
// branch gated by that color's type Var equalling the type's number.
const coloredLines = colorNames.flatMap((name, i) => {
  const typeVar = colorType.cell(i + 1);
  return linesByColor[name].map(cells => new Or(
    TYPES.map((build, k) => new And([
      new Given(typeVar, k + 1),
      build(cells),
    ]))
  ));
});

return [
  shape,
  ...givens,
  ...arrows,
  colorType,
  ...typeDomain,
  typeBijection,
  ...coloredLines,
];
