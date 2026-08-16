/*
=========================================
SHiCI
125_ViewSpecificationFlowTest.js

View Specification Flow
Version 1.0 Test

役割：
・Understanding ResultのCanonical Viewと
  SnapshotからView Specification Resultを
  生成できることを確認する

禁止：
・OpenAI APIを呼び出さない
・Spreadsheetを更新しない
・表示文章を生成しない
=========================================
*/


function ViewSpecificationFlowTest_runAll() {

  const tests = [

    {
      name:
        "holdingConditionFromUnderstandingResult",
      run:
        ViewSpecificationFlowTest_holdingConditionFromUnderstandingResult
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
      "View Specification Flow Test Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  console.log(
    "[View Specification Flow Ver.1.0 Test Passed]"
  );

}


/*
=========================================
holding_condition
=========================================
*/

function ViewSpecificationFlowTest_holdingConditionFromUnderstandingResult() {

  const understandingResult =
    UnderstandingResultContract_create(
      "ワンワンの保圧は？"
    );


  understandingResult.communication.type =
    "none";

  understandingResult.intent.type =
    "question";

  understandingResult.knowledgeBoundary.type =
    "company_knowledge";

  understandingResult.conversation.action =
    "new";

  understandingResult.entity.query =
    "ワンワン";

  understandingResult.entity.entityTypeHint =
    "product";

  understandingResult.view.name =
    "holding_condition";

  understandingResult.resolution.required =
    true;

  understandingResult.change.field =
    null;

  understandingResult.change.operation =
    null;

  understandingResult.change.value =
    null;

  understandingResult.change.unit =
    null;

  understandingResult.missingFields =
    [];

  understandingResult.memory.decision =
    "none";


  UnderstandingResultContract_validate(
    understandingResult
  );


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


  const viewSpecification =
    ViewSpecificationEngine_build(
      understandingResult.view.name,
      snapshot
    );


  ViewSpecificationFlowTest_assertEqual(
    viewSpecification.viewName,
    "holding_condition",
    "viewSpecification.viewName"
  );


  ViewSpecificationFlowTest_assertEqual(
    viewSpecification.status,
    "ready",
    "viewSpecification.status"
  );


  ViewSpecificationFlowTest_assertEqual(
    viewSpecification.stages.length,
    1,
    "viewSpecification.stages.length"
  );


  ViewSpecificationFlowTest_assertEqual(
    viewSpecification
      .stages[0]
      .pressure
      .value,
    31,
    "stage1.pressure.value"
  );


  ViewSpecificationFlowTest_assertEqual(
    viewSpecification
      .stages[0]
      .time
      .value,
    2,
    "stage1.time.value"
  );


  ViewSpecificationContract_validate(
    viewSpecification
  );

}


/*
=========================================
Assertion
=========================================
*/

function ViewSpecificationFlowTest_assertEqual(
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