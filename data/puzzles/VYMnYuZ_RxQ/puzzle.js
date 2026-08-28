// Title: Digital Root Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=VYMnYuZ_RxQ
// Source: https://cracking-the-cryptic.web.app/sudoku/RN3m2Nbbjm

// Normal sudoku rules apply, using the puzzle's own 3x3 box regions (the
// default). Digits do not repeat within a cage (killer-style), and the
// number printed on a cage is not its sum but the digital root of its sum:
// repeatedly add the sum's digits until one digit remains, e.g. a cage
// summing to 22 shows 4, since 2+2=4. (Rules text is the video description;
// the payload carries no metadata.rules.)
//
// For a sum S >= 1, digitalRoot(S) == v (v in 1..9) exactly when
// S mod 9 == v mod 9 (v = 9 maps to residue 0). So each cage's true sum S is
// `9*(j-1) + r` for some j >= 1, where r = printed value mod 9. A slack Var
// carries j (per cage); rearranged, cage cells minus 9*j equals r - 9, which
// Sum enforces linearly. j is left at its default 1..9 candidate range: any
// j the cage's actual cell sum cannot support is simply excluded by the
// equation, so no extra bound is needed for correctness.

// [cells, printed digital root] per drawn killer cage.
const cages = [
  [['R1C9', 'R2C9', 'R3C9', 'R4C9'], 8],
  [['R6C9', 'R7C9', 'R7C8', 'R8C8', 'R8C9'], 1],
  [['R2C7', 'R3C7', 'R4C7'], 6],
  [['R4C8', 'R5C8', 'R5C7'], 8],
  [['R7C7', 'R7C6', 'R6C6'], 8],
  [['R3C6', 'R4C6', 'R5C6', 'R4C5'], 4],
  [['R1C6', 'R2C6', 'R2C5', 'R3C5'], 4],
  [['R7C5', 'R8C5', 'R8C4', 'R9C4'], 8],
  [['R5C4', 'R6C4', 'R7C4', 'R6C5'], 4],
  [['R4C4', 'R3C4', 'R3C3'], 3],
  [['R1C3', 'R1C4', 'R1C5'], 2],
  [['R2C1', 'R2C2', 'R3C2', 'R3C1', 'R4C1'], 6],
  [['R5C2', 'R6C2', 'R5C3'], 3],
  [['R6C1', 'R7C1', 'R8C1', 'R9C1'], 5],
  [['R9C5', 'R9C6', 'R9C7'], 7],
  [['R6C3', 'R7C3', 'R8C3'], 1],
];

const quotient = new Var('K', 'cage sum quotient (S = 9*(j-1) + r)', cages.length);

return [
  new Shape('9x9'),

  // Givens (R#C# 1-indexed).
  new Given('R2C2', 8), new Given('R2C5', 3), new Given('R2C8', 5),
  new Given('R3C3', 7), new Given('R3C7', 3),
  new Given('R4C5', 8),
  new Given('R5C2', 7), new Given('R5C4', 1), new Given('R5C6', 3), new Given('R5C8', 4),
  new Given('R6C5', 7),
  new Given('R7C3', 1), new Given('R7C7', 5),
  new Given('R8C2', 2), new Given('R8C5', 1), new Given('R8C8', 3),

  quotient,
  ...cages.flatMap(([cells, root], i) => {
    const j = quotient.cell(i + 1);
    const r = root % 9;
    return [
      new AllDifferent(...cells),
      new Sum(r - 9, ...cells, [j, -9]),
    ];
  }),
];
