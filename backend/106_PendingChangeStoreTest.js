/*
=========================================
SHiCI
106_PendingChangeStoreTest.js

Pending Change Store
Version 1.0 Integration Test

役割：
・実際のChange PlanとConfirmation Proposalを保存する
・保存したEntryを取得する
・proposalIdとchangePlanIdの照合を確認する
・保存時に原本を変更しないことを確認する
・削除後に取得できないことを確認する

対象：
・CacheService
・Script Cache
・product
・standard_condition.mold_temperature

禁止：
・Spreadsheetを更新しない
・Change Planを実行しない
・標準条件を切り替えない
・新しい条件IDを採番しない
・OpenAI APIを呼び出さない
=========================================
*/


/*
=========================================
Test Runner
=========================================
*/

function PendingChangeStoreTest_runAll() {

  const tests = [

    {
      name:
        "saveAndGetPendingChange",
      run:
        PendingChangeStoreTest_saveAndGetPendingChange
    },

    {
      name:
        "existsReturnsTrueAfterSave",
      run:
        PendingChangeStoreTest_existsReturnsTrueAfterSave
    },

    {
      name:
        "wrongChangePlanIdIsRejected",
      run:
        PendingChangeStoreTest_wrongChangePlanIdIsRejected
    },

    {
      name:
        "savedObjectsAreNotModified",
      run:
        PendingChangeStoreTest_savedObjectsAreNotModified
    },

    {
      name:
        "returnedEntryIsIndependentCopy",
      run:
        PendingChangeStoreTest_returnedEntryIsIndependentCopy
    },

    {
      name:
        "removePendingChange",
      run:
        PendingChangeStoreTest_removePendingChange
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
      "Pending Change Store Test Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  console.log(
    "[Pending Change Store Ver.1.0 Test Passed]"
  );

}


/*
=========================================
正常系
=========================================
*/

/**
 * 実際のChange PlanとProposalを保存し、
 * 同一内容を取得できることを確認する。
 */
function PendingChangeStoreTest_saveAndGetPendingChange() {

  const fixture =
    PendingChangeStoreTest_createFixture();


  const saveResult =
    PendingChangeStore_save(
      fixture.changePlan,
      fixture.proposal
    );


  try {

    PendingChangeStoreTest_assertEqual(
      saveResult.status,
      "stored",
      "saveResult.status"
    );


    PendingChangeStoreTest_assertEqual(
      saveResult.proposalId,
      fixture.proposal.proposalId,
      "saveResult.proposalId"
    );


    PendingChangeStoreTest_assertEqual(
      saveResult.changePlanId,
      fixture.changePlan.changePlanId,
      "saveResult.changePlanId"
    );


    PendingChangeStoreTest_assertNonEmptyString(
      saveResult.storedAt,
      "saveResult.storedAt"
    );


    PendingChangeStoreTest_assertNonEmptyString(
      saveResult.expiresAt,
      "saveResult.expiresAt"
    );


    const entry =
      PendingChangeStore_get(
        fixture.proposal.proposalId,
        fixture.changePlan.changePlanId
      );


    PendingChangeStoreTest_assertEqual(
      entry.schemaVersion,
      "1.0",
      "entry.schemaVersion"
    );


    PendingChangeStoreTest_assertEqual(
      entry.storeVersion,
      "1.0",
      "entry.storeVersion"
    );


    PendingChangeStoreTest_assertEqual(
      entry.status,
      "pending",
      "entry.status"
    );


    PendingChangeStoreTest_assertEqual(
      entry.proposalId,
      fixture.proposal.proposalId,
      "entry.proposalId"
    );


    PendingChangeStoreTest_assertEqual(
      entry.changePlanId,
      fixture.changePlan.changePlanId,
      "entry.changePlanId"
    );


    PendingChangeStoreTest_assertDeepEqual(
      entry.changePlan,
      fixture.changePlan,
      "entry.changePlan"
    );


    PendingChangeStoreTest_assertDeepEqual(
      entry.proposal,
      fixture.proposal,
      "entry.proposal"
    );

  } finally {

    PendingChangeStoreTest_cleanup(
      fixture
    );

  }

}


/**
 * 保存後にexistsがtrueになることを確認する。
 */
function PendingChangeStoreTest_existsReturnsTrueAfterSave() {

  const fixture =
    PendingChangeStoreTest_createFixture();


  PendingChangeStore_save(
    fixture.changePlan,
    fixture.proposal
  );


  try {

    const exists =
      PendingChangeStore_exists(
        fixture.proposal.proposalId
      );


    PendingChangeStoreTest_assertEqual(
      exists,
      true,
      "exists"
    );

  } finally {

    PendingChangeStoreTest_cleanup(
      fixture
    );

  }

}


/**
 * 異なるchangePlanIdでは
 * 取得できないことを確認する。
 */
function PendingChangeStoreTest_wrongChangePlanIdIsRejected() {

  const fixture =
    PendingChangeStoreTest_createFixture();


  PendingChangeStore_save(
    fixture.changePlan,
    fixture.proposal
  );


  try {

    PendingChangeStoreTest_assertThrows(
      function() {

        PendingChangeStore_get(
          fixture.proposal.proposalId,
          "CHANGE_PLAN_WRONG_ID"
        );

      },
      "changePlanIdが一致しません"
    );

  } finally {

    PendingChangeStoreTest_cleanup(
      fixture
    );

  }

}


/**
 * 保存処理によって元のChange PlanとProposalが
 * 変更されないことを確認する。
 */
function PendingChangeStoreTest_savedObjectsAreNotModified() {

  const fixture =
    PendingChangeStoreTest_createFixture();


  const originalChangePlanJson =
    JSON.stringify(
      fixture.changePlan
    );


  const originalProposalJson =
    JSON.stringify(
      fixture.proposal
    );


  PendingChangeStore_save(
    fixture.changePlan,
    fixture.proposal
  );


  try {

    PendingChangeStoreTest_assertEqual(
      JSON.stringify(
        fixture.changePlan
      ),
      originalChangePlanJson,
      "changePlan"
    );


    PendingChangeStoreTest_assertEqual(
      JSON.stringify(
        fixture.proposal
      ),
      originalProposalJson,
      "proposal"
    );

  } finally {

    PendingChangeStoreTest_cleanup(
      fixture
    );

  }

}


/**
 * 取得したEntryを変更しても、
 * Cache内の原本が変更されないことを確認する。
 */
function PendingChangeStoreTest_returnedEntryIsIndependentCopy() {

  const fixture =
    PendingChangeStoreTest_createFixture();


  PendingChangeStore_save(
    fixture.changePlan,
    fixture.proposal
  );


  try {

    const firstEntry =
      PendingChangeStore_get(
        fixture.proposal.proposalId,
        fixture.changePlan.changePlanId
      );


    firstEntry.changePlan.reason =
      "改変された理由";


    firstEntry.proposal.presentation.title =
      "改変されたタイトル";


    const secondEntry =
      PendingChangeStore_get(
        fixture.proposal.proposalId,
        fixture.changePlan.changePlanId
      );


    PendingChangeStoreTest_assertEqual(
      secondEntry.changePlan.reason,
      fixture.changePlan.reason,
      "secondEntry.changePlan.reason"
    );


    PendingChangeStoreTest_assertEqual(
      secondEntry.proposal.presentation.title,
      fixture.proposal.presentation.title,
      "secondEntry.proposal.presentation.title"
    );

  } finally {

    PendingChangeStoreTest_cleanup(
      fixture
    );

  }

}


/**
 * 保存済みEntryを削除し、
 * 以後取得できないことを確認する。
 */
function PendingChangeStoreTest_removePendingChange() {

  const fixture =
    PendingChangeStoreTest_createFixture();


  PendingChangeStore_save(
    fixture.changePlan,
    fixture.proposal
  );


  const removeResult =
    PendingChangeStore_remove(
      fixture.proposal.proposalId,
      fixture.changePlan.changePlanId
    );


  PendingChangeStoreTest_assertEqual(
    removeResult.status,
    "removed",
    "removeResult.status"
  );


  PendingChangeStoreTest_assertEqual(
    removeResult.proposalId,
    fixture.proposal.proposalId,
    "removeResult.proposalId"
  );


  PendingChangeStoreTest_assertEqual(
    removeResult.changePlanId,
    fixture.changePlan.changePlanId,
    "removeResult.changePlanId"
  );


  PendingChangeStoreTest_assertNonEmptyString(
    removeResult.removedAt,
    "removeResult.removedAt"
  );


  PendingChangeStoreTest_assertEqual(
    PendingChangeStore_exists(
      fixture.proposal.proposalId
    ),
    false,
    "exists after remove"
  );


  PendingChangeStoreTest_assertThrows(
    function() {

      PendingChangeStore_get(
        fixture.proposal.proposalId,
        fixture.changePlan.changePlanId
      );

    },
    "確認待ちデータが見つかりません"
  );

}


/*
=========================================
Integration Fixture
=========================================
*/

/**
 * 実際の処理経路から
 * Change PlanとProposalを生成する。
 *
 * @return {Object}
 */
function PendingChangeStoreTest_createFixture() {

  const mutation =
    EntityMutationContract_createEmpty();


  mutation.mutationId =
    "MUTATION_PENDING_STORE_TEST_" +
    Utilities
      .getUuid()
      .replace(
        /-/g,
        ""
      )
      .toUpperCase();


  mutation.mutationType =
    "change_state";


  mutation.subject.entityType =
    "product";

  mutation.subject.entityId =
    null;

  mutation.subject.entityQuery =
    "ワンワン";


  mutation.stateChanges.push({

    path:
      "standard_condition.mold_temperature",

    currentValue:
      null,

    proposedValue:
      61,

    unit:
      "celsius",

    preservationPolicy:
      "create_new_version"

  });


  mutation.snapshotChange = {

    snapshotType:
      "condition",

    currentSnapshotId:
      null,

    proposedSnapshotId:
      null,

    preservationPolicy:
      "create_new_version"

  };


  mutation.events.push({

    eventType:
      "condition_change_requested",

    occurredAt:
      null,

    details: {

      field:
        "mold_temperature",

      currentValue:
        null,

      proposedValue:
        61,

      unit:
        "celsius"

    }

  });


  mutation.reason =
    "ワンワンの型温を61℃にして";


  mutation.metadata.source =
    "understanding_result";

  mutation.metadata.requestedBy =
    "USER_TEST_001";

  mutation.metadata.requestedAt =
    new Date()
      .toISOString();


  EntityMutationContract_validate(
    mutation
  );


  const resolutionResult =
    EntityMutationResolutionEngine_resolve(
      mutation
    );


  PendingChangeStoreTest_assertEqual(
    resolutionResult.status,
    "resolved",
    "resolutionResult.status"
  );


  const changePlan =
    ChangePlanEngine_build(
      resolutionResult
    );


  const proposal =
    ConfirmationProposalEngine_build(
      changePlan
    );


  return {

    changePlan:
      changePlan,

    proposal:
      proposal

  };

}


/*
=========================================
Cleanup
=========================================
*/

/**
 * テスト終了後にCacheを削除する。
 *
 * 既に削除されている場合は何もしない。
 *
 * @param {Object} fixture
 */
function PendingChangeStoreTest_cleanup(
  fixture
) {

  if (
    !fixture ||
    !fixture.proposal ||
    typeof fixture.proposal.proposalId !==
      "string"
  ) {

    return;

  }


  const proposalId =
    fixture.proposal.proposalId;


  if (
    PendingChangeStore_exists(
      proposalId
    )
  ) {

    const key =
      PendingChangeStore_buildCacheKey(
        proposalId
      );


    PendingChangeStore_getCache()
      .remove(
        key
      );

  }

}


/*
=========================================
Assertion
=========================================
*/

function PendingChangeStoreTest_assertEqual(
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


function PendingChangeStoreTest_assertDeepEqual(
  actual,
  expected,
  label
) {

  const actualJson =
    JSON.stringify(
      actual
    );


  const expectedJson =
    JSON.stringify(
      expected
    );


  if (
    actualJson !==
      expectedJson
  ) {

    throw new Error(
      label +
      " expected=" +
      expectedJson +
      " actual=" +
      actualJson
    );

  }

}


function PendingChangeStoreTest_assertNonEmptyString(
  value,
  label
) {

  if (
    typeof value !==
      "string" ||
    value.trim() ===
      ""
  ) {

    throw new Error(
      label +
      "は空でないstringである必要があります。"
    );

  }

}


function PendingChangeStoreTest_assertThrows(
  callback,
  expectedMessagePart
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
        expectedMessagePart
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
      expectedMessagePart
    ) ===
      -1
  ) {

    throw new Error(
      "例外メッセージが一致しません。expectedPart=" +
      JSON.stringify(
        expectedMessagePart
      ) +
      " actual=" +
      JSON.stringify(
        actualMessage
      )
    );

  }

}


