import { runSaga, stdChannel, SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";

// OK to reuse this type across stores because the sagas run independently on
// their own channels, their puts and takes won't interfere with each other
const SET_STATE_TYPE = Symbol("setState");
export function setState(...args: any[]) {
  return put({ type: SET_STATE_TYPE, args });
}

export default function sagaMiddleware<T extends any>(
  saga: () => SagaIterator,
  config: (set: any, get: any, api: any) => T,
) {
  return (set: any, get: any, api: any) => {
    const channel = stdChannel();

    const dispatch = (output: any) => {
      if (output.type === SET_STATE_TYPE) {
        return set(...output.args);
      } else {
        channel.put(output);
      }
    };
    runSaga({channel, dispatch, getState: api.getState}, saga);

    const putActionToSaga = channel.put;
    return config(set, get, { ...api, putActionToSaga });
  };
}
