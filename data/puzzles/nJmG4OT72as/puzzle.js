// Title: Rosette
// Author: Gliperal
// Video: https://www.youtube.com/watch?v=nJmG4OT72as
// Source: https://app.crackingthecryptic.com/sudoku/Tnb9pttPL2

// Standard Sudoku rules apply. Grey fast thermometers rise by at least 2 from
// their circular bulbs. Clockwise around the red ring, at most five adjacent
// transitions may fail to rise; the repeated first cell includes its closing edge.
const fastRise = Pair.fnToKey((a, b) => b >= a + 2, 9);
const fastThermos = [
  // Grey bulb-marked paths transcribed from the drawing.
  new Pair(fastRise, 'fast thermometer', 'R2C2', 'R1C1', 'R2C1'),
  new Pair(fastRise, 'fast thermometer', 'R2C8', 'R2C9'),
  new Pair(fastRise, 'fast thermometer', 'R5C5', 'R5C4', 'R4C5'),
  new Pair(fastRise, 'fast thermometer', 'R6C2', 'R5C2', 'R4C2'),
  new Pair(fastRise, 'fast thermometer', 'R6C8', 'R5C8', 'R4C8'),
  new Pair(fastRise, 'fast thermometer', 'R7C5', 'R8C5'),
  new Pair(fastRise, 'fast thermometer', 'R8C2', 'R8C1'),
  new Pair(fastRise, 'fast thermometer', 'R8C2', 'R9C2'),
  new Pair(fastRise, 'fast thermometer', 'R8C8', 'R7C9'),
];

// State holds the preceding ring digit and the number (0-5) of non-rising
// clockwise transitions. A sixth exception has no transition and is rejected.
const ringSpec = NFA.encodeSpec({
  startState: { previous: null, exceptions: 0 },
  transition: ({ previous, exceptions }, value) => {
    if (previous === null) return { previous: value, exceptions: 0 };
    const nextExceptions = exceptions + (value <= previous ? 1 : 0);
    return nextExceptions <= 5
      ? { previous: value, exceptions: nextExceptions }
      : undefined;
  },
  accept: () => true,
}, 9);

// Red closed path transcribed clockwise from the drawing.
const redRing = new NFA(ringSpec, 'red rosette',
  'R1C4', 'R1C5', 'R1C6', 'R2C7', 'R2C8', 'R3C8', 'R4C9', 'R5C9',
  'R6C9', 'R7C8', 'R8C8', 'R8C7', 'R9C6', 'R9C5', 'R9C4', 'R8C3',
  'R8C2', 'R7C2', 'R6C1', 'R5C1', 'R4C1', 'R3C2', 'R2C2', 'R2C3',
  'R1C4');

return [
  new Shape('9x9'),
  ...fastThermos,
  redRing,
];
