/*
=========================================
SHiCI
123_ViewSpecificationRegistryTest.js

View Specification Registry
Version 1.0 Test

役割：
・Canonical Viewから
  View Definitionを取得できることを確認する
・holding_conditionの
  Stage構造定義を検証する

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

function ViewSpecificationRegistryTest_runAll() {

  const tests = [

    {
      name:
        "findsHoldingCondition",
      run:
        ViewSpecificationRegistryTest_findsHoldingCondition
    },

    {
        name:
            "unknownViewReturnsNull",
        run:
            ViewSpecificationRegistryTest_unknownViewReturnsNull
    },

    {
        name:
            "requireRejectsUnknownView",
        run:
            ViewSpecificationRegistryTest_requireRejectsUnknownView
    },

    {
        name:
            "returnedDefinitionIsDeepCopy",
        run:
            ViewSpecificationRegistryTest_returnedDefinitionIsDeepCopy
    },

    {
        name:
            "allHoldingConditionFieldsAreRegistered",
        run:
            ViewSpecificationRegistryTest_allHoldingConditionFieldsAreRegistered
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
      "View Specification Registry Test Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  console.log(
    "[View Specification Registry Ver.1.0 Test Passed]"
  );

}


/*
=========================================
holding_condition
=========================================
*/

function ViewSpecificationRegistryTest_findsHoldingCondition() {

  const definition =
    ViewSpecificationRegistry_require(
      "holding_condition"
    );


  ViewSpecificationRegistryTest_assertEqual(
    definition.viewName,
    "holding_condition",
    "definition.viewName"
  );


  ViewSpecificationRegistryTest_assertEqual(
    definition.label,
    "保圧条件",
    "definition.label"
  );


  ViewSpecificationRegistryTest_assertTrue(
    Array.isArray(
      definition.stages
    ),
    "definition.stagesはArrayである必要があります。"
  );


  ViewSpecificationRegistryTest_assertEqual(
    definition.stages.length,
    4,
    "definition.stages.length"
  );


  const stage1 =
    definition.stages[0];


  ViewSpecificationRegistryTest_assertEqual(
    stage1.stage,
    1,
    "stage1.stage"
  );


  ViewSpecificationRegistryTest_assertEqual(
    stage1.pressureField,
    "holding_pressure_p1",
    "stage1.pressureField"
  );


  ViewSpecificationRegistryTest_assertEqual(
    stage1.timeField,
    "holding_time_t1",
    "stage1.timeField"
  );


  const stage4 =
    definition.stages[3];


  ViewSpecificationRegistryTest_assertEqual(
    stage4.stage,
    4,
    "stage4.stage"
  );


  ViewSpecificationRegistryTest_assertEqual(
    stage4.pressureField,
    "holding_pressure_p4",
    "stage4.pressureField"
  );


  ViewSpecificationRegistryTest_assertEqual(
    stage4.timeField,
    "holding_time_t4",
    "stage4.timeField"
  );

}


/*
=========================================
Assertion
=========================================
*/

function ViewSpecificationRegistryTest_assertEqual(
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


function ViewSpecificationRegistryTest_assertTrue(
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


function ViewSpecificationRegistryTest_unknownViewReturnsNull() {

  const definition =
    ViewSpecificationRegistry_find(
      "unknown_view"
    );


  ViewSpecificationRegistryTest_assertEqual(
    definition,
    null,
    "unknown definition"
  );

}


function ViewSpecificationRegistryTest_requireRejectsUnknownView() {

  let thrownError =
    null;


  try {

    ViewSpecificationRegistry_require(
      "unknown_view"
    );

  } catch (error) {

    thrownError =
      error;

  }


  ViewSpecificationRegistryTest_assertTrue(
    thrownError !==
      null,
    "未登録Viewは拒否される必要があります。"
  );


  ViewSpecificationRegistryTest_assertTrue(
    String(
      thrownError.message || ""
    ).indexOf(
      "viewName"
    ) !==
      -1,
    "viewNameを理由に拒否される必要があります。"
  );

}


function ViewSpecificationRegistryTest_returnedDefinitionIsDeepCopy() {

  const first =
    ViewSpecificationRegistry_require(
      "holding_condition"
    );


  first.label =
    "変更済み";

  first.stages[0].pressureField =
    "modified_field";


  const second =
    ViewSpecificationRegistry_require(
      "holding_condition"
    );


  ViewSpecificationRegistryTest_assertEqual(
    second.label,
    "保圧条件",
    "second.label"
  );


  ViewSpecificationRegistryTest_assertEqual(
    second.stages[0].pressureField,
    "holding_pressure_p1",
    "second.stages[0].pressureField"
  );

}


/**
 * holding_conditionが参照する
 * 全Canonical Fieldが
 * StandardConditionFieldRegistryに
 * 正式登録されていることを確認する。
 */
function ViewSpecificationRegistryTest_allHoldingConditionFieldsAreRegistered() {

  const definition =
    ViewSpecificationRegistry_require(
      "holding_condition"
    );


  const missingFields =
    [];


  definition.stages.forEach(
    function(stage) {

      const fields = [
        stage.pressureField,
        stage.timeField
      ];


      fields.forEach(
        function(field) {

          const fieldDefinition =
            StandardConditionFieldRegistry_find(
              field
            );


          if (
            fieldDefinition ===
              null
          ) {

            missingFields.push(
              field
            );

          }

        }
      );

    }
  );


  ViewSpecificationRegistryTest_assertEqual(
    JSON.stringify(
      missingFields
    ),
    JSON.stringify(
      []
    ),
    "missingFields"
  );

}