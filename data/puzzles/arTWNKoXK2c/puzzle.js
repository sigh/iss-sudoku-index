// Title: Light Bulb Moment
// Author: ZegreS
// Video: https://www.youtube.com/watch?v=arTWNKoXK2c
// Source: https://app.crackingthecryptic.com/sudoku/JBNhmrn8dq
//
// Standard rows/columns/boxes, no givens.
//
// The riddle fixes which of the 43 hallway bulbs stay lit: bulb n is toggled
// once per divisor of n, so it ends on iff n has an odd divisor count, iff n
// is a perfect square. Among 1..43 that is {1,4,9,16,25,36} -- a fact derived
// from the rules text itself, not from the solution.
//
// The hallway is the drawn 43-cell region (a cage with no total -- its
// no-total cage geometry only marks scope, since a 43-cell all-different is
// impossible on 9 values). Rules text: "the hallway starts with Bulb 1 in
// R1C3", matching this region's first listed cell; every one of the five
// drawn arrows below also runs in the direction of increasing position along
// this same order, so hallway position order = the region's listed cell
// order (see the `hallway` array below for the full 1..43 walk).
//
// Lit positions {1,4,9,16,25,36} land on R1C3, R1C6, R3C9, R3C2, R5C7, R7C2.
// Brightness rule: each lit cell outranks its hallway neighbor(s); moving
// away from a lit cell, digits strictly fall to an unfixed darkest cell then
// strictly rise to the next lit cell (position 1 has only a right neighbor;
// after the last lit cell at position 36, positions 37-43 just keep falling
// with no further rise).

const hallway = [
  'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9',
  'R2C9',
  'R3C9', 'R3C8', 'R3C7', 'R3C6', 'R3C5', 'R3C4', 'R3C3', 'R3C2', 'R3C1',
  'R4C1',
  'R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9',
  'R6C9',
  'R7C9', 'R7C8', 'R7C7', 'R7C6', 'R7C5', 'R7C4', 'R7C3', 'R7C2', 'R7C1',
  'R8C1',
  'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5',
];

// Position (1-indexed) of every perfect square <= 43: the lit bulbs.
const litPositions = [1, 4, 9, 16, 25, 36];

// One NFA per stretch between consecutive lit positions: strictly falling
// from the first (lit) cell to an unfixed valley, then strictly rising to
// the next (lit) cell. `phase` starts 'desc'; the first move must fall
// (the lit cell must outrank its neighbor); a rise switches phase to 'asc'
// once, permanently (no returning to 'desc'); a tie is always rejected.
// Accepting only in phase 'asc' forces the segment to end on a rise, so the
// next lit cell is also confirmed higher than its preceding neighbor.
const valleySpec = NFA.encodeSpec({
  startState: { phase: 'desc', prev: null },
  transition: ({ phase, prev }, value) => {
    if (prev === null) return { phase: 'desc', prev: value };
    if (phase === 'desc') {
      if (value < prev) return { phase: 'desc', prev: value };
      if (value > prev) return { phase: 'asc', prev: value };
      return undefined;
    }
    // phase === 'asc'
    if (value > prev) return { phase: 'asc', prev: value };
    return undefined;
  },
  accept: ({ phase }) => phase === 'asc',
}, 9);

const valleys = [];
for (let i = 0; i + 1 < litPositions.length; i++) {
  const from = litPositions[i];
  const to = litPositions[i + 1];
  const cells = hallway.slice(from - 1, to); // inclusive of both lit cells
  valleys.push(new NFA(valleySpec, `valley${from}_${to}`, ...cells));
}

// After the last lit cell (position 36) the hallway only keeps darkening:
// strictly decreasing all the way to position 43, with no further rise.
// Thermo enforces strictly increasing from its first cell, so list the tail
// back-to-front (position 43 first) to get strictly decreasing 36 -> 43.
const tailCells = hallway.slice(35, 43).reverse();
const tail = new Thermo(...tailCells);

// Arrow sum clues: circled cell (lower hallway position) = sum of the line
// cells (higher hallway positions).
const arrows = [
  new Arrow('R1C7', 'R1C8', 'R1C9'),
  new Arrow('R3C8', 'R3C7', 'R3C6'),
  new Arrow('R3C2', 'R3C1', 'R4C1', 'R5C1'),
  new Arrow('R5C9', 'R6C9', 'R7C9'),
  new Arrow('R9C3', 'R9C4', 'R9C5'),
];

return [
  new Shape('9x9'),
  ...valleys,
  tail,
  ...arrows,
];
