import {useState, render, createInstance} from './framework.mjs';

// Wait for all microtasks
// - for having all renders printed to console before moving to the next test
const flush = () => new Promise((resolve) => setImmediate(resolve));

/**
 * Test 1: basic
 */
console.log('---Test 1------');

function Counter(props) {
  const [count, setCount] = useState(0);
  const [name] = useState('Petr');
  return `[${props.label}] ${name}: ${count}`;
}

const counterInst = createInstance(Counter, {label: 'Label'});
render(counterInst);
const [, setCount] = counterInst.hooks[0];
setCount(1);
setCount(2);

await flush();

/**
 * Test 2: hook inside an if-block (overlapping indexes)
 */
console.log('\n---Test 2------');

function Test2(props) {
  // hook index = 0
  const [count] = useState(0);
  if (props.showName) {
    // hook index = 1
    const [name] = useState('Jitka');
    return `Name: ${name}, Count: ${count}`;
  }
  // also hook index = 1 (overlapping)
  const [age] = useState(30);
  return `Age: ${age}, Count: ${count}`;
}

const test2Inst = createInstance(Test2);
render(test2Inst, {showName: true});
render(test2Inst, {showName: false});

/**
 * Test 3: multiple instances
 */
console.log('\n---Test 3------');

function Test3(props) {
  const [count] = useState(0);
  return `${props.label} = ${count}`;
}

const A = createInstance(Test3, {label: 'A'});
const B = createInstance(Test3, {label: 'B'});
render(A);
render(B);
const [, setCountA] = A.hooks[0];
setCountA(1000);
await flush();
render(B); // B keeps its state

await flush();

/**
 * TEST 4: consecutive useState calls
 */
console.log('\n---Test 4------');

function Test4(props) {
  const [count, setCount] = useState(0);
  props.handlerDirect = () => {
    setCount(count + 1);
    setCount(count + 1);
  };
  props.handlerFunctional = () => {
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);
  };
  return `count: ${count}`;
}

const test4Inst = createInstance(Test4);
render(test4Inst);
test4Inst.props.handlerDirect();
test4Inst.props.handlerFunctional();

await flush();

/**
 * Test 5: functional initial value
 */
console.log('\n---Test 5------');

const init = (val) => {
  console.log(`init ${val}`);
  return val;
};
function Fruit() {
  const [fruit1] = useState(init('Apple'));
  const [fruit2] = useState(() => init('Pear'));
  return `fruit1: ${fruit1}, fruit2: ${fruit2}`;
}

const fruitInst = createInstance(Fruit);
render(fruitInst);
render(fruitInst);
render(fruitInst);

/**
 * Test 6: nested rendering
 */
console.log('\n---Test 6------');

const childInst = createInstance(function Child() {
  const [state] = useState('child');
  return state;
});

const parentInst = createInstance(function Parent() {
  const [state1] = useState('parent-1');
  const inner = render(childInst);
  const [state2] = useState('parent-2');
  return `${state1} ${inner} ${state2}`;
});

render(parentInst);

/**
 * Test 7: React checks and throws
 */
console.log('\n---Test 7------');

const expectThrow = (testLabel, fun) => {
  try {
    fun();
    console.log(`[${testLabel}] No error.`);
  } catch (e) {
    console.log(`Error [${testLabel}]:\n${e.message}\n`);
  }
};

expectThrow('Hook call outside of component', () => {
  const [count] = useState(0);
});

function HandlerTest(props) {
  props.onClick = () => {
    const [count] = useState(0);
  };
  return 'Handler test.';
}

const handlerInst = createInstance(HandlerTest);
render(handlerInst);

expectThrow('Inside of a handler', () => {
  handlerInst.onClick();
});

function EarlyReturn(props) {
  const [count] = useState(10); // Index 0
  if (props.early) {
    return 'Early return.';
  }
  const [name] = useState('Petr'); // Index 1
  return `${name}: ${count}`;
}

const earlyReturnInst = createInstance(EarlyReturn);
render(earlyReturnInst);
expectThrow('Inside condition - fewer hooks', () => {
  render(earlyReturnInst, {early: true});
});

const earlyReturnInst2 = createInstance(EarlyReturn, {early: true});
render(earlyReturnInst2);
expectThrow('Inside condition - more hooks', () => {
  render(earlyReturnInst2, {early: false});
});

const useCustomHook = () => {
  const [count, setCount] = useState(0);
  const inc = () => setCount((prev) => prev + 1);
  return {count, inc};
};

function Custom(props) {
  const {count, inc} = useCustomHook();
  props.inc = inc;
  return `Custom count: ${count}`;
}

const customInst = createInstance(Custom);
expectThrow('Custom hook - allowed', () => {
  // No error thrown here
  render(customInst);
  customInst.props.inc();
  customInst.props.inc();
});
