// Title: Fifth Wheel
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=rNbGsE8aHq4
// Source: https://sudokupad.app/pw9xd2w523

// Normal sudoku rules apply (standard 3x3 boxes -- the payload's `regions`
// are the ordinary nine boxes, so no Jigsaw is needed). Along each drawn
// line, every set of 3 *consecutive* cells (a sliding window, not a fixed
// chunking into thirds) sums to a multiple of 5.
//
// Sliding-window sum-mod-5 has no dedicated line class, so each line is an
// `NFA` whose state is the last one or two digits read. On the third and
// later digit it sums the current 3-cell window and rejects (returns
// `undefined`) when the sum isn't a multiple of 5; `accept` is
// unconditionally true because a violated window has already killed the
// branch mid-scan, so any state actually reached at the end is valid.
const multipleOf5Window = NFA.encodeSpec({
  startState: { window: [] },
  transition: ({ window }, value) => {
    const next = [...window, value];
    if (next.length === 3 && (next[0] + next[1] + next[2]) % 5 !== 0) {
      return undefined;
    }
    return { window: next.slice(-2) };
  },
  accept: () => true,
}, 9);

// Line cell lists, transcribed from the drawn lines.
const lines = [
  ['R6C9', 'R6C8', 'R6C7', 'R5C7', 'R4C7'],
  ['R5C1', 'R6C2', 'R6C3', 'R5C3', 'R4C4'],
  ['R6C6', 'R6C5', 'R7C4', 'R8C4', 'R9C4'],
  ['R4C6', 'R3C7', 'R4C8', 'R5C9'],
  ['R1C4', 'R2C4', 'R3C4', 'R3C3', 'R2C2', 'R3C2'],
  ['R5C4', 'R4C5', 'R3C6'],
  ['R1C1', 'R1C2', 'R1C3'],
  ['R7C6', 'R8C7', 'R9C7'],
  ['R8C5', 'R8C6', 'R9C6'],
];

return [
  new Shape('9x9'),

  new Given('R1C7', 1),
  new Given('R3C1', 7),
  new Given('R7C9', 3),
  new Given('R9C3', 9),

  ...lines.map(
    (cells, i) => new NFA(multipleOf5Window, `sum-mod-5-${i}`, cells)),
];
