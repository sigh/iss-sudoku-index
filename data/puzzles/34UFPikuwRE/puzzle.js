// Title: The Crustler Building
// Author: Scojo
// Video: https://www.youtube.com/watch?v=34UFPikuwRE
// Source: https://app.crackingthecryptic.com/jfejlvb9ab

// Normal Sudoku. Each outside question-mark clue requires its viewed line's
// Sandwich sum to equal its Skyscraper visibility count; its actual integer is
// unspecified. Thermometers increase bulb-to-tip, and each arrow circle equals
// the sum of the digits on each of its arms.
const sandwichSkyscraper = NFA.encodeSpec({
  startState: { end: 0, done: false, sum: 0, high: 0, visible: 0 },
  transition: ({ end, done, sum, high, visible }, value) => {
    const nextVisible = visible + (value > high ? 1 : 0);
    const nextHigh = Math.max(high, value);
    if (done) return { end, done, sum, high: nextHigh, visible: nextVisible };
    if (!end) {
      return value === 1 || value === 9
        ? { end: value, done: false, sum: 0, high: nextHigh, visible: nextVisible }
        : { end: 0, done: false, sum: 0, high: nextHigh, visible: nextVisible };
    }
    if (value === 10 - end) {
      return { end, done: true, sum, high: nextHigh, visible: nextVisible };
    }
    return { end, done: false, sum: sum + value, high: nextHigh, visible: nextVisible };
  },
  accept: ({ done, sum, visible }) => done && sum === visible,
  maxDepth: 9,
}, 9);

const graph = cellGraph('9x9');
const row3 = graph.row(3);
const row5 = graph.row(5);
const col2 = graph.column(2);
const col5 = graph.column(5);
const col7 = graph.column(7);

// The ten drawn outside clues, with each array ordered from its own clue inward.
const outsideClues = [
  row3, [...row3].reverse(), row5, [...row5].reverse(),
  col2, [...col2].reverse(), col5, [...col5].reverse(), col7, [...col7].reverse(),
].map(cells => new NFA(sandwichSkyscraper, 'Sandwich/Skyscraper', ...cells));

// Thermometer paths and arrow arms transcribed from the drawn lines.
return [
  new Shape('9x9'),
  ...outsideClues,
  new Thermo('R8C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3'),
  new Thermo('R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2'),
  new Thermo('R1C7', 'R2C7', 'R3C8', 'R3C9'),
  new Arrow('R5C5', 'R5C6', 'R5C7', 'R5C8'),
  new Arrow('R5C5', 'R4C5', 'R3C5', 'R2C5'),
  new Arrow('R7C1', 'R8C2', 'R9C3'),
];
