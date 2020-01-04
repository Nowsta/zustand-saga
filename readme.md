Use as Zustand middleware and run a saga independent of Redux for a Zustand
store. From within the saga, yield the provided `setState` effect to update the
store or the normal Saga `select` effect to retrieve the store.

```js
import create from 'zustand';
import {takeEvery, select} from 'redux-saga/effects';
import sagaMiddleware, {setState} from 'zustand-saga';

const INCREMENT = 'INCREMENT';

const [useStore] = create(sagaMiddleware(saga, (set, get, store) => ({
  counter: 0,
  increment: amount => store.putActionToSaga({type: INCREMENT, amount}),
})));

function* increment({type, amount}) {
  const counter = yield select(state => state.counter);
  yield setState({counter: counter + amount});
  // or
  yield setState(({counter}) => ({counter: counter + amount}));
}

function* saga() {
  yield takeEvery(INCREMENT, increment);
}

function Component() {
  const increment = useStore(store => store.increment);
  useEffect(() => {
    increment(100);
  }, []);

  ...
}
```
