/*
=========================================
SHiCI
100_ChangePlanContractTest.js

Change Plan Contract
Version 1.0 Test

役割：
・39_ChangePlanContract.jsの生成構造を確認する
・正常なChange Planを検証する
・不正なChange Planを拒否することを確認する

禁止：
・Spreadsheetを更新しない
・Entityを検索しない
・Snapshotを取得しない
・OpenAI APIを呼び出さない
=========================================
*/


/*
=========================================
Test Runner
=========================================
*/

/**
 * Change Plan Contract Ver.1.0の
 * 全単体テストを実行する。
 */
function ChangePlanContractTest_runAll() {

  const tests = [

    {
      name:
        "createEmptyStructure",
      run:
        ChangePlanContractTest_createEmptyStructure
    },

    {
      name:
        "validReadyForConfirmation",
      run:
        ChangePlanContractTest_validReadyForConfirmation
    },

    {
      name:
        "readyWithoutChangesIsRejected",
      run:
        ChangePlanContractTest_readyWithoutChangesIsRejected
    },

    {
      name:
        "blockedWithoutReasonIsRejected",
      run:
        ChangePlanContractTest_blockedWithoutReasonIsRejected
    },

    {
      name:
        "unconfirmedExecutableIsRejected",
      run:
        ChangePlanContractTest_unconfirmedExecutableIsRejected
    },

    {
      name:
        "confirmedExecutableIsAccepted",
      run:
        ChangePlanContractTest_confirmedExecutableIsAccepted
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
              : String(error)

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
      "Change Plan Contract Test Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  console.log(
    "[Change Plan Contract Ver.1.0 Test Passed]"
  );

}


/*
=========================================
空構造
=========================================
*/

/**
 * createEmpty()が
 * 想定した初期構造を返すことを確認する。
 */
function ChangePlanContractTest_createEmptyStructure() {

  const changePlan =
    ChangePlanContract_createEmpty();


  ChangePlanContractTest_assertEqual(
    changePlan.schemaVersion,
    "1.0",
    "schemaVersion"
  );


  ChangePlanContractTest_assertEqual(
    changePlan.status,
    "draft",
    "status"
  );


  ChangePlanContractTest_assertEqual(
    changePlan.changePlanId,
    null,
    "changePlanId"
  );


  ChangePlanContractTest_assertEqual(
    changePlan.mutationId,
    null,
    "mutationId"
  );


  ChangePlanContractTest_assertTrue(
    Array.isArray(
      changePlan.changes
    ),
    "changesはArrayである必要があります。"
  );


  ChangePlanContractTest_assertEqual(
    changePlan.changes.length,
    0,
    "changes.length"
  );


  ChangePlanContractTest_assertEqual(
    changePlan.currentSnapshot,
    null,
    "currentSnapshot"
  );


  ChangePlanContractTest_assertEqual(
    changePlan.proposedSnapshot,
    null,
    "proposedSnapshot"
  );


  ChangePlanContractTest_assertEqual(
    changePlan.confirmation.required,
    true,
    "confirmation.required"
  );


  ChangePlanContractTest_assertEqual(
    changePlan.confirmation.status,
    "pending",
    "confirmation.status"
  );


  ChangePlanContractTest_assertEqual(
    changePlan.executable,
    false,
    "executable"
  );

}


/*
=========================================
正常系
=========================================
*/

/**
 * 確認待ちの正常なChange Planが
 * Contractを通過することを確認する。
 */
function ChangePlanContractTest_validReadyForConfirmation() {

  const changePlan =
    ChangePlanContractTest_createReadyPlan();


  const validated =
    ChangePlanContract_validate(
      changePlan
    );


  ChangePlanContractTest_assertTrue(
    validated ===
      changePlan,
    "validateは同じChange Planを返す必要があります。"
  );

}


/**
 * 確認済みかつ実行可能なChange Planが
 * Contractを通過することを確認する。
 */
function ChangePlanContractTest_confirmedExecutableIsAccepted() {

  const changePlan =
    ChangePlanContractTest_createReadyPlan();


  changePlan.confirmation.status =
    "confirmed";

  changePlan.executable =
    true;


  ChangePlanContract_validate(
    changePlan
  );

}


/*
=========================================
異常系
=========================================
*/

/**
 * changesのないready_for_confirmationを
 * 拒否することを確認する。
 */
function ChangePlanContractTest_readyWithoutChangesIsRejected() {

  const changePlan =
    ChangePlanContractTest_createReadyPlan();


  changePlan.changes =
    [];


  ChangePlanContractTest_assertThrows(
    function() {

      ChangePlanContract_validate(
        changePlan
      );

    },
    "ready_for_confirmationのChange Planにはchangesが必要です。"
  );

}


/**
 * 未解決参照も不足情報もないblockedを
 * 拒否することを確認する。
 */
function ChangePlanContractTest_blockedWithoutReasonIsRejected() {

  const changePlan =
    ChangePlanContractTest_createReadyPlan();


  changePlan.status =
    "blocked";

  changePlan.currentSnapshot =
    null;

  changePlan.proposedSnapshot =
    null;

  changePlan.changes =
    [];

  changePlan.unresolvedReferences =
    [];

  changePlan.missingFields =
    [];

  changePlan.executable =
    false;


  ChangePlanContractTest_assertThrows(
    function() {

      ChangePlanContract_validate(
        changePlan
      );

    },
    "blockedのChange Planには未解決参照または不足情報が必要です。"
  );

}


/**
 * 未確認のままexecutable=trueにした場合、
 * 拒否されることを確認する。
 */
function ChangePlanContractTest_unconfirmedExecutableIsRejected() {

  const changePlan =
    ChangePlanContractTest_createReadyPlan();


  changePlan.confirmation.status =
    "pending";

  changePlan.executable =
    true;


  ChangePlanContractTest_assertThrows(
    function() {

      ChangePlanContract_validate(
        changePlan
      );

    },
    "確認されていないChange Planはexecutableにできません。"
  );

}


/*
=========================================
Fixture
=========================================
*/

/**
 * 正常なready_for_confirmationの
 * Change Planを作成する。
 *
 * @return {Object}
 */
function ChangePlanContractTest_createReadyPlan() {

  const changePlan =
    ChangePlanContract_createEmpty();


  changePlan.changePlanId =
    "CHANGE_PLAN_TEST_001";

  changePlan.mutationId =
    "MUTATION_TEST_001";

  changePlan.status =
    "ready_for_confirmation";


  changePlan.subject = {

    entityType:
      "product",

    entityId:
      "PRODUCT_TEST_001",

    displayName:
      "LEVER, CLAMP"

  };


  changePlan.currentEntity = {

    entityType:
      "product",

    entityId:
      "PRODUCT_TEST_001",

    displayName:
      "LEVER, CLAMP",

    drawingNumber:
      "KLW-M374C-000"

  };


  changePlan.changes.push({

    changeType:
      "state",

    path:
      "standard_condition.mold_temperature",

    before:
      60,

    after:
      61,

    unit:
      "celsius",

    preservationPolicy:
      "create_new_version"

  });


  changePlan.currentSnapshot = {

    snapshotId:
      "CONDITION_TEST_001",

    moldTemperature:
      60

  };


  changePlan.proposedSnapshot = {

    snapshotId:
      null,

    moldTemperature:
      61

  };


  changePlan.snapshotPlan = {

    snapshotType:
      "condition",

    currentSnapshotId:
      "CONDITION_TEST_001",

    proposedSnapshotId:
      null,

    preservationPolicy:
      "create_new_version",

    preservesCurrentSnapshot:
      true,

    establishesAsCurrent:
      true

  };


  changePlan.events.push({

    eventType:
      "condition_change_requested",

    occurredAt:
      null,

    details: {

      field:
        "mold_temperature",

      before:
        60,

      after:
        61,

      unit:
        "celsius"

    }

  });


  changePlan.reason =
    "ワンワンの型温を61℃にして";


  changePlan.confirmation = {

    required:
      true,

    status:
      "pending"

  };


  changePlan.executable =
    false;


  changePlan.metadata = {

    source:
      "entity_mutation",

    requestedBy:
      "USER_TEST_001",

    requestedAt:
      "2026-07-31T16:35:00+09:00",

    generatedAt:
      "2026-07-31T16:35:01+09:00"

  };


  return changePlan;

}


/*
=========================================
Assertion
=========================================
*/

function ChangePlanContractTest_assertEqual(
  actual,
  expected,
  label
) {

  if (
    actual !==
      expected
  ) {

    throw new Error(
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


function ChangePlanContractTest_assertTrue(
  condition,
  label
) {

  if (
    condition !==
      true
  ) {

    throw new Error(
      label
    );

  }

}


function ChangePlanContractTest_assertThrows(
  callback,
  expectedMessage
) {

  let thrownError =
    null;


  try {

    callback();

  } catch (error) {

    thrownError =
      error;

  }


  if (
    thrownError ===
      null
  ) {

    throw new Error(
      "例外が発生する必要があります。expected=" +
      JSON.stringify(
        expectedMessage
      )
    );

  }


  const actualMessage =
    thrownError &&
    thrownError.message
      ? thrownError.message
      : String(
          thrownError
        );


  if (
    actualMessage.indexOf(
      expectedMessage
    ) ===
      -1
  ) {

    throw new Error(
      "例外メッセージが一致しません。expected=" +
      JSON.stringify(
        expectedMessage
      ) +
      " actual=" +
      JSON.stringify(
        actualMessage
      )
    );

  }

}



