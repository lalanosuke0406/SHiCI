/*
=========================================
SHiCI
97_EntityMutationContractTest.js

Entity Mutation Contract
Version 1.0 Test

役割：
・36_EntityMutationContract.jsの
  生成処理と検証処理を単体テストする

禁止：
・Spreadsheetを更新しない
・既存Entityを変更しない
・外部APIを呼び出さない
=========================================
*/


/*
=========================================
Test Runner
=========================================
*/

/**
 * Entity Mutation Contract Ver.1.0の
 * 全単体テストを実行する。
 */
function EntityMutationContractTest_runAll() {

  const tests = [

    {
      name:
        "createEmpty",
      run:
        EntityMutationContractTest_createEmpty
    },

    {
      name:
        "validCreateProduct",
      run:
        EntityMutationContractTest_validCreateProduct
    },

    {
      name:
        "validChangeIdentity",
      run:
        EntityMutationContractTest_validChangeIdentity
    },

    {
      name:
        "validChangeAttribute",
      run:
        EntityMutationContractTest_validChangeAttribute
    },

    {
      name:
        "validChangeRelation",
      run:
        EntityMutationContractTest_validChangeRelation
    },

    {
      name:
        "validUnresolvedRelation",
      run:
        EntityMutationContractTest_validUnresolvedRelation
    },

    {
      name:
        "validConditionStateChange",
      run:
        EntityMutationContractTest_validConditionStateChange
    },

    {
      name:
        "validAppendEvent",
      run:
        EntityMutationContractTest_validAppendEvent
    },

    {
      name:
        "invalidSchemaVersion",
      run:
        EntityMutationContractTest_invalidSchemaVersion
    },

    {
      name:
        "invalidCreateWithoutIdentity",
      run:
        EntityMutationContractTest_invalidCreateWithoutIdentity
    },

    {
      name:
        "invalidExistingSubjectWithoutReference",
      run:
        EntityMutationContractTest_invalidExistingSubjectWithoutReference
    },

    {
      name:
        "invalidTypeConsistency",
      run:
        EntityMutationContractTest_invalidTypeConsistency
    },

    {
      name:
        "invalidRelationReference",
      run:
        EntityMutationContractTest_invalidRelationReference
    },

    {
      name:
        "invalidPreservationPolicy",
      run:
        EntityMutationContractTest_invalidPreservationPolicy
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
      "Entity Mutation Contract Test Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  console.log(
    "[Entity Mutation Contract Ver.1.0 Test Passed]"
  );

}


/*
=========================================
正常系
=========================================
*/

/**
 * 空Mutationの初期構造を確認する。
 */
function EntityMutationContractTest_createEmpty() {

  const mutation =
    EntityMutationContract_createEmpty();


  EntityMutationContractTest_assertEqual(
    mutation.schemaVersion,
    "1.0",
    "schemaVersion"
  );

  EntityMutationContractTest_assertEqual(
    mutation.mutationType,
    null,
    "mutationType"
  );

  EntityMutationContractTest_assertEqual(
    mutation.subject.entityType,
    null,
    "subject.entityType"
  );

  EntityMutationContractTest_assertTrue(
    Array.isArray(
      mutation.identityChanges
    ),
    "identityChangesはArrayである必要があります。"
  );

  EntityMutationContractTest_assertTrue(
    Array.isArray(
      mutation.attributeChanges
    ),
    "attributeChangesはArrayである必要があります。"
  );

  EntityMutationContractTest_assertTrue(
    Array.isArray(
      mutation.relationChanges
    ),
    "relationChangesはArrayである必要があります。"
  );

  EntityMutationContractTest_assertTrue(
    Array.isArray(
      mutation.stateChanges
    ),
    "stateChangesはArrayである必要があります。"
  );

  EntityMutationContractTest_assertTrue(
    Array.isArray(
      mutation.events
    ),
    "eventsはArrayである必要があります。"
  );

  EntityMutationContractTest_assertEqual(
    mutation.confirmation.required,
    true,
    "confirmation.required"
  );

}


/**
 * Product Entity新規作成を検証する。
 */
function EntityMutationContractTest_validCreateProduct() {

  const mutation =
    EntityMutationContract_createEmpty();


  mutation.mutationType =
    "create_entity";

  mutation.subject.entityType =
    "product";

  mutation.subject.entityQuery =
    "GX-F12/H12 キョウツウボビン";


  mutation.identityChanges.push({

    path:
      "identity.productName",

    currentValue:
      null,

    proposedValue:
      "GX-F12/H12 キョウツウボビン",

    unit:
      null,

    preservationPolicy:
      "replace_current"

  });


  mutation.identityChanges.push({

    path:
      "identity.drawingNumber",

    currentValue:
      null,

    proposedValue:
      "5000-0005-88V",

    unit:
      null,

    preservationPolicy:
      "replace_current"

  });


  mutation.attributeChanges.push({

    path:
      "attribute.productWeight",

    currentValue:
      null,

    proposedValue:
      1.25,

    unit:
      "g",

    preservationPolicy:
      "replace_current"

  });


  const validated =
    EntityMutationContract_validate(
      mutation
    );


  EntityMutationContractTest_assertEqual(
    validated,
    mutation,
    "validateの戻り値"
  );

}


/**
 * Product Identity変更を検証する。
 */
function EntityMutationContractTest_validChangeIdentity() {

  const mutation =
    EntityMutationContract_createEmpty();


  mutation.mutationType =
    "change_identity";

  mutation.subject.entityType =
    "product";

  mutation.subject.entityId =
    "PRD-0001";

  mutation.subject.entityQuery =
    "ワンワン";


  mutation.identityChanges.push({

    path:
      "identity.productName",

    currentValue:
      "LEVER, CLAMP",

    proposedValue:
      "LEVER CLAMP",

    unit:
      null,

    preservationPolicy:
      "append_history"

  });


  EntityMutationContract_validate(
    mutation
  );

}


/**
 * Product Attribute変更を検証する。
 */
function EntityMutationContractTest_validChangeAttribute() {

  const mutation =
    EntityMutationContract_createEmpty();


  mutation.mutationType =
    "change_attribute";

  mutation.subject.entityType =
    "product";

  mutation.subject.entityId =
    "PRD-0001";


  mutation.attributeChanges.push({

    path:
      "attribute.productWeight",

    currentValue:
      2.8,

    proposedValue:
      2.9,

    unit:
      "g",

    preservationPolicy:
      "append_history"

  });


  EntityMutationContract_validate(
    mutation
  );

}


/**
 * Material Relation変更を検証する。
 */
function EntityMutationContractTest_validChangeRelation() {

  const mutation =
    EntityMutationContract_createEmpty();


  mutation.mutationType =
    "change_relation";

  mutation.subject.entityType =
    "product";

  mutation.subject.entityId =
    "PRD-0001";

  mutation.subject.entityQuery =
    "ワンワン";


  mutation.relationChanges.push({

    relationType:
      "uses_material",

    currentTarget: {

      entityType:
        "material",

      entityId:
        "MAT-0001",

      entityQuery:
        "ジュラコン M90-44 PL-T9054N"

    },

    proposedTarget: {

      entityType:
        "material",

      entityId:
        "MAT-0002",

      entityQuery:
        "ジュラコン M90-44 CF2001"

    },

    preservationPolicy:
      "close_and_create_relation"

  });


  EntityMutationContract_validate(
    mutation
  );

}


/**
 * Relation先が未解決でも、
 * Entity Queryと未解決参照があれば
 * Compose段階のMutationとして成立することを確認する。
 */
function EntityMutationContractTest_validUnresolvedRelation() {

  const mutation =
    EntityMutationContract_createEmpty();


  mutation.mutationType =
    "change_relation";

  mutation.subject.entityType =
    "product";

  mutation.subject.entityQuery =
    "ワンワン";


  mutation.relationChanges.push({

    relationType:
      "uses_material",

    currentTarget:
      null,

    proposedTarget: {

      entityType:
        "material",

      entityId:
        null,

      entityQuery:
        "ジュラコン M90-44 CF2001"

    },

    preservationPolicy:
      "close_and_create_relation"

  });


  mutation.unresolvedReferences.push({

    path:
      "relationChanges[0].proposedTarget",

    entityType:
      "material",

    entityQuery:
      "ジュラコン M90-44 CF2001"

  });


  EntityMutationContract_validate(
    mutation
  );

}


/**
 * 金型温度変更に相当する
 * Condition State変更を検証する。
 */
function EntityMutationContractTest_validConditionStateChange() {

  const mutation =
    EntityMutationContract_createEmpty();


  mutation.mutationType =
    "change_state";

  mutation.subject.entityType =
    "product";

  mutation.subject.entityId =
    "PRD-0001";

  mutation.subject.entityQuery =
    "ワンワン";


  mutation.stateChanges.push({

    path:
      "standard_condition.mold_temperature",

    currentValue:
      60,

    proposedValue:
      61,

    unit:
      "celsius",

    preservationPolicy:
      "create_new_version"

  });


  mutation.relationChanges.push({

    relationType:
      "current_standard_condition",

    currentTarget: {

      entityType:
        "condition",

      entityId:
        "COND-0001",

      entityQuery:
        "現在標準条件"

    },

    proposedTarget: {

      entityType:
        "condition",

      entityId:
        null,

      entityQuery:
        "新しい標準条件Version"

    },

    preservationPolicy:
      "close_and_create_relation"

  });


  mutation.snapshotChange = {

    snapshotType:
      "condition",

    currentSnapshotId:
      "COND-0001",

    proposedSnapshotId:
      null,

    preservationPolicy:
      "create_new_version"

  };


  mutation.events.push({

    eventType:
      "condition_changed",

    occurredAt:
      null,

    details: {

      field:
        "mold_temperature",

      previousValue:
        60,

      proposedValue:
        61,

      unit:
        "celsius"

    }

  });


  EntityMutationContract_validate(
    mutation
  );

}


/**
 * Event追加を検証する。
 */
function EntityMutationContractTest_validAppendEvent() {

  const mutation =
    EntityMutationContract_createEmpty();


  mutation.mutationType =
    "append_event";

  mutation.subject.entityType =
    "product";

  mutation.subject.entityId =
    "PRD-0001";


  mutation.events.push({

    eventType:
      "trouble_occurred",

    occurredAt:
      "2026-07-31T14:30:00+09:00",

    details: {

      description:
        "離型時に製品へ齧り傷が発生した。"

    }

  });


  EntityMutationContract_validate(
    mutation
  );

}


/*
=========================================
異常系
=========================================
*/

/**
 * Schema Version不一致を拒否する。
 */
function EntityMutationContractTest_invalidSchemaVersion() {

  const mutation =
    EntityMutationContractTest_createValidChangeAttributeMutation();


  mutation.schemaVersion =
    "0.9";


  EntityMutationContractTest_expectError(
    function() {

      EntityMutationContract_validate(
        mutation
      );

    },
    "schemaVersion"
  );

}


/**
 * Identityを持たないCreate Entityを拒否する。
 */
function EntityMutationContractTest_invalidCreateWithoutIdentity() {

  const mutation =
    EntityMutationContract_createEmpty();


  mutation.mutationType =
    "create_entity";

  mutation.subject.entityType =
    "product";

  mutation.subject.entityQuery =
    "新しい製品";


  EntityMutationContractTest_expectError(
    function() {

      EntityMutationContract_validate(
        mutation
      );

    },
    "identityChanges"
  );

}


/**
 * 既存Entityへの変更で、
 * entityIdもentityQueryもない場合を拒否する。
 */
function EntityMutationContractTest_invalidExistingSubjectWithoutReference() {

  const mutation =
    EntityMutationContractTest_createValidChangeAttributeMutation();


  mutation.subject.entityId =
    null;

  mutation.subject.entityQuery =
    null;


  EntityMutationContractTest_expectError(
    function() {

      EntityMutationContract_validate(
        mutation
      );

    },
    "entityIdまたはentityQuery"
  );

}


/**
 * mutationTypeとChange内容の不一致を拒否する。
 */
function EntityMutationContractTest_invalidTypeConsistency() {

  const mutation =
    EntityMutationContract_createEmpty();


  mutation.mutationType =
    "change_identity";

  mutation.subject.entityType =
    "product";

  mutation.subject.entityId =
    "PRD-0001";


  mutation.attributeChanges.push({

    path:
      "attribute.productWeight",

    currentValue:
      2.8,

    proposedValue:
      2.9,

    unit:
      "g",

    preservationPolicy:
      "append_history"

  });


  EntityMutationContractTest_expectError(
    function() {

      EntityMutationContract_validate(
        mutation
      );

    },
    "identityChanges"
  );

}


/**
 * IDもQueryもないRelation参照を拒否する。
 */
function EntityMutationContractTest_invalidRelationReference() {

  const mutation =
    EntityMutationContract_createEmpty();


  mutation.mutationType =
    "change_relation";

  mutation.subject.entityType =
    "product";

  mutation.subject.entityId =
    "PRD-0001";


  mutation.relationChanges.push({

    relationType:
      "uses_material",

    currentTarget:
      null,

    proposedTarget: {

      entityType:
        "material",

      entityId:
        null,

      entityQuery:
        null

    },

    preservationPolicy:
      "close_and_create_relation"

  });


  EntityMutationContractTest_expectError(
    function() {

      EntityMutationContract_validate(
        mutation
      );

    },
    "entityIdまたはentityQuery"
  );

}


/**
 * 未定義Preservation Policyを拒否する。
 */
function EntityMutationContractTest_invalidPreservationPolicy() {

  const mutation =
    EntityMutationContractTest_createValidChangeAttributeMutation();


  mutation.attributeChanges[0]
    .preservationPolicy =
      "overwrite_everything";


  EntityMutationContractTest_expectError(
    function() {

      EntityMutationContract_validate(
        mutation
      );

    },
    "未対応の値"
  );

}


/*
=========================================
Fixture
=========================================
*/

/**
 * 正常なChange Attribute Mutationを生成する。
 *
 * @return {Object}
 */
function EntityMutationContractTest_createValidChangeAttributeMutation() {

  const mutation =
    EntityMutationContract_createEmpty();


  mutation.mutationType =
    "change_attribute";

  mutation.subject.entityType =
    "product";

  mutation.subject.entityId =
    "PRD-0001";

  mutation.subject.entityQuery =
    "ワンワン";


  mutation.attributeChanges.push({

    path:
      "attribute.productWeight",

    currentValue:
      2.8,

    proposedValue:
      2.9,

    unit:
      "g",

    preservationPolicy:
      "append_history"

  });


  return mutation;

}


/*
=========================================
Test Assertion
=========================================
*/

function EntityMutationContractTest_assertEqual(
  actual,
  expected,
  fieldName
) {

  if (
    actual !==
      expected
  ) {

    throw new Error(
      fieldName +
      "が一致しません。expected=" +
      expected +
      ", actual=" +
      actual
    );

  }

}


function EntityMutationContractTest_assertTrue(
  condition,
  message
) {

  if (
    condition !==
      true
  ) {

    throw new Error(
      message
    );

  }

}


/**
 * 指定した処理がErrorになり、
 * Error Messageに指定文字列が含まれることを確認する。
 *
 * @param {Function} callback
 * @param {string} expectedMessagePart
 */
function EntityMutationContractTest_expectError(
  callback,
  expectedMessagePart
) {

  let errorOccurred =
    false;


  try {

    callback();

  } catch (error) {

    errorOccurred =
      true;


    const message =
      error &&
      error.message
        ? error.message
        : String(error);


    if (
      message.indexOf(
        expectedMessagePart
      ) ===
        -1
    ) {

      throw new Error(
        "想定外のError Messageです。" +
        " expectedPart=" +
        expectedMessagePart +
        ", actual=" +
        message
      );

    }

  }


  if (
    errorOccurred !==
      true
  ) {

    throw new Error(
      "Errorが発生する必要があります。" +
      " expectedPart=" +
      expectedMessagePart
    );

  }

}


