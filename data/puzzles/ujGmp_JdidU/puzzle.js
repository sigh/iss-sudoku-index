// Title: Tokyo Olympics
// Author: Aspartagcus
// Video: https://www.youtube.com/watch?v=ujGmp_JdidU
// Source: https://app.crackingthecryptic.com/sudoku/7NdjLLJ379

// Normal sudoku rules apply. No given digits. Grey circles are odd digits
// (Given restriction). Digits along a thermometer ascend or repeat from the
// bulb ("slow thermo") -- there is no built-in slow-thermo class, so each is
// a chain of consecutive-pair `a <= b` constraints, matching how `Thermo`
// itself binds only consecutive cells in list order.
//
// Five thermometers are drawn, arranged and coloured like the Olympic rings.
// Four have their filled bulb circle at a stroke endpoint (the ordinary
// case). The red thermometer is drawn as one continuous 8-cell stroke, but
// its bulb circle sits on the third cell (R6C9), not an end. Values must
// ascend away from that cell in both directions, so it is encoded as two
// arms sharing the bulb cell rather than one 8-cell chain.

// a <= b: consecutive values along a slow-thermo arm may repeat or increase.
const slowKey = Pair.fnToKey((a, b) => a <= b, 9);

const slowThermo = (...cells) => new Pair(slowKey, 'slow thermo', ...cells);

const thermos = [
  // Gold, bulb R3C4.
  slowThermo('R3C4', 'R4C5', 'R5C5', 'R6C4', 'R6C3', 'R5C2', 'R4C2', 'R3C3'),
  // Black, bulb R4C7.
  slowThermo('R4C7', 'R3C6', 'R3C5', 'R4C4', 'R5C4', 'R6C5', 'R6C6', 'R5C7'),
  // Yellow-green, bulb R6C7.
  slowThermo('R6C7', 'R5C6', 'R5C5', 'R6C4', 'R7C4', 'R8C5', 'R8C6', 'R7C7'),
  // Blue, bulb R2C2.
  slowThermo('R2C2', 'R1C3', 'R1C4', 'R2C5', 'R3C5', 'R4C4', 'R4C3', 'R3C2'),
  // Red, bulb R6C9 (mid-stroke) -- two arms.
  slowThermo('R6C9', 'R5C8', 'R5C7'),
  slowThermo('R6C9', 'R7C9', 'R8C8', 'R8C7', 'R7C6', 'R6C6'),
];

// Grey circles: odd digit.
const oddCells = ['R1C6', 'R1C9', 'R2C9', 'R2C7'];
const oddGivens = oddCells.map(cell => new Given(cell, 1, 3, 5, 7, 9));

return [
  new Shape('9x9'),
  ...oddGivens,
  ...thermos,
];
