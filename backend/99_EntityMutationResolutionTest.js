/*
=========================================
SHiCI
99_EntityMutationResolutionTest.js

Entity Mutation Resolution Engine
Version 1.0 Test

役割：
・38_EntityMutationResolutionEngine.jsが
  Entity MutationのSubjectを
  正しく解決できることを確認する

禁止：
・OpenAI APIを呼び出さない
・Spreadsheetを更新しない
・既存Entityを変更しない
・Snapshotを生成しない
=========================================
*/


/*
=========================================
Test Runner
=========================================
*/

/**
 * Entity Mutation Resolution Engine Ver.1.0の
 * 全単体テストを実行する。
 */
function EntityMutationResolutionTest_runAll() {

  const tests = [

    {
      name:
        "resolveByKnowledgeQuery",
      run:
        EntityMutationResolutionTest_resolveByKnowledgeQuery
    },

    {
      name:
        "resolveByExistingEntityId",
      run:
        EntityMutationResolutionTest_resolveByExistingEntityId
    },

    {
      name:
        "notFoundByQuery",
      run:
        EntityMutationResolutionTest_notFoundByQuery
    },

    {
      name:
        "originalMutationIsNotModified",
      run:
        EntityMutationResolutionTest_originalMutationIsNotModified
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
      "Entity Mutation Resolution Test Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  console.log(
    "[Entity Mutation Resolution Engine Ver.1.0 Test Passed]"
  );

}


/*
=========================================
正常系
=========================================
*/

/**
 * Entity QueryがKnowledge Resolutionで
 * 1件に確定した場合、
 * Entity IDがMutationへ設定されることを確認する。
 */
function EntityMutationResolutionTest_resolveByKnowledgeQuery() {

  const mutation =
    EntityMutationResolutionTest_createMutation(
      "ワンワン",
      null
    );


  const result =
    EntityMutationResolutionEngine_resolve(
      mutation
    );


  EntityMutationResolutionTest_assertEqual(
    result.status,
    "resolved",
    "status"
  );


  EntityMutationResolutionTest_assertNotNull(
    result.mutation,
    "mutation"
  );


  EntityMutationResolutionTest_assertEqual(
    result.mutation.subject.entityType,
    "product",
    "mutation.subject.entityType"
  );


  EntityMutationResolutionTest_assertTrue(
    typeof result.mutation.subject.entityId ===
      "string" &&
    result.mutation.subject.entityId.trim() !==
      "",
    "mutation.subject.entityId"
  );


  EntityMutationResolutionTest_assertEqual(
    result.mutation.subject.entityQuery,
    "ワンワン",
    "mutation.subject.entityQuery"
  );


  EntityMutationResolutionTest_assertEqual(
    result.resolution.method,
    "knowledge",
    "resolution.method"
  );


  EntityMutationResolutionTest_assertEqual(
    result.resolution.requiresUserSelection,
    false,
    "resolution.requiresUserSelection"
  );


  EntityMutationContract_validate(
    result.mutation
  );

}


/**
 * Entity IDが既に指定されている場合、
 * そのIDが実在確認されてresolvedになることを確認する。
 */
function EntityMutationResolutionTest_resolveByExistingEntityId() {

  /*
   * まず「ワンワン」から
   * 正式Entity IDを取得する。
   */
  const initialMutation =
    EntityMutationResolutionTest_createMutation(
      "ワンワン",
      null
    );


  const initialResult =
    EntityMutationResolutionEngine_resolve(
      initialMutation
    );


  EntityMutationResolutionTest_assertEqual(
    initialResult.status,
    "resolved",
    "initialResult.status"
  );


  const entityId =
    initialResult.mutation.subject.entityId;


  const mutation =
    EntityMutationResolutionTest_createMutation(
      "ワンワン",
      entityId
    );


  const result =
    EntityMutationResolutionEngine_resolve(
      mutation
    );


  EntityMutationResolutionTest_assertEqual(
    result.status,
    "resolved",
    "status"
  );


  EntityMutationResolutionTest_assertEqual(
    result.mutation.subject.entityId,
    entityId,
    "mutation.subject.entityId"
  );


  EntityMutationResolutionTest_assertEqual(
    result.resolution.method,
    "entity_id",
    "resolution.method"
  );


  EntityMutationResolutionTest_assertEqual(
    result.resolution.requiresUserSelection,
    false,
    "resolution.requiresUserSelection"
  );

}


/*
=========================================
候補なし
=========================================
*/

/**
 * 存在しないEntity Queryの場合、
 * not_foundが返ることを確認する。
 */
function EntityMutationResolutionTest_notFoundByQuery() {

  const mutation =
    EntityMutationResolutionTest_createMutation(
      "__SHiCI_TEST_UNKNOWN_PRODUCT__",
      null
    );


  const result =
    EntityMutationResolutionEngine_resolve(
      mutation
    );


  EntityMutationResolutionTest_assertEqual(
    result.status,
    "not_found",
    "status"
  );


  EntityMutationResolutionTest_assertEqual(
    result.mutation,
    null,
    "mutation"
  );


  EntityMutationResolutionTest_assertNotNull(
    result.unresolvedMutation,
    "unresolvedMutation"
  );


  EntityMutationResolutionTest_assertEqual(
    result.candidates.length,
    0,
    "candidates.length"
  );


  EntityMutationResolutionTest_assertEqual(
    result.resolution.method,
    "entity_query",
    "resolution.method"
  );


  EntityMutationResolutionTest_assertEqual(
    result.resolution.requiresUserSelection,
    false,
    "resolution.requiresUserSelection"
  );

}


/*
=========================================
副作用確認
=========================================
*/

/**
 * Engine実行によって
 * 元のMutationが変更されないことを確認する。
 */
function EntityMutationResolutionTest_originalMutationIsNotModified() {

  const mutation =
    EntityMutationResolutionTest_createMutation(
      "ワンワン",
      null
    );


  const originalJson =
    JSON.stringify(
      mutation
    );


  const result =
    EntityMutationResolutionEngine_resolve(
      mutation
    );


  EntityMutationResolutionTest_assertEqual(
    result.status,
    "resolved",
    "status"
  );


  EntityMutationResolutionTest_assertEqual(
    JSON.stringify(
      mutation
    ),
    originalJson,
    "original mutation"
  );


  EntityMutationResolutionTest_assertEqual(
    mutation.subject.entityId,
    null,
    "original mutation.subject.entityId"
  );


  EntityMutationResolutionTest_assertTrue(
    result.mutation !==
      mutation,
    "result.mutationは元のmutationと別Objectである必要があります。"
  );

}


/*
=========================================
Fixture
=========================================
*/

/**
 * 金型温度変更用のEntity Mutationを作成する。
 *
 * 必須構造の欠落を防ぐため、
 * EntityMutationContract_createEmpty()を基礎にする。
 *
 * @param {string} entityQuery
 * @param {string|null} entityId
 * @return {Object}
 */
function EntityMutationResolutionTest_createMutation(
  entityQuery,
  entityId
) {

  const mutation =
    EntityMutationContract_createEmpty();


  /*
  =========================================
  Mutation Type
  =========================================
  */

  mutation.mutationType =
    "change_state";


  /*
  =========================================
  Subject
  =========================================
  */

  mutation.subject.entityType =
    "product";

  mutation.subject.entityId =
    entityId;

  mutation.subject.entityQuery =
    entityQuery;


  /*
  =========================================
  State Change
  =========================================
  */

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


  /*
  =========================================
  Snapshot Change
  =========================================
  */

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


  /*
  =========================================
  Event
  =========================================
  */

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


  /*
  =========================================
  Reason
  =========================================
  */

  mutation.reason =
    "ワンワンの型温を61℃にして";


  /*
  =========================================
  Metadata
  =========================================
  */

  mutation.metadata.source =
    "understanding_result";


  /*
  =========================================
  Contract Validation
  =========================================
  */

  EntityMutationContract_validate(
    mutation
  );


  return mutation;

}


/*
=========================================
Assertion
=========================================
*/

function EntityMutationResolutionTest_assertEqual(
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


function EntityMutationResolutionTest_assertNotNull(
  value,
  label
) {

  if (
    value ===
      null ||
    value ===
      undefined
  ) {

    throw new Error(
      label +
      " must not be null."
    );

  }

}


function EntityMutationResolutionTest_assertTrue(
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


