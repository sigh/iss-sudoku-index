// Title: Sprinkles Ice Cream
// Author: Frosty
// Video: https://www.youtube.com/watch?v=BZO6FAe2kSs
// Source: https://sudokupad.app/dfqhpy0fvc
//
// Normal sudoku + a 9-cell purple consecutive-set line + 5 green "differ by
// >= 5" lines + a 4-cell grey line whose adjacent digits share one constant
// difference along its whole length + 6 black ratio dots + one V (sum 5) +
// three X (sum 10) + two killer cages (all-different, sum to the corner
// total). Regions are the default 3x3 boxes.
//
// The grey line has no dedicated ISS class ("constant difference" is not
// Modular/Whisper/Renban), so it is a hand-written NFA: state carries the
// previous cell's value and the difference fixed by the first step (once
// set, every later step must match it exactly, in the same signed
// direction along the drawn line).
const greySameDiffSpec = NFA.encodeSpec({
  startState: { prev: null, delta: null },
  transition: ({ prev, delta }, value) => {
    if (prev === null) return { prev: value, delta: null };
    if (delta === null) return { prev: value, delta: value - prev };
    if (value - prev !== delta) return undefined;
    return { prev: value, delta };
  },
  accept: () => true,
}, 9);

return [
  new Shape('9x9'),

  new Given('R1C1', 5),
  new Given('R8C5', 6),

  new Cage(12, 'R9C1', 'R9C2', 'R9C3'),
  new Cage(18, 'R9C7', 'R9C8', 'R9C9'),

  new Renban('R4C3', 'R3C3', 'R2C3', 'R1C4', 'R1C5', 'R1C6', 'R2C7', 'R3C7', 'R4C7'),

  new Whisper(5, 'R5C5', 'R6C4'),
  new Whisper(5, 'R5C6', 'R6C5'),
  new Whisper(5, 'R4C4', 'R4C5', 'R4C6'),
  new Whisper(5, 'R4C3', 'R5C3', 'R6C3', 'R7C4', 'R8C5'),
  new Whisper(5, 'R6C6', 'R7C5'),

  new NFA(greySameDiffSpec, 'grey-same-diff', 'R4C7', 'R5C7', 'R6C7', 'R7C6'),

  new BlackDot('R1C5', 'R2C5'),
  new BlackDot('R2C4', 'R3C4'),
  new BlackDot('R2C6', 'R3C6'),
  new BlackDot('R6C8', 'R7C8'),
  new BlackDot('R7C2', 'R8C2'),
  new BlackDot('R7C9', 'R8C9'),

  new V('R2C5', 'R2C6'),

  new X('R2C4', 'R2C5'),
  new X('R1C6', 'R2C6'),
  new X('R2C8', 'R3C8'),
];
