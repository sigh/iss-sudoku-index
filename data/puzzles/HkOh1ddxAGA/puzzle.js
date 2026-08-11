// Title: Sequence Sudoku
// Author: Thomas Fink
// Video: https://www.youtube.com/watch?v=HkOh1ddxAGA
// Source: https://app.crackingthecryptic.com/sudoku/f9h3FHGDBn

// Normal sudoku rules apply (standard 3x3 boxes). Digits along a grey line must increase
// by the same amount, in the same direction: each line, read in the order
// listed below, must be an arithmetic progression with a constant nonzero
// step from one cell to the next. No class in the ISS catalog expresses an
// equal-step-and-direction run (Whisper only bounds |diff| >= k, Renban only
// requires a consecutive *set* in any order), so all 11 lines share one
// custom NFA (they serialize into a single multi-segment line): it tracks
// the previous value and the step fixed by the first pair within a segment,
// rejecting a step of 0 (an equal pair would not be an "increase") or any
// later step that does not match; SEGMENT_BREAK resets the state so each
// line is judged independently of the others.
const seqSpec = NFA.encodeSpec({
  startState: { lastVal: null, diff: null },
  transition: ({ lastVal, diff }, value) => {
    if (value === SEGMENT_BREAK) return { lastVal: null, diff: null };
    if (lastVal === null) return { lastVal: value, diff };
    const newDiff = value - lastVal;
    if (diff === null) {
      if (newDiff === 0) return undefined;
      return { lastVal: value, diff: newDiff };
    }
    if (newDiff !== diff) return undefined;
    return { lastVal: value, diff };
  },
  accept: () => true,
}, 9, { multiSegment: true });

// Grey lines, cell order taken from interpolating each drawn line's path
// between grid cells.
const greyLines = [
  ['R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1'],
  ['R3C2', 'R2C2', 'R2C3', 'R3C3'],
  ['R1C4', 'R1C5', 'R1C6'],
  ['R2C4', 'R3C4', 'R4C3'],
  ['R2C6', 'R3C6', 'R4C5'],
  ['R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8'],
  ['R9C7', 'R9C8', 'R8C9'],
  ['R6C7', 'R6C8', 'R6C9'],
  ['R3C7', 'R3C8', 'R3C9'],
  ['R4C1', 'R4C2', 'R5C2'],
  ['R5C1', 'R6C1', 'R7C1', 'R7C2'],
];

return [
  new Shape('9x9'),
  new Given('R1C9', 3),
  new Given('R9C1', 7),
  // Distinct names are per-segment labels only: the serializer still packs
  // all 11 lines sharing this encodedNFA into one multi-segment .NFA line
  // (11 disjoint SEGMENT_BREAK-separated groups).
  ...greyLines.map((cells, i) => new NFA(seqSpec, `seq${i + 1}`, ...cells)),
];
