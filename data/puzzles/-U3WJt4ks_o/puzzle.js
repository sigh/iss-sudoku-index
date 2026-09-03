// Title: Weird Arrows
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=-U3WJt4ks_o
// Source: https://sudokupad.app/ur11o44tv3

// Normal Sudoku rules apply; the grid has no given digits.
//
// BULBOUS ARROWS: the sum of the digits in a white bulb equals the sum of the
// digits on each attached arrow.
//
// A bulb here is a white shape covering one or more cells (nine wide white
// strokes, two single-cell white circles), so a bulb total is a sum of digits,
// not a single digit and not a multi-digit read. An arrow is a thin grey stroke
// leaving a bulb cell and ending in an arrowhead; its digits are the cells it
// covers outside its own bulb. Arrows may cross, and three of them end inside,
// cells belonging to a *different* bulb - those cells count for both clues.
//
// Every clue below is transcribed from the drawn white shapes and thin strokes:
// bulb cells first, then each attached arrow's cells in drawn order from the
// bulb out to its arrowhead.
const bulbousArrows = [
  { bulb: ['R1C3', 'R1C4', 'R1C5', 'R2C3', 'R2C4'], arrows: [['R1C6']] },
  // This arrow attaches at R4C8, turns at R3C8, and comes back across the bulb
  // over R4C7 before ending at R5C6. The stroke is drawn in two pieces: the
  // piece inside R4C8 runs beneath the white fill (so the arrow only appears to
  // emerge from the bulb's edge), while the piece over R4C7 is drawn on top of
  // the fill and is plainly visible - the same way the other arrows that cross
  // a bulb are drawn. So R4C8 is the attachment cell and R4C7 is a crossed cell
  // carrying an arrow digit.
  { bulb: ['R4C7', 'R4C8', 'R4C9'], arrows: [['R3C8', 'R4C7', 'R5C6']] },
  { bulb: ['R4C3', 'R4C4', 'R5C4', 'R6C4'], arrows: [['R4C5', 'R4C6']] },
  // The only bulb carrying two arrows.
  { bulb: ['R7C6', 'R8C6'], arrows: [['R6C6', 'R6C5'], ['R8C7', 'R7C7']] },
  { bulb: ['R3C1', 'R4C1', 'R5C1'], arrows: [['R4C2']] },
  { bulb: ['R7C2', 'R7C3', 'R8C3'], arrows: [['R6C4', 'R5C5']] },
  { bulb: ['R8C4', 'R9C4', 'R9C5'], arrows: [['R7C4', 'R7C5', 'R8C5']] },
  { bulb: ['R5C2', 'R6C2'], arrows: [['R5C3', 'R5C4']] },
  { bulb: ['R1C8', 'R1C9', 'R2C8', 'R2C9'], arrows: [['R3C9', 'R4C8']] },
  { bulb: ['R3C5'], arrows: [['R2C4', 'R1C3']] },
  { bulb: ['R6C7'], arrows: [['R7C8']] },
];

// EqualSum makes every listed segment share one total, so listing the bulb
// alongside its arrows gives "bulb total = each attached arrow total".
return [
  new Shape('9x9'),
  ...bulbousArrows.map(c => new EqualSum(c.bulb, ...c.arrows)),
];
