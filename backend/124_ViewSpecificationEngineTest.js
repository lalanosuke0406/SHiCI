/*
=========================================
SHiCI
124_ViewSpecificationEngineTest.js

View Specification Engine
Version 1.0 Test

役割：
・View DefinitionとSnapshotから
  View Specification Resultを生成できることを確認する

禁止：
・Spreadsheetを更新しない
・OpenAI APIを呼び出さない
・表示文章を生成しない
=========================================
*/


function ViewSpecificationEngineTest_runAll() {

  const tests = [

    {
      name:
        "buildHoldingConditionSingleStage",
      run:
        ViewSpecificationEngineTest_buildHoldingConditionSingleStage
    },

    {
        name:
            "allEmptyReturnsEmpty",
        run:
            ViewSpecificationEngineTest_allEmptyReturnsEmpty
    },

    {
        name:
            "pressureOnlyKeepsStage",
        run:
            ViewSpecificationEngineTest_pressureOnlyKeepsStage
    },

    {
        name:
            "timeOnlyKeepsStage",
        run:
            ViewSpecificationEngineTest_timeOnlyKeepsStage
    },

    {
        name:
            "multipleStagesArePreserved",
        run:
            ViewSpecificationEngineTest_multipleStagesArePreserved
    }

  ];


  const failures =
    [];


  tests.forEach(
    function(test) {

      try {

        test.run();

        console.log(
          "[PASS] " +
          test.name
        );

      } catch (error) {

        failures.push({
          name:
            test.name,

          message:
            error &&
            error.message
              ? error.message
              : String(
                  error
                )
        });


        console.error(
          "[FAIL] " +
          test.name +
          ": " +
          (
            error &&
            error.stack
              ? error.stack
              : error
          )
        );

      }

    }
  );


  if (
    failures.length >
      0
  ) {

    throw new Error(
      "View Specification Engine Test Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  console.log(
    "[View Specification Engine Ver.1.0 Test Passed]"
  );

}


/*
=========================================
holding_condition
=========================================
*/

function ViewSpecificationEngineTest_buildHoldingConditionSingleStage() {

  const snapshot = {

    conditionDetail: {

      "保圧力:P1":
        31,

      "保圧時間:T1":
        2,

      "保圧力:P2":
        null,

      "保圧時間:T2":
        null,

      "保圧力:P3":
        null,

      "保圧時間:T3":
        null,

      "保圧力:P4":
        null,

      "保圧時間:T4":
        null

    }

  };


  const result =
    ViewSpecificationEngine_build(
      "holding_condition",
      snapshot
    );


  ViewSpecificationEngineTest_assertEqual(
    result.viewName,
    "holding_condition",
    "result.viewName"
  );


  ViewSpecificationEngineTest_assertEqual(
    result.label,
    "保圧条件",
    "result.label"
  );


  ViewSpecificationEngineTest_assertEqual(
    result.status,
    "ready",
    "result.status"
  );


  ViewSpecificationEngineTest_assertEqual(
    result.stages.length,
    1,
    "result.stages.length"
  );


  const stage1 =
    result.stages[0];


  ViewSpecificationEngineTest_assertEqual(
    stage1.stage,
    1,
    "stage1.stage"
  );


  ViewSpecificationEngineTest_assertEqual(
    stage1.pressure.field,
    "holding_pressure_p1",
    "stage1.pressure.field"
  );


  ViewSpecificationEngineTest_assertEqual(
    stage1.pressure.value,
    31,
    "stage1.pressure.value"
  );


  ViewSpecificationEngineTest_assertEqual(
    stage1.pressure.unit,
    "MPa",
    "stage1.pressure.unit"
  );


  ViewSpecificationEngineTest_assertEqual(
    stage1.pressure.registered,
    true,
    "stage1.pressure.registered"
  );


  ViewSpecificationEngineTest_assertEqual(
    stage1.time.field,
    "holding_time_t1",
    "stage1.time.field"
  );


  ViewSpecificationEngineTest_assertEqual(
    stage1.time.value,
    2,
    "stage1.time.value"
  );


  ViewSpecificationEngineTest_assertEqual(
    stage1.time.unit,
    "秒",
    "stage1.time.unit"
  );


  ViewSpecificationEngineTest_assertEqual(
    stage1.time.registered,
    true,
    "stage1.time.registered"
  );


  ViewSpecificationContract_validate(
    result
  );

}


/*
=========================================
Assertion
=========================================
*/

function ViewSpecificationEngineTest_assertEqual(
  actual,
  expected,
  label
) {

  if (
    actual !==
      expected
  ) {

    throw new Error(
      "[AssertEqual Failed] " +
      label +
      " expected=" +
      JSON.stringify(
        expected
      ) +
      " actual=" +
      JSON.stringify(
        actual
      )
    );

  }

}


function ViewSpecificationEngineTest_allEmptyReturnsEmpty() {

  const snapshot = {

    conditionDetail: {

      "保圧力:P1":
        null,

      "保圧時間:T1":
        null,

      "保圧力:P2":
        null,

      "保圧時間:T2":
        null,

      "保圧力:P3":
        null,

      "保圧時間:T3":
        null,

      "保圧力:P4":
        null,

      "保圧時間:T4":
        null

    }

  };


  const result =
    ViewSpecificationEngine_build(
      "holding_condition",
      snapshot
    );


  ViewSpecificationEngineTest_assertEqual(
    result.status,
    "empty",
    "result.status"
  );


  ViewSpecificationEngineTest_assertEqual(
    result.stages.length,
    0,
    "result.stages.length"
  );


  ViewSpecificationContract_validate(
    result
  );

}


function ViewSpecificationEngineTest_pressureOnlyKeepsStage() {

  const snapshot = {

    conditionDetail: {

      "保圧力:P1":
        31,

      "保圧時間:T1":
        null

    }

  };


  const result =
    ViewSpecificationEngine_build(
      "holding_condition",
      snapshot
    );


  ViewSpecificationEngineTest_assertEqual(
    result.status,
    "ready",
    "result.status"
  );


  ViewSpecificationEngineTest_assertEqual(
    result.stages.length,
    1,
    "result.stages.length"
  );


  const stage1 =
    result.stages[0];


  ViewSpecificationEngineTest_assertEqual(
    stage1.pressure.registered,
    true,
    "stage1.pressure.registered"
  );


  ViewSpecificationEngineTest_assertEqual(
    stage1.pressure.value,
    31,
    "stage1.pressure.value"
  );


  ViewSpecificationEngineTest_assertEqual(
    stage1.time.registered,
    false,
    "stage1.time.registered"
  );


  ViewSpecificationEngineTest_assertEqual(
    stage1.time.value,
    null,
    "stage1.time.value"
  );

}


function ViewSpecificationEngineTest_timeOnlyKeepsStage() {

  const snapshot = {

    conditionDetail: {

      "保圧力:P1":
        null,

      "保圧時間:T1":
        2

    }

  };


  const result =
    ViewSpecificationEngine_build(
      "holding_condition",
      snapshot
    );


  ViewSpecificationEngineTest_assertEqual(
    result.status,
    "ready",
    "result.status"
  );


  ViewSpecificationEngineTest_assertEqual(
    result.stages.length,
    1,
    "result.stages.length"
  );


  const stage1 =
    result.stages[0];


  ViewSpecificationEngineTest_assertEqual(
    stage1.pressure.registered,
    false,
    "stage1.pressure.registered"
  );


  ViewSpecificationEngineTest_assertEqual(
    stage1.pressure.value,
    null,
    "stage1.pressure.value"
  );


  ViewSpecificationEngineTest_assertEqual(
    stage1.time.registered,
    true,
    "stage1.time.registered"
  );


  ViewSpecificationEngineTest_assertEqual(
    stage1.time.value,
    2,
    "stage1.time.value"
  );

}


function ViewSpecificationEngineTest_multipleStagesArePreserved() {

  const snapshot = {

    conditionDetail: {

      "保圧力:P1":
        31,

      "保圧時間:T1":
        2,

      "保圧力:P2":
        25,

      "保圧時間:T2":
        3,

      "保圧力:P3":
        null,

      "保圧時間:T3":
        null,

      "保圧力:P4":
        10,

      "保圧時間:T4":
        1

    }

  };


  const result =
    ViewSpecificationEngine_build(
      "holding_condition",
      snapshot
    );


  ViewSpecificationEngineTest_assertEqual(
    result.status,
    "ready",
    "result.status"
  );


  ViewSpecificationEngineTest_assertEqual(
    result.stages.length,
    3,
    "result.stages.length"
  );


  ViewSpecificationEngineTest_assertEqual(
    result.stages[0].stage,
    1,
    "stages[0].stage"
  );


  ViewSpecificationEngineTest_assertEqual(
    result.stages[1].stage,
    2,
    "stages[1].stage"
  );


  ViewSpecificationEngineTest_assertEqual(
    result.stages[2].stage,
    4,
    "stages[2].stage"
  );

}