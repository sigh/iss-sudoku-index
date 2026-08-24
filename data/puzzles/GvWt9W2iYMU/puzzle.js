// Title: The OG Wiggle
// Author: Community Creation
// Video: https://www.youtube.com/watch?v=GvWt9W2iYMU
// Source: https://app.crackingthecryptic.com/sudoku/LNqP9d8tdj

// Normal sudoku rules apply (standard rows/cols/3x3 boxes from the payload's
// own regions array).
//
// Grey circle (R1C7) = odd; grey square (R9C5) = even -- encoded as
// candidate-restricting Givens (no native Odd/Even class). The thermometer's
// own bulb marker at R6C4 is drawn as a circle in the identical grey used by
// its own thermometer line (a self-coloured bulb, not an independently
// grey-coloured marker like R1C7's, which has no line of its own) -- treated
// as the thermometer's default bulb rendering, not a second "grey circle"
// clue instance. Reading it as a second odd clue makes the full stated
// ruleset unsatisfiable; every other clue's geometry was independently
// re-verified against the raw waypoints and still holds, and dropping this
// one reading restores a unique solution.
//
// Blue snake line R3C7..R5C5 (17 cells): digits strictly between the values
// at its two endpoints.
//
// Two black arrows share one circle at R4C6 (bulb doubles as the sum target
// for both arms): arm R3C7,R2C8 and arm R5C5,R6C4.
// Purple arrow: circle R4C4, arm R3C3,R2C2,R1C1.
// Red arrow: 2-digit pill R1C5,R1C6 (left-to-right), arm R2C5,R3C5,R4C5,
// R5C6,R6C5,R7C4,R8C5.
//
// Two totalled killer cages (R8C1 block =15, R8C9 block =11): distinct + sum.
// One untotalled cage (R2C4,R3C4,R3C3,R4C3,R4C2): "digits in a cage do not
// repeat" still applies with no stated sum, so AllDifferent only (catalog:
// a killer cage with no total is simply AllDifferent).
//
// Grey thermometer bulb R6C4, increasing through R7C3, R8C2.
//
// Black dot between R3C1/R3C2: Kropki ratio 1:2 (BlackDot).
//
// Orange cell R6C8 greater than its four orthogonal neighbours: GreaterThan
// with R6C8 listed first -- none of the four neighbours are adjacent to each
// other, so a single constraint captures all four inequalities at once.
//
// Marked brown diagonal R1C9..R9C1 (the anti-diagonal): digits may not
// repeat -- native Diagonal(1) ('/' direction, matches this corner-to-corner
// line).
//
// A stub cage entry with no cells and every no-geometry line/arrow entry
// (styling-only duplicates of the real coloured lines/arrows) render nothing
// and are omitted.
// The four short black stub arrows around R6C8 (length ~0.2) are UI
// direction indicators for the "greater than" cell, not sum-arrow clues, and
// are omitted.

return [
  new Shape('9x9'),

  // Parity clues (grey circle = odd, grey square = even).
  new Given('R1C7', 1, 3, 5, 7, 9),
  new Given('R9C5', 2, 4, 6, 8),

  // Blue between-line, endpoints R3C7 and R5C5.
  new Between(
    'R3C7', 'R3C6', 'R3C5', 'R3C4', 'R3C3', 'R4C3', 'R5C3', 'R6C3',
    'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R6C7', 'R5C7', 'R5C6', 'R5C5'),

  // Arrows sharing the R4C6 circle.
  new Arrow('R4C6', 'R3C7', 'R2C8'),
  new Arrow('R4C6', 'R5C5', 'R6C4'),

  // Purple arrow to circle R4C4.
  new Arrow('R4C4', 'R3C3', 'R2C2', 'R1C1'),

  // Red arrow with a 2-digit pill R1C5/R1C6.
  new PillArrow(2, 'R1C5', 'R1C6',
    'R2C5', 'R3C5', 'R4C5', 'R5C6', 'R6C5', 'R7C4', 'R8C5'),

  // Killer cages.
  new Cage(15, 'R8C1', 'R9C1', 'R9C2', 'R8C2'),
  new Cage(11, 'R8C9', 'R9C9', 'R9C8'),
  new AllDifferent('R2C4', 'R3C4', 'R3C3', 'R4C3', 'R4C2'),

  // Thermometer, bulb R6C4.
  new Thermo('R6C4', 'R7C3', 'R8C2'),

  // Kropki black dot (1:2 ratio).
  new BlackDot('R3C1', 'R3C2'),

  // Orange cell greater than its four orthogonal neighbours.
  new GreaterThan('R6C8', 'R5C8', 'R7C8', 'R6C7', 'R6C9'),

  // Marked brown anti-diagonal, no repeats.
  new Diagonal(1),
];
