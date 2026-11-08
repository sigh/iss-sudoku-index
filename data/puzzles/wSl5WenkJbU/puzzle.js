// Title: Dutch Masyu
// Author: yttrio
// Video: https://www.youtube.com/watch?v=wSl5WenkJbU
// Source: https://sudokupad.app/jov93r0b6g

// Normal Sudoku; a single orthogonal non-intersecting Masyu loop through all
// circles, Dutch Whispers on its edges, and circle digits counting both straight
// arms through their first turning cells, including the circle once.
const shape = new Shape('9x9', '1-16');
const graph = cellGraph('9x9');
const cells = Array.from({length:81}, (_,i)=>makeCellId(1+Math.floor(i/9),1+i%9));
const dirs = [[-1,0],[0,1],[1,0],[0,-1]];
const codes = [null,null];
for(let a=0;a<4;a++) for(let b=0;b<4;b++) if(a!==b) codes.push([a,b]);
const values = Array.from({length:13},(_,i)=>i+1);
const active = values.slice(1);
const straight = active.filter(v=>(codes[v][0]+2)%4===codes[v][1]);
const turns = active.filter(v=>!straight.includes(v));
const L=graph.makeOverlay('VL'), A=graph.makeOverlay('VA'), B=graph.makeOverlay('VB');
const neighbor=(cell,d)=>{const {row,col}=parseCellId(cell);const [dr,dc]=dirs[d];return graph.neighbours(cell).find(n=>{const p=parseCellId(n);return p.row===row+dr&&p.col===col+dc;})||null;};
const has=(v,d)=>v!==1&&codes[v].includes(d);
const key=fn=>Pair.fnToKey((a,b)=>a<=13&&b<=13&&fn(a,b),shape);
// Directed codes record predecessor and successor; code 1 means off-loop.
const domains=cells.map(c=>new Given(L.at(c),...values.filter(v=>v===1||codes[v].every(d=>neighbor(c,d)))));
const edgeAgreement=[1,2].map(d=>L.makeReplicate([new Pair(key((a,b)=>has(a,d)===has(b,(d+2)%4)&&(!has(a,d)||((codes[a][1]===d)===(codes[b][0]===(d+2)%4)))),'directed edge',L.at('R1C1'),L.at(neighbor('R1C1',d)))],L.at(cells.filter(c=>neighbor(c,d)))));
const whisperKey=key((a,b)=>Math.abs(a-b)>=4);
const whispers=cells.flatMap(c=>[1,2].flatMap(d=>{const n=neighbor(c,d);return n?[new Or([new Given(L.at(c),...values.filter(v=>!has(v,d))),new Pair(whisperKey,'Dutch Whispers',c,n)])]:[];}));
// Drawn circle fills and positions, and the sole printed given.
const white=['R2C3','R4C3','R5C4','R4C5','R5C7','R1C7'];
const black=['R1C4','R9C3'];
const masyu=[...white.map(c=>new Or([...straight.map(v=>{const ns=codes[v].map(d=>neighbor(c,d));return new And([new Given(L.at(c),v),new Or([...ns.filter(Boolean).map(n=>new Given(L.at(n),...turns))])]);})])),...black.map(c=>new Or([...turns.filter(v=>codes[v].every(d=>neighbor(c,d))).map(v=>new And([new Given(L.at(c),v),...codes[v].map(d=>new Given(L.at(neighbor(c,d)),...straight))]))]))];
// Each branch chooses the two arm lengths; all intervening cells are straight,
// and the final cell turns, so the count includes precisely the stated segments.
const arm=(c,d,len)=>{const result=[];let n=c;for(let k=1;k<=len;k++){n=neighbor(n,d);if(!n)return null;result.push(new Given(L.at(n),...(k===len?turns.filter(v=>has(v,(d+2)%4)):straight.filter(v=>has(v,d)))));}return result;};
const counts=[...white,...black].map(c=>new Or([...active.flatMap(v=>{const [d,e]=codes[v];return Array.from({length:7},(_,i)=>i+1).flatMap(a=>Array.from({length:8-a},(_,i)=>i+1).flatMap(b=>{const x=arm(c,d,a),y=arm(c,e,b);return x&&y?[new And([new Given(L.at(c),v),new Given(c,1+a+b),...x,...y])]:[];}));})]));
// The top-edge black circle necessarily has a downward arm. Orient its exit
// downward to remove reversal symmetry. Counters modulo 9 and 10 restart here;
// their lcm 90 exceeds 81 cells, excluding every disconnected directed cycle.
const seam='R1C4';
const orient=new Given(L.at(seam),...active.filter(v=>codes[v][1]===2));
const layers=[[A,9],[B,10]];
const counterDomains=layers.flatMap(([layer,mod])=>cells.map(c=>new Or([new And([new Given(L.at(c),1),new Given(layer.at(c),11)]),new And([new Given(L.at(c),...active),new Given(layer.at(c),...Array.from({length:mod},(_,i)=>i+1))])])));
const counters=layers.flatMap(([layer,mod])=>[new Given(layer.at(seam),1),...cells.flatMap(c=>dirs.flatMap((_,d)=>{const n=neighbor(c,d);return n&&n!==seam?[new Or([new Given(L.at(c),...values.filter(v=>v===1||codes[v][1]!==d)),new Pair(key((a,b)=>a<=mod&&b===a%mod+1),'route position',layer.at(c),layer.at(n))])]:[];}))]);
return [shape,graph.makeReplicate(new Given('R1C1',1,2,3,4,5,6,7,8,9)),new Given('R3C8',4),L.toVar('loop'),A.toVar('modulo 9'),B.toVar('modulo 10'),...domains,...edgeAgreement,...whispers,...masyu,...counts,orient,...counterDomains,...counters];
