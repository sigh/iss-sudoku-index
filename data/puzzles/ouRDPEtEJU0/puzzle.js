// Title: Manta
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=ouRDPEtEJU0
// Source: https://sudokupad.app/nktjmzm64k

// Normal sudoku rules apply (default row/column/box all-different; no givens).
// Purple lines: digits an equal distance from the center of the line sum to
// the center digit -- Zipper's exact semantics for an odd-length line.
// Blue lines: every 3 consecutive digits sum to a multiple of 5. No blue
// line's length is a multiple of 3, so this is read as a sliding window over
// consecutive triples, enforced with a custom NFA since there is no native
// "sum is a multiple of N" line class.

// Purple (Zipper) lines. Cell order and center position (mid-index of each
// list, matching a drawn dot underlay) transcribed from the drawn line and
// dot geometry.
const zipperLines = [
  ['R6C5', 'R5C5', 'R4C5', 'R3C4', 'R3C5', 'R4C6', 'R5C6'],
  ['R1C6', 'R1C5', 'R1C4', 'R1C3', 'R2C2'],
  ['R2C5', 'R2C4', 'R3C3'],
  ['R5C2', 'R4C2', 'R3C1', 'R4C1', 'R5C1'],
  ['R6C7', 'R6C8', 'R5C8'],
  ['R8C7', 'R9C7', 'R9C8'],
];

// Blue lines. Cell order transcribed from the drawn line geometry.
const blueLines = [
  ['R4C4', 'R5C4', 'R6C4', 'R7C5', 'R6C6'],
  ['R9C4', 'R8C4', 'R7C4', 'R6C3', 'R6C2'],
  ['R6C9', 'R7C9', 'R8C9', 'R7C8'],
  ['R7C7', 'R8C8', 'R9C9'],
  ['R1C9', 'R2C9', 'R3C9'],
];

// State is the residues (mod 5) of the last up to 2 digits scanned. On every
// new digit once 2 prior digits are buffered, the window {prev2, prev1, new}
// must sum to a multiple of 5; only residues are needed since sum-mod-5 is
// linear in the addends. `multiSegment` resets the history at each line
// boundary so lines don't interact.
const multipleOfFiveSpec = NFA.encodeSpec({
  startState: { history: [] },
  transition: ({ history }, value) => {
    if (value === SEGMENT_BREAK) return { history: [] };
    const r = value % 5;
    if (history.length < 2) return { history: [...history, r] };
    const [a, b] = history;
    if ((a + b + r) % 5 !== 0) return undefined;
    return { history: [b, r] };
  },
  accept: () => true,
}, 9, { multiSegment: true });

return [
  new Shape('9x9'),
  ...zipperLines.map(cells => new Zipper(...cells)),
  new NFA(multipleOfFiveSpec, 'sum-of-3-mod-5', ...blueLines),
];
