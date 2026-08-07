// Title: And Then There Were None
// Author: fjam
// Video: https://www.youtube.com/watch?v=PnWctUoudKk
// Source: https://app.crackingthecryptic.com/sudoku/mJ84P77h6g

// Normal sudoku rules apply, but the alphabet is the ten digits 0-9 and the
// grid is filled "with the nine victims, leaving out the murderer": one digit
// is absent from the whole grid, so every row, column and box holds the same
// nine-digit subset of 0-9.
//
// The rhyme's ten verses each name a clue type and kill one digit, and "each
// line of the rhyme refers only to the remaining digits", so the ten victims
// are ten distinct digits. Encoded below: the sandwich (v1), the whisper lines
// (v3), the renban line (v4), the arrow (v5), the parity line (v6), the two
// squeeze clues (v2 and v8), the thermometer (v9), the odd cell (v10), and the
// distinctness of the eight victims the drawing identifies.
//
// "Normal sudoku variant rules apply" is spelled out in the video description:
// purple lines hold consecutive digits; adjacent digits on green lines differ
// by at least 5; thermometers increase from the bulb; an arrow's digits sum to
// its circle; digits on a line between two circles lie between the circled
// ends; cells split by a white dot are consecutive. That list names no rule for
// a red line, and does not cover the sandwich or the even and odd shadings.
//
// Three things are left unencoded.
//   - Which of the two red strokes is verse 6's parity line: they draw a fish
//     between them (verse 7's red herring), share both endpoints R4C4 and
//     R4C7, and are identical in colour, thickness and waypoint count, so the
//     disjunction over both is encoded instead of asserting one.
//   - Verse 7's own victim, the digit the herring swallowed: the fish body
//     encloses two cells, R4C5 and R4C6, and nothing picks between them.
//   - Verse 6's victim, a digit on the parity line: no cell is singled out.
const shape = new Shape('9x9', '0-9');

// Sandwich, verse 1. "Sandwich crusts have been marked with thin rectangles
// and contain the highest and lowest digits in the grid": the thin rectangles
// are drawn in R1C3 and R1C5. RegionSameValues makes row 1 hold the grid's
// whole digit set, so "highest and lowest in the grid" is checkable inside row
// 1 alone -- every other row-1 cell lies strictly between the two crusts,
// which leaves open which crust is the high one.
const crustA = 'R1C3';
const crustB = 'R1C5';
const row1Others = ['R1C1', 'R1C2', 'R1C4', 'R1C6', 'R1C7', 'R1C8', 'R1C9'];
const sandwich = new Between(crustA, ...row1Others, crustB);

// Parity marks: the grey square on R1C4 and the grey circle on R4C8. R1C4 is
// the only cell between the two crusts, i.e. the digit "evenly spread in a
// sandwich" (verse 1); R4C8 is verse 10's "oddly still killed".
const evenCell = new Given('R1C4', 0, 2, 4, 6, 8);
const oddCell = new Given('R4C8', 1, 3, 5, 7, 9);

// Whispers, verse 3: the two green lines, which cross at R2C2.
const whispers = [
  new Whisper(5, 'R1C2', 'R2C2', 'R3C2', 'R4C2'),
  new Whisper(5, 'R2C1', 'R2C2', 'R2C3'),
];

// Renban, verse 4: the purple line.
const renban = new Renban('R7C2', 'R8C2', 'R9C2');

// Arrow, verse 5: hollow bulb on R6C2, arm along row 6.
const arrow = new Arrow('R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6');

// Parity line, verse 6: "one was shot for different parity", i.e. adjacent
// digits alternate odd and even. The red drawing is the only geometry left for
// this verse, and its two strokes are indistinguishable, so either may be the
// line.
const redStrokeUpper = ['R5C3', 'R4C4', 'R3C5', 'R3C6', 'R4C7'];
const redStrokeLower = ['R3C3', 'R4C4', 'R5C5', 'R5C6', 'R4C7'];
const parityLine = new Or([
  new Modular(2, ...redStrokeUpper),
  new Modular(2, ...redStrokeLower),
]);

// The two squeeze clues, verses 2 and 8 in some order.
// White-with-black-border dots on the column 9 edges: consecutive digits.
const dotChain = new WhiteDot('R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9');
// Two hollow circles on R3C7 and R1C9 joined by a thin line through R2C8:
// "digits along a line between two circles must have values between those in
// the circled ends".
const squashed = new Between('R3C7', 'R2C8', 'R1C9');

// Thermometer, verse 9: filled bulb on R9C6, "melted at peak temperature".
const thermo = new Thermo('R9C6', 'R9C5', 'R8C4', 'R7C4', 'R8C5', 'R8C6');

// The victims the drawing identifies, one per verse and so all different.
// R1C4 is the sandwich filling (v1); R8C9 the cage on the white-dot chain,
// "under white cliffs" (v2); R2C2 the whisper crossing (v3); R8C2 the renban's
// centre, "chopped itself symmetrically" (v4); R6C6 the arrow tip (v5); R2C8
// the middle of the three cells joined by the between line, "squashed between
// the others" (v8); R8C6 the thermometer's hot end (v9); R4C8 the odd cell
// (v10). Verses 2 and 8 could be swapped between the dot chain and the between
// line without changing either constraint or the membership of this list.
// R8C2, R6C6, R4C8 and R8C9 are the source's four single-cell cages -- "some
// victims have been identified by cages in the grid".
const victims = new AllDifferent(
  'R1C4', 'R2C2', 'R8C2', 'R6C6', 'R2C8', 'R8C6', 'R4C8', 'R8C9');

return [
  shape,
  new RegionSameValues(),
  sandwich,
  evenCell,
  oddCell,
  ...whispers,
  renban,
  arrow,
  parityLine,
  dotChain,
  squashed,
  thermo,
  victims,
];
