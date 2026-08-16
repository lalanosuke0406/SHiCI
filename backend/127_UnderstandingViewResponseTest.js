/*
=========================================
SHiCI
127_UnderstandingViewResponseTest.js

Understanding View Response
Version 1.0 Test

役割：
・UnderstandingEngine_respondから
  View Specificationが
  Response Specificationへ渡されることを確認する
・UnderstandingEngine_handleから
  holding_conditionが
  最終Responseまで引き継がれることを確認する

禁止：
・OpenAI APIを呼び出さない
・Spreadsheetを更新しない
=========================================
*/


let UnderstandingViewResponseTest_originalSnapshotGetter =
  null;

let UnderstandingViewResponseTest_originalLLMGenerate =
  null;

let UnderstandingViewResponseTest_originalUnderstand =
  null;

let UnderstandingViewResponseTest_originalGetConversationState =
  null;

let UnderstandingViewResponseTest_originalSaveConversationState =
  null;

let UnderstandingViewResponseTest_originalResolveView =
  null;

let UnderstandingViewResponseTest_originalResolveEntityCandidates =
  null;


/*
=========================================
Test Runner
=========================================
*/

function UnderstandingViewResponseTest_runAll() {

  const tests = [

    {
      name:
        "holdingConditionIsPassedToResponseSpecification",
      run:
        UnderstandingViewResponseTest_holdingConditionIsPassedToResponseSpecification
    },

    {
      name:
        "holdingConditionFlowsThroughHandle",
      run:
        UnderstandingViewResponseTest_holdingConditionFlowsThroughHandle
    }

  ];


  const failures =
    [];


  tests.forEach(
    function(test) {

      try {

        UnderstandingViewResponseTest_setOverrides();

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

      } finally {

        UnderstandingViewResponseTest_clearOverrides();

      }

    }
  );


  if (
    failures.length >
      0
  ) {

    throw new Error(
      "Understanding View Response Test Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  console.log(
    "[Understanding View Response Ver.1.0 Test Passed]"
  );

}


/*
=========================================
respond直接経路
=========================================
*/

function UnderstandingViewResponseTest_holdingConditionIsPassedToResponseSpecification() {

  const entity = {

    entityType:
      "product",

    entityId:
      "P-000035"

  };


  const result =
    UnderstandingEngine_respond(
      "ワンワンの保圧は？",
      entity,
      "holding_condition"
    );


  UnderstandingViewResponseTest_assertEqual(
    result.context
      .viewSpecification
      .viewName,
    "holding_condition",
    "viewSpecification.viewName"
  );


  UnderstandingViewResponseTest_assertEqual(
    result.context
      .viewSpecification
      .stages[0]
      .pressure
      .value,
    31,
    "stage1.pressure.value"
  );


  UnderstandingViewResponseTest_assertEqual(
    result.context
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
handle統合経路
=========================================
*/

/**
 * UnderstandingEngine_handleから
 * holding_conditionがResponse Specificationまで
 * 引き継がれることを確認する。
 */
function UnderstandingViewResponseTest_holdingConditionFlowsThroughHandle() {

  const result =
    UnderstandingEngine_handle(
      "ワンワンの保圧は？",
      "SESSION_VIEW_TEST_001"
    );


  UnderstandingViewResponseTest_assertEqual(
    result.context
      .viewSpecification
      .viewName,
    "holding_condition",
    "viewSpecification.viewName"
  );


  UnderstandingViewResponseTest_assertEqual(
    result.context
      .viewSpecification
      .stages.length,
    1,
    "viewSpecification.stages.length"
  );


  UnderstandingViewResponseTest_assertEqual(
    result.context
      .viewSpecification
      .stages[0]
      .pressure
      .value,
    31,
    "stage1.pressure.value"
  );


  UnderstandingViewResponseTest_assertEqual(
    result.context
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
Override
=========================================
*/

function UnderstandingViewResponseTest_setOverrides() {

  /*
  =========================================
  元関数を保存
  =========================================
  */

  if (
    UnderstandingViewResponseTest_originalSnapshotGetter ===
      null
  ) {

    UnderstandingViewResponseTest_originalSnapshotGetter =
      SnapshotEngine_getProductSnapshot;

  }


  if (
    UnderstandingViewResponseTest_originalLLMGenerate ===
      null
  ) {

    UnderstandingViewResponseTest_originalLLMGenerate =
      LLMInterface_generate;

  }


  if (
    UnderstandingViewResponseTest_originalUnderstand ===
      null
  ) {

    UnderstandingViewResponseTest_originalUnderstand =
      UnderstandingEngine_understand;

  }


  if (
    UnderstandingViewResponseTest_originalGetConversationState ===
      null
  ) {

    UnderstandingViewResponseTest_originalGetConversationState =
      getConversationState;

  }


  if (
    UnderstandingViewResponseTest_originalSaveConversationState ===
      null
  ) {

    UnderstandingViewResponseTest_originalSaveConversationState =
      saveConversationState;

  }


  if (
    UnderstandingViewResponseTest_originalResolveView ===
      null
  ) {

    UnderstandingViewResponseTest_originalResolveView =
      resolveView;

  }


  if (
    UnderstandingViewResponseTest_originalResolveEntityCandidates ===
      null
  ) {

    UnderstandingViewResponseTest_originalResolveEntityCandidates =
      resolveEntityCandidates;

  }


  /*
  =========================================
  Snapshot Fake
  =========================================
  */

  SnapshotEngine_getProductSnapshot =
    function(productId) {

      UnderstandingViewResponseTest_assertEqual(
        productId,
        "P-000035",
        "snapshot productId"
      );


      return {

        status:
          "success",

        product: {

          "製品ID":
            "P-000035",

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

    };


  /*
  =========================================
  LLM Fake

  AI Contractをそのまま返す。
  OpenAI APIは呼ばない。
  =========================================
  */

  LLMInterface_generate =
    function(aiContract) {

      return JSON.parse(
        JSON.stringify(
          aiContract
        )
      );

    };


  /*
  =========================================
  Understanding Fake
  =========================================
  */

  UnderstandingEngine_understand =
    function(text) {

      const result =
        UnderstandingResultContract_create(
          text
        );


      result.communication.type =
        "none";

      result.intent.type =
        "question";

      result.knowledgeBoundary.type =
        "company_knowledge";

      result.conversation.action =
        "new";

      result.entity.query =
        "ワンワン";

      result.entity.entityTypeHint =
        "product";

      result.view.name =
        "holding_condition";

      result.resolution.required =
        true;

      result.change.field =
        null;

      result.change.operation =
        null;

      result.change.value =
        null;

      result.change.unit =
        null;

      result.missingFields =
        [];

      result.memory.decision =
        "none";


      return UnderstandingResultContract_validate(
        result
      );

    };


  /*
  =========================================
  Conversation State Fake
  =========================================
  */

  getConversationState =
    function(sessionId) {

      return {

        currentEntity:
          null,

        currentView:
          null,

        candidateEntities:
          []

      };

    };


  saveConversationState =
    function(
      sessionId,
      state
    ) {

      return state;

    };


  /*
  =========================================
  Legacy View Resolution Fake
  =========================================
  */

  resolveView =
    function(text) {

      return null;

    };


  /*
  =========================================
  Entity Resolution Fake
  =========================================
  */

  resolveEntityCandidates =
    function(query) {

      return [

        {
          entityType:
            "product",

          entityId:
            "P-000035"
        }

      ];

    };

}


/*
=========================================
Override解除
=========================================
*/

function UnderstandingViewResponseTest_clearOverrides() {

  if (
    UnderstandingViewResponseTest_originalSnapshotGetter !==
      null
  ) {

    SnapshotEngine_getProductSnapshot =
      UnderstandingViewResponseTest_originalSnapshotGetter;

    UnderstandingViewResponseTest_originalSnapshotGetter =
      null;

  }


  if (
    UnderstandingViewResponseTest_originalLLMGenerate !==
      null
  ) {

    LLMInterface_generate =
      UnderstandingViewResponseTest_originalLLMGenerate;

    UnderstandingViewResponseTest_originalLLMGenerate =
      null;

  }


  if (
    UnderstandingViewResponseTest_originalUnderstand !==
      null
  ) {

    UnderstandingEngine_understand =
      UnderstandingViewResponseTest_originalUnderstand;

    UnderstandingViewResponseTest_originalUnderstand =
      null;

  }


  if (
    UnderstandingViewResponseTest_originalGetConversationState !==
      null
  ) {

    getConversationState =
      UnderstandingViewResponseTest_originalGetConversationState;

    UnderstandingViewResponseTest_originalGetConversationState =
      null;

  }


  if (
    UnderstandingViewResponseTest_originalSaveConversationState !==
      null
  ) {

    saveConversationState =
      UnderstandingViewResponseTest_originalSaveConversationState;

    UnderstandingViewResponseTest_originalSaveConversationState =
      null;

  }


  if (
    UnderstandingViewResponseTest_originalResolveView !==
      null
  ) {

    resolveView =
      UnderstandingViewResponseTest_originalResolveView;

    UnderstandingViewResponseTest_originalResolveView =
      null;

  }


  if (
    UnderstandingViewResponseTest_originalResolveEntityCandidates !==
      null
  ) {

    resolveEntityCandidates =
      UnderstandingViewResponseTest_originalResolveEntityCandidates;

    UnderstandingViewResponseTest_originalResolveEntityCandidates =
      null;

  }

}


/*
=========================================
Assertion
=========================================
*/

function UnderstandingViewResponseTest_assertEqual(
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