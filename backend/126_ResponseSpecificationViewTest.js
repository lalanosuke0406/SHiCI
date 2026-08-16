/*
=========================================
SHiCI
126_ResponseSpecificationViewTest.js

Response Specification View
Version 1.0 Test

役割：
・View Specification Resultを
  AI Contractへ組み込めることを確認する

禁止：
・OpenAI APIを呼び出さない
・Spreadsheetへアクセスしない
=========================================
*/


function ResponseSpecificationViewTest_runAll() {

  const tests = [

    {
      name:
        "includesHoldingConditionView",
      run:
        ResponseSpecificationViewTest_includesHoldingConditionView
    },

    {
        name:
            "holdingConditionUsesViewSpecificationOnly",
        run:
            ResponseSpecificationViewTest_holdingConditionUsesViewSpecificationOnly
    },

    {
        name:
            "legacyResponseKeepsKnowledge",
        run:
            ResponseSpecificationViewTest_legacyResponseKeepsKnowledge
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
      "Response Specification View Test Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  console.log(
    "[Response Specification View Ver.1.0 Test Passed]"
  );

}


function ResponseSpecificationViewTest_includesHoldingConditionView() {

  const snapshot = {

    status:
      "success",

    product: {
      "製品名":
        "LEVER, CLAMP"
    },

    material:
      {},

    machine:
      {},

    mold:
      {},

    condition:
      {},

    conditionDetail: {

      "保圧力:P1":
        31,

      "保圧時間:T1":
        2

    }

  };


  const viewSpecification =
    ViewSpecificationEngine_build(
      "holding_condition",
      snapshot
    );


  const contract =
    ResponseSpecification_build(
      "ワンワンの保圧は？",
      snapshot,
      viewSpecification
    );


  ResponseSpecificationViewTest_assertEqual(
    contract.context
      .viewSpecification
      .viewName,
    "holding_condition",
    "context.viewSpecification.viewName"
  );


  ResponseSpecificationViewTest_assertEqual(
    contract.context
      .viewSpecification
      .stages[0]
      .pressure
      .value,
    31,
    "stage1.pressure.value"
  );


  ResponseSpecificationViewTest_assertEqual(
    contract.context
      .viewSpecification
      .stages[0]
      .time
      .value,
    2,
    "stage1.time.value"
  );

}


/*
=========================================
Assertion
=========================================
*/

function ResponseSpecificationViewTest_assertEqual(
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



/**
 * holding_conditionがある場合、
 * conditionDetailをLLM Knowledgeへ
 * 重複して渡さないことを確認する。
 */
function ResponseSpecificationViewTest_holdingConditionUsesViewSpecificationOnly() {

  const snapshot = {

    status:
      "success",

    product: {
      "製品名":
        "LEVER, CLAMP"
    },

    material:
      {},

    machine:
      {},

    mold:
      {},

    condition:
      {},

    conditionDetail: {

      "保圧力:P1":
        210,

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


  const viewSpecification =
    ViewSpecificationEngine_build(
      "holding_condition",
      snapshot
    );


  const contract =
    ResponseSpecification_build(
      "ワンワンの保圧は？",
      snapshot,
      viewSpecification
    );


  ResponseSpecificationViewTest_assertEqual(
    contract.context
      .viewSpecification
      .viewName,
    "holding_condition",
    "context.viewSpecification.viewName"
  );


  ResponseSpecificationViewTest_assertEqual(
    contract.context
      .viewSpecification
      .stages[0]
      .pressure
      .value,
    210,
    "stage1.pressure.value"
  );


  ResponseSpecificationViewTest_assertEqual(
    contract.context
      .viewSpecification
      .stages[0]
      .time
      .registered,
    false,
    "stage1.time.registered"
  );


  ResponseSpecificationViewTest_assertEqual(
    contract.context
      .knowledge
      .conditionDetail,
    undefined,
    "context.knowledge.conditionDetail"
  );

}


/**
 * View Specificationを使わない既存経路では、
 * 従来どおりconditionDetailが
 * Knowledgeに残ることを確認する。
 */
function ResponseSpecificationViewTest_legacyResponseKeepsKnowledge() {

  const snapshot = {

    status:
      "success",

    product: {
      "製品名":
        "LEVER, CLAMP"
    },

    material:
      {},

    machine:
      {},

    mold:
      {},

    condition:
      {},

    conditionDetail: {

      "金型温度(℃)":
        60,

      "冷却時間":
        30

    }

  };


  const contract =
    ResponseSpecification_build(
      "ワンワンの型温は？",
      snapshot
    );


  ResponseSpecificationViewTest_assertEqual(
    contract.context
      .knowledge
      .conditionDetail
      ["金型温度(℃)"],
    60,
    "legacy conditionDetail mold temperature"
  );

}