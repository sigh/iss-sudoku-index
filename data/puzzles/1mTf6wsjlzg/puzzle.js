// Title: Under Pressure
// Author: FullDeck and Missing a Few Cards
// Video: https://www.youtube.com/watch?v=1mTf6wsjlzg
// Source: https://app.crackingthecryptic.com/4xlxw5wmad

// Red gauges count smaller king neighbours; blue gauges count greater ones.
const graph = cellGraph('9x9');
const red = ['R1C4','R1C3','R2C7','R3C4','R3C2','R9C3','R9C4','R5C6','R6C8'];
const blue = ['R1C6','R3C6','R2C3','R3C1','R6C1','R6C4','R7C5','R6C7'];
const gauge = (greater) => NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + ((greater ? value > target : value < target) ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, 9);
const low = gauge(true), high = gauge(false);
return [new Shape('9x9'), new Given('R1C3',2),new Given('R1C7',5),new Given('R6C2',5),new Given('R8C6',6), ...red.map(cell => new NFA(high,'high pressure',cell,...graph.kingNeighbours(cell))), ...blue.map(cell => new NFA(low,'low pressure',cell,...graph.kingNeighbours(cell)))];
