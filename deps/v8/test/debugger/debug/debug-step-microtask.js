// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

Debug = debug.Debug
var exception = null;
var log = [];

function listener(event, exec_state, event_data, data) {
  try {
    if (event == Debug.DebugEvent.Break) {
      var line = exec_state.frame(0).sourceLineText();
      log.push(line);
      if (!/STOP/.test(line)) {
        exec_state.prepareStep(Debug.StepAction.StepIn);
      }
    }
  } catch (e) {
    exception = e;
  }
};

Debug.setListener(listener);

Promise.resolve().then(
function() {
  print(1);
}
).then(
function() {
  return 2;
}
).then(
function() {
  throw new Error();
}
).catch(
function() {
  print(3);
}  // STOP
);

setTimeout(function() {
  Debug.setListener(null);
  assertNull(exception);
  var expectation =
    ["debugger;","debugger;","  print(1);","}","  return 2;","  return 2;",
     "  throw new Error();","  print(3);","}  // STOP"];
  assertEquals(log, expectation);
});

debugger;
