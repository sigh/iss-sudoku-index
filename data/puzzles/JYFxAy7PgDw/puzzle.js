// Title: Critical Hit
// Author: Black_Doom
// Video: https://www.youtube.com/watch?v=JYFxAy7PgDw
// Source: https://app.crackingthecryptic.com/sacpbwcs19

// Normal Sudoku rules apply. Each outside 15 is a Hit Points clue: scanning
// away from the clue, cells contribute only when their digit equals their
// 1-based distance, and those contributions sum to 15. Green lines are
// German Whispers. The payload's cell paths and outside-clue lanes supply the
// listed line geometry.
const hitPoints15 = NFA.encodeSpec({
  startState: { distance: 0, total: 0 },
  transition: ({ distance, total }, value) => {
    const nextDistance = distance + 1;
    const nextTotal = total + (value === nextDistance ? value : 0);
    return nextTotal <= 15 ? { distance: nextDistance, total: nextTotal } : undefined;
  },
  accept: ({ distance, total }) => distance === 9 && total === 15,
  maxDepth: 9,
}, 9);

const hitPointLines = [
  ['C2', ['R1C2', 'R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C2', 'R9C2']],
  ['C5', ['R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5']],
  ['C8', ['R1C8', 'R2C8', 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8', 'R9C8']],
  ['R2', ['R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9']],
  ['R5', ['R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9']],
  ['R8', ['R8C1', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R8C9']],
];

// Green-line paths transcribed from the payload's drawn line geometry.
const whispers = [
  ['R4C7', 'R4C8', 'R5C8', 'R5C7'],
  ['R5C2', 'R4C2', 'R4C3'],
  ['R8C2', 'R7C2', 'R7C1'],
  ['R3C3', 'R3C4', 'R4C4'],
  ['R3C6', 'R3C7'],
  ['R6C4', 'R7C3'],
];

return [
  new Shape('9x9'),
  ...hitPointLines.map(([name, cells]) => new NFA(hitPoints15, `HP15-${name}`, ...cells)),
  ...whispers.map(cells => new Whisper(5, ...cells)),
];
