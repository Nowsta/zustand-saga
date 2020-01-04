import create from "zustand";
import { take, takeEvery, select, put } from "redux-saga/effects";

import sagaMiddleware, { setState } from "../src";

test("setState, select, storeApi", () => {
  const [ _, store ] = create(sagaMiddleware(saga, (set, get, api) => ({
    counter: 0,
    increment: (type) => api.putActionToSaga({type, by: 2}),
    api,
  })));

  function* incrementWithPartial({type, by}) {
    const counter = yield select(state => state.counter);
    yield setState({counter: counter + by});
  }
  function* incrementWithUpdater({type, by}) {
    yield setState(({counter}) => ({counter: counter + by}));
  }
  function* saga() {
    yield takeEvery("partial", incrementWithPartial);
    yield takeEvery("updater", incrementWithUpdater);
  }

  store.getState().increment("partial");
  store.getState().increment("updater");
  expect(store.getState().counter).toBe(4);
});

test("root sagas are independent per store (put, putActionToSaga, setState)", () => {
  const ACTION_TYPE = "ACTION_TYPE";

  const [ _1, store1 ] = create(sagaMiddleware(saga, (set, get, api) => ({
    private: "original",
  })));
  function* saga() {
    yield take(ACTION_TYPE);
    yield setState({private: "privateUpdate"});
  }

  const [ _2, store2 ] = create(sagaMiddleware(saga2, (set, get, api) => ({
    put: () => api.putActionToSaga({type: ACTION_TYPE}),
  })));
  function* saga2() {
    yield put({type: ACTION_TYPE});
    yield setState({private: "outside attempt"});
  }

  store2.getState().put();
  expect(store1.getState().private).toBe("original");
});
