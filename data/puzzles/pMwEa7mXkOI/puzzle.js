// Title: 5's live in Foggy Flats
// Author: Antiknight
// Video: https://www.youtube.com/watch?v=pMwEa7mXkOI
// Source: https://app.crackingthecryptic.com/qcccbe8xug

// Normal sudoku rules apply; there are no givens. Each 5 has a 1 directly above
// it and/or a 9 directly below it. Arrows, green whisper lines, and the grey
// bulb-ended thermometer are transcribed from the drawn clues. Fog is reveal UI.
const fiveRule = NFA.encodeSpec({
  startState: { previous: null, needsNine: false },
  transition: ({ previous, needsNine }, value) => {
    if (needsNine && value !== 9) return undefined;
    return { previous: value, needsNine: value === 5 && previous !== 1 };
  },
  accept: ({ needsNine }) => !needsNine,
}, 9);

// The state carries the preceding cell; a 5 without a preceding 1 requires the
// next cell to be 9, and a pending requirement cannot remain at a column end.
const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const columns = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const fiveColumns = columns.map((column) =>
  new NFA(fiveRule, 'five-neighbor', ...rows.map((row) => makeCellId(row, column))),
);

// Arrow bulbs and arms come from the four circled arrow drawings.
const arrows = [
  new Arrow('R8C2', 'R7C2', 'R6C2', 'R5C3'),
  new Arrow('R6C7', 'R5C6', 'R5C5', 'R5C4'),
  new Arrow('R2C2', 'R2C3', 'R2C4'),
  new Arrow('R3C7', 'R4C7', 'R4C8'),
];

// Green line paths from the drawing.
const whispers = [
  new Whisper(5, 'R9C9', 'R8C8', 'R9C7', 'R8C6', 'R9C5', 'R8C4'),
  new Whisper(5, 'R9C3', 'R9C2', 'R9C1'),
  new Whisper(5, 'R7C4', 'R8C3'),
  new Whisper(5, 'R6C6', 'R7C7'),
];

// The grey circle at R7C3 is the bulb of the grey line to R6C4.
const thermos = [new Thermo('R7C3', 'R6C4')];

return [
  new Shape('9x9'),
  ...fiveColumns,
  ...arrows,
  ...whispers,
  ...thermos,
];
