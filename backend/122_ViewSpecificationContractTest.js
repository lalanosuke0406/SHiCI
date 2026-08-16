/*
=========================================
SHiCI
122_ViewSpecificationContractTest.js

View Specification Contract
Version 1.0 Test

役割：
・View Specification Resultの
  基本構造を確認する
・View Specification層のContractを
  独立して検証する

禁止：
・Spreadsheetを更新しない
・Snapshotを取得しない
・OpenAI APIを呼び出さない
・表示文章を生成しない
=========================================
*/


/*
=========================================
Test Runner
=========================================
*/

/**
 * View Specification Contract
 * Ver.1.0の全単体テストを実行する。
 */
function ViewSpecificationContractTest_runAll() {

  const tests = [

    {
      name:
        "createEmptyStructure",
      run:
        ViewSpecificationContractTest_createEmptyStructure
    },

    {
        name:
            "validResultPassesValidation",
        run:
            ViewSpecificationContractTest_validResultPassesValidation
    },

    {
        name:
            "invalidStatusIsRejected",
        run:
            ViewSpecificationContractTest_invalidStatusIsRejected
    },

    {
        name:
            "readyRequiresViewNameAndLabel",
        run:
            ViewSpecificationContractTest_readyRequiresViewNameAndLabel
    },

    {
        name:
            "emptyRequiresEmptyStages",
        run:
            ViewSpecificationContractTest_emptyRequiresEmptyStages
    },

    {
        name:
            "readyRequiresStages",
        run:
            ViewSpecificationContractTest_readyRequiresStages
    },

    {
        name:
            "stageRequiresPressureAndTime",
        run:
            ViewSpecificationContractTest_stageRequiresPressureAndTime
    },

    {
        name:
            "stageMemberRequiresStructure",
        run:
            ViewSpecificationContractTest_stageMemberRequiresStructure
    },

    {
        name:
            "registeredMustBeBoolean",
        run:
            ViewSpecificationContractTest_registeredMustBeBoolean
    },

    {
        name:
            "registeredTrueRequiresValue",
        run:
            ViewSpecificationContractTest_registeredTrueRequiresValue
    },

    {
        name:
            "registeredFalseRequiresEmptyValue",
        run:
            ViewSpecificationContractTest_registeredFalseRequiresEmptyValue
    },

    {
        name:
            "zeroIsValidRegisteredValue",
        run:
            ViewSpecificationContractTest_zeroIsValidRegisteredValue
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
      "View Specification Contract Test Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  console.log(
    "[View Specification Contract Ver.1.0 Test Passed]"
  );

}


/*
=========================================
空構造
=========================================
*/

/**
 * createEmpty()が
 * View Specification Resultの
 * 最小構造を返すことを確認する。
 */
function ViewSpecificationContractTest_createEmptyStructure() {

  const result =
    ViewSpecificationContract_createEmpty();


  ViewSpecificationContractTest_assertEqual(
    result.schemaVersion,
    "1.0",
    "schemaVersion"
  );


  ViewSpecificationContractTest_assertEqual(
    result.resultType,
    "view_specification_result",
    "resultType"
  );


  ViewSpecificationContractTest_assertEqual(
    result.viewName,
    null,
    "viewName"
  );


  ViewSpecificationContractTest_assertEqual(
    result.label,
    null,
    "label"
  );


  ViewSpecificationContractTest_assertEqual(
    result.status,
    "draft",
    "status"
  );


  ViewSpecificationContractTest_assertTrue(
    Array.isArray(
      result.stages
    ),
    "stagesはArrayである必要があります。"
  );


  ViewSpecificationContractTest_assertEqual(
    result.stages.length,
    0,
    "stages.length"
  );

}


/*
=========================================
Assertion
=========================================
*/

function ViewSpecificationContractTest_assertEqual(
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


function ViewSpecificationContractTest_assertTrue(
  condition,
  message
) {

  if (
    condition !==
      true
  ) {

    throw new Error(
      "[AssertTrue Failed] " +
      message
    );

  }

}





/**
 * 正常なView Specification Resultが
 * Contract検証を通過することを確認する。
 */
function ViewSpecificationContractTest_validResultPassesValidation() {

  const result =
    ViewSpecificationContract_createEmpty();

  result.viewName =
    "holding_condition";

  result.label =
    "保圧条件";

  result.status =
    "empty";


  const validated =
    ViewSpecificationContract_validate(
      result
    );


  ViewSpecificationContractTest_assertEqual(
    validated.viewName,
    "holding_condition",
    "viewName"
  );


  ViewSpecificationContractTest_assertEqual(
    validated.status,
    "empty",
    "status"
  );

}


/**
 * 未定義statusを拒否することを確認する。
 */
function ViewSpecificationContractTest_invalidStatusIsRejected() {

  const result =
    ViewSpecificationContract_createEmpty();

  result.viewName =
    "holding_condition";

  result.label =
    "保圧条件";

  result.status =
    "unknown_status";


  let thrownError =
    null;


  try {

    ViewSpecificationContract_validate(
      result
    );

  } catch (error) {

    thrownError =
      error;

  }


  ViewSpecificationContractTest_assertTrue(
    thrownError !==
      null,
    "不正なstatusは拒否される必要があります。"
  );

  ViewSpecificationContractTest_assertTrue(
    String(
        thrownError.message || ""
    ).indexOf(
        "status"
    ) !==
        -1,
    "statusを理由に拒否される必要があります。"
  );

}



/**
 * ready状態では
 * viewNameとlabelが必要であることを確認する。
 */
function ViewSpecificationContractTest_readyRequiresViewNameAndLabel() {

  const result =
    ViewSpecificationContract_createEmpty();

  result.status =
    "ready";

  result.viewName =
    null;

  result.label =
    null;


  let thrownError =
    null;


  try {

    ViewSpecificationContract_validate(
      result
    );

  } catch (error) {

    thrownError =
      error;

  }


  ViewSpecificationContractTest_assertTrue(
    thrownError !==
      null,
    "readyではviewNameとlabelが必要です。"
  );


  ViewSpecificationContractTest_assertTrue(
    String(
      thrownError.message || ""
    ).indexOf(
      "viewName"
    ) !==
      -1,
    "viewNameを理由に拒否される必要があります。"
  );

}


/**
 * empty状態では
 * stagesが空である必要があることを確認する。
 */
function ViewSpecificationContractTest_emptyRequiresEmptyStages() {

  const result =
    ViewSpecificationContract_createEmpty();

  result.viewName =
    "holding_condition";

  result.label =
    "保圧条件";

  result.status =
    "empty";

  result.stages = [
    {
      stage:
        1
    }
  ];


  let thrownError =
    null;


  try {

    ViewSpecificationContract_validate(
      result
    );

  } catch (error) {

    thrownError =
      error;

  }


  ViewSpecificationContractTest_assertTrue(
    thrownError !==
      null,
    "emptyではstagesが空である必要があります。"
  );


  ViewSpecificationContractTest_assertTrue(
    String(
      thrownError.message || ""
    ).indexOf(
      "stages"
    ) !==
      -1,
    "stagesを理由に拒否される必要があります。"
  );

}


/**
 * ready状態では
 * 少なくとも1つのStageが必要であることを確認する。
 */
function ViewSpecificationContractTest_readyRequiresStages() {

  const result =
    ViewSpecificationContract_createEmpty();

  result.viewName =
    "holding_condition";

  result.label =
    "保圧条件";

  result.status =
    "ready";

  result.stages =
    [];


  let thrownError =
    null;


  try {

    ViewSpecificationContract_validate(
      result
    );

  } catch (error) {

    thrownError =
      error;

  }


  ViewSpecificationContractTest_assertTrue(
    thrownError !==
      null,
    "readyではstagesが必要です。"
  );


  ViewSpecificationContractTest_assertTrue(
    String(
      thrownError.message || ""
    ).indexOf(
      "stages"
    ) !==
      -1,
    "stagesを理由に拒否される必要があります。"
  );

}


/**
 * Stageにはpressureとtimeが
 * 必要であることを確認する。
 */
function ViewSpecificationContractTest_stageRequiresPressureAndTime() {

  const result =
    ViewSpecificationContract_createEmpty();

  result.viewName =
    "holding_condition";

  result.label =
    "保圧条件";

  result.status =
    "ready";

  result.stages = [

    {
      stage:
        1
    }

  ];


  let thrownError =
    null;


  try {

    ViewSpecificationContract_validate(
      result
    );

  } catch (error) {

    thrownError =
      error;

  }


  ViewSpecificationContractTest_assertTrue(
    thrownError !==
      null,
    "Stageにはpressureとtimeが必要です。"
  );


  ViewSpecificationContractTest_assertTrue(
    String(
      thrownError.message || ""
    ).indexOf(
      "pressure"
    ) !==
      -1,
    "pressureを理由に拒否される必要があります。"
  );

}


/**
 * pressure/timeには
 * field・label・value・unit・registeredが
 * 必要であることを確認する。
 */
function ViewSpecificationContractTest_stageMemberRequiresStructure() {

  const result =
    ViewSpecificationContract_createEmpty();

  result.viewName =
    "holding_condition";

  result.label =
    "保圧条件";

  result.status =
    "ready";

  result.stages = [

    {
      stage:
        1,

      pressure: {
        field:
          null,

        label:
          "P1",

        value:
          31,

        unit:
          "MPa",

        registered:
          true
      },

      time: {
        field:
          "holding_time_t1",

        label:
          "T1",

        value:
          2,

        unit:
          "秒",

        registered:
          true
      }
    }

  ];


  let thrownError =
    null;


  try {

    ViewSpecificationContract_validate(
      result
    );

  } catch (error) {

    thrownError =
      error;

  }


  ViewSpecificationContractTest_assertTrue(
    thrownError !==
      null,
    "pressure.fieldが不正な場合は拒否される必要があります。"
  );


  ViewSpecificationContractTest_assertTrue(
    String(
      thrownError.message || ""
    ).indexOf(
      "field"
    ) !==
      -1,
    "fieldを理由に拒否される必要があります。"
  );

}


/**
 * registeredはbooleanであることを確認する。
 */
function ViewSpecificationContractTest_registeredMustBeBoolean() {

  const result =
    ViewSpecificationContract_createEmpty();

  result.viewName =
    "holding_condition";

  result.label =
    "保圧条件";

  result.status =
    "ready";

  result.stages = [

    {
      stage:
        1,

      pressure: {
        field:
          "holding_pressure_p1",

        label:
          "P1",

        value:
          31,

        unit:
          "MPa",

        registered:
          "true"
      },

      time: {
        field:
          "holding_time_t1",

        label:
          "T1",

        value:
          2,

        unit:
          "秒",

        registered:
          true
      }
    }

  ];


  let thrownError =
    null;


  try {

    ViewSpecificationContract_validate(
      result
    );

  } catch (error) {

    thrownError =
      error;

  }


  ViewSpecificationContractTest_assertTrue(
    thrownError !==
      null,
    "registeredはbooleanである必要があります。"
  );


  ViewSpecificationContractTest_assertTrue(
    String(
      thrownError.message || ""
    ).indexOf(
      "registered"
    ) !==
      -1,
    "registeredを理由に拒否される必要があります。"
  );

}


/**
 * registered=trueでは
 * valueが登録されている必要があることを確認する。
 */
function ViewSpecificationContractTest_registeredTrueRequiresValue() {

  const result =
    ViewSpecificationContract_createEmpty();

  result.viewName =
    "holding_condition";

  result.label =
    "保圧条件";

  result.status =
    "ready";

  result.stages = [

    {
      stage:
        1,

      pressure: {
        field:
          "holding_pressure_p1",

        label:
          "P1",

        value:
          null,

        unit:
          "MPa",

        registered:
          true
      },

      time: {
        field:
          "holding_time_t1",

        label:
          "T1",

        value:
          2,

        unit:
          "秒",

        registered:
          true
      }
    }

  ];


  let thrownError =
    null;


  try {

    ViewSpecificationContract_validate(
      result
    );

  } catch (error) {

    thrownError =
      error;

  }


  ViewSpecificationContractTest_assertTrue(
    thrownError !==
      null,
    "registered=trueではvalueが必要です。"
  );


  ViewSpecificationContractTest_assertTrue(
    String(
      thrownError.message || ""
    ).indexOf(
      "value"
    ) !==
      -1,
    "valueを理由に拒否される必要があります。"
  );

}


/**
 * registered=falseでは
 * valueが未登録である必要があることを確認する。
 */
function ViewSpecificationContractTest_registeredFalseRequiresEmptyValue() {

  const result =
    ViewSpecificationContract_createEmpty();

  result.viewName =
    "holding_condition";

  result.label =
    "保圧条件";

  result.status =
    "ready";

  result.stages = [

    {
      stage:
        1,

      pressure: {
        field:
          "holding_pressure_p1",

        label:
          "P1",

        value:
          31,

        unit:
          "MPa",

        registered:
          false
      },

      time: {
        field:
          "holding_time_t1",

        label:
          "T1",

        value:
          2,

        unit:
          "秒",

        registered:
          true
      }
    }

  ];


  let thrownError =
    null;


  try {

    ViewSpecificationContract_validate(
      result
    );

  } catch (error) {

    thrownError =
      error;

  }


  ViewSpecificationContractTest_assertTrue(
    thrownError !==
      null,
    "registered=falseではvalueは未登録である必要があります。"
  );


  ViewSpecificationContractTest_assertTrue(
    String(
      thrownError.message || ""
    ).indexOf(
      "value"
    ) !==
      -1,
    "valueを理由に拒否される必要があります。"
  );

}


/**
 * value=0は
 * registered=trueの有効値として扱われることを確認する。
 */
function ViewSpecificationContractTest_zeroIsValidRegisteredValue() {

  const result =
    ViewSpecificationContract_createEmpty();

  result.viewName =
    "holding_condition";

  result.label =
    "保圧条件";

  result.status =
    "ready";

  result.stages = [

    {
      stage:
        1,

      pressure: {
        field:
          "holding_pressure_p1",

        label:
          "P1",

        value:
          0,

        unit:
          "MPa",

        registered:
          true
      },

      time: {
        field:
          "holding_time_t1",

        label:
          "T1",

        value:
          null,

        unit:
          "秒",

        registered:
          false
      }
    }

  ];


  const validated =
    ViewSpecificationContract_validate(
      result
    );


  ViewSpecificationContractTest_assertEqual(
    validated.stages[0]
      .pressure
      .value,
    0,
    "pressure.value"
  );


  ViewSpecificationContractTest_assertEqual(
    validated.stages[0]
      .pressure
      .registered,
    true,
    "pressure.registered"
  );

}