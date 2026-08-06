/*
=========================================
SHiCI

ExecutionPlanEngine Test

Ver.1.0

=========================================
*/


/*
=========================================
Test Runner
=========================================
*/

/**
 * ExecutionPlanEngineの全テストを実行する。
 */
function test_ExecutionPlanEngine_runAll() {

  const tests = [

    {
      name:
        "buildBasic",
      run:
        test_ExecutionPlanEngine_build_basic
    },

    {
      name:
        "buildSubjectAndBinding",
      run:
        test_ExecutionPlanEngine_build_subjectAndBinding
    },

    {
      name:
        "buildOperationSequence",
      run:
        test_ExecutionPlanEngine_build_operationSequence
    },

    {
      name:
        "buildRollbackPlan",
      run:
        test_ExecutionPlanEngine_build_rollbackPlan
    },

    {
      name:
        "buildBindingReferences",
      run:
        test_ExecutionPlanEngine_build_bindingReferences
    },

    {
      name:
        "confirmationExecutionIsNotModified",
      run:
        test_ExecutionPlanEngine_confirmationExecutionIsNotModified
    },

    {
        name:
            "buildFinalState",
        run:
            test_ExecutionPlanEngine_build_finalState
    },

    {
        name:
            "buildPassesExecutionPlanContract",
        run:
            test_ExecutionPlanEngine_build_passesExecutionPlanContract
    }


  ];




  const failures =
    [];


  console.log(
    "========================================="
  );

  console.log(
    "ExecutionPlanEngine Test Start"
  );

  console.log(
    "========================================="
  );


  tests.forEach(
    function(test) {

      try {

            ExecutionPlanEngineTest_clearSnapshotOverride();

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

        ExecutionPlanEngineTest_clearSnapshotOverride();

      }

    }
  );


  if (
    failures.length >
      0
  ) {

    throw new Error(
      "ExecutionPlanEngine Test Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  console.log(
    "[Execution Plan Engine Ver.1.0 Test Passed]"
  );

}











/**
 * 基本生成
 */
function test_ExecutionPlanEngine_build_basic() {

  const confirmationExecution =
    ExecutionPlanEngineTest_createConfirmationExecution();


  const executionPlan =
    ExecutionPlanEngine_build(
      confirmationExecution
    );


  ExecutionPlanEngineTest_assertTrue(

    executionPlan !== null,

    "executionPlan"

  );


  ExecutionPlanEngineTest_assertEquals(

    5,

    executionPlan.operations.length,

    "operations"

  );


    const operation3 =
    executionPlan.operations[2];


  ExecutionPlanEngineTest_assertEquals(
    "PROMOTE_NEW_CONDITION_TO_STANDARD",
    operation3.operationId,
    "operation3.operationId"
  );


  ExecutionPlanEngineTest_assertEquals(
    3,
    operation3.sequence,
    "operation3.sequence"
  );


  ExecutionPlanEngineTest_assertEquals(
    EXECUTION_PLAN_OPERATION_UPDATE,
    operation3.operationType,
    "operation3.operationType"
  );


  ExecutionPlanEngineTest_assertEquals(
    "成形条件マスター",
    operation3.target.sheetName,
    "operation3.target.sheetName"
  );


  ExecutionPlanEngineTest_assertEquals(
    "標準",
    operation3.payload.values["状態"],
    "operation3.payload.values.状態"
  );


  ExecutionPlanEngineTest_assertEquals(
    "試験",
    operation3.payload.criteria["状態"],
    "operation3.payload.criteria.状態"
  );


  ExecutionPlanEngineTest_assertEquals(
    true,
    operation3.rollback.supported,
    "operation3.rollback.supported"
  );


  ExecutionPlanEngineTest_assertEquals(
    EXECUTION_PLAN_OPERATION_UPDATE,
    operation3.rollback.operationType,
    "operation3.rollback.operationType"
  );


  ExecutionPlanEngineTest_assertEquals(
    "試験",
    operation3.rollback.payload.values["状態"],
    "operation3.rollback.payload.values.状態"
  );


  ExecutionPlanEngineTest_assertEquals(
    "標準",
    operation3.rollback.payload.criteria["状態"],
    "operation3.rollback.payload.criteria.状態"
  );




    const operation4 =
    executionPlan.operations[3];


  ExecutionPlanEngineTest_assertEquals(
    "SWITCH_PRODUCT_CURRENT_CONDITION",
    operation4.operationId,
    "operation4.operationId"
  );


  ExecutionPlanEngineTest_assertEquals(
    4,
    operation4.sequence,
    "operation4.sequence"
  );


  ExecutionPlanEngineTest_assertEquals(
    EXECUTION_PLAN_OPERATION_UPDATE,
    operation4.operationType,
    "operation4.operationType"
  );


  ExecutionPlanEngineTest_assertEquals(
    "製品マスター",
    operation4.target.sheetName,
    "operation4.target.sheetName"
  );


  ExecutionPlanEngineTest_assertEquals(
    "product",
    operation4.target.entityType,
    "operation4.target.entityType"
  );


  ExecutionPlanEngineTest_assertEquals(
    "P-000035",
    operation4.target.entityId,
    "operation4.target.entityId"
  );


  ExecutionPlanEngineTest_assertEquals(
    "P-000035",
    operation4.payload.criteria["製品ID"],
    "operation4.payload.criteria.製品ID"
  );


  ExecutionPlanEngineTest_assertEquals(
    "COND-000152",
    operation4.payload.criteria["現在標準条件ID"],
    "operation4.payload.criteria.現在標準条件ID"
  );


  ExecutionPlanEngineTest_assertEquals(
    "NEW_CONDITION_ID",
    operation4
      .payload
      .values["現在標準条件ID"]
      .bindingRef,
    "operation4.payload.values.現在標準条件ID.bindingRef"
  );


  ExecutionPlanEngineTest_assertEquals(
    true,
    operation4.rollback.supported,
    "operation4.rollback.supported"
  );


  ExecutionPlanEngineTest_assertEquals(
    EXECUTION_PLAN_OPERATION_UPDATE,
    operation4.rollback.operationType,
    "operation4.rollback.operationType"
  );


  ExecutionPlanEngineTest_assertEquals(
    "COND-000152",
    operation4
      .rollback
      .payload
      .values["現在標準条件ID"],
    "operation4.rollback.payload.values.現在標準条件ID"
  );


  ExecutionPlanEngineTest_assertEquals(
    "NEW_CONDITION_ID",
    operation4
      .rollback
      .payload
      .criteria["現在標準条件ID"]
      .bindingRef,
    "operation4.rollback.payload.criteria.現在標準条件ID.bindingRef"
  );






    const operation5 =
    executionPlan.operations[4];


  ExecutionPlanEngineTest_assertEquals(
    "ARCHIVE_OLD_STANDARD_CONDITION",
    operation5.operationId,
    "operation5.operationId"
  );


  ExecutionPlanEngineTest_assertEquals(
    5,
    operation5.sequence,
    "operation5.sequence"
  );


  ExecutionPlanEngineTest_assertEquals(
    EXECUTION_PLAN_OPERATION_UPDATE,
    operation5.operationType,
    "operation5.operationType"
  );


  ExecutionPlanEngineTest_assertEquals(
    "成形条件マスター",
    operation5.target.sheetName,
    "operation5.target.sheetName"
  );


  ExecutionPlanEngineTest_assertEquals(
    "condition",
    operation5.target.entityType,
    "operation5.target.entityType"
  );


  ExecutionPlanEngineTest_assertEquals(
    "COND-000152",
    operation5.target.entityId,
    "operation5.target.entityId"
  );


  ExecutionPlanEngineTest_assertEquals(
    "COND-000152",
    operation5.payload.criteria["条件ID"],
    "operation5.payload.criteria.条件ID"
  );


  ExecutionPlanEngineTest_assertEquals(
    "P-000035",
    operation5.payload.criteria["製品ID"],
    "operation5.payload.criteria.製品ID"
  );


  ExecutionPlanEngineTest_assertEquals(
    4,
    operation5.payload.criteria["版数"],
    "operation5.payload.criteria.版数"
  );


  ExecutionPlanEngineTest_assertEquals(
    "標準",
    operation5.payload.criteria["状態"],
    "operation5.payload.criteria.状態"
  );


  ExecutionPlanEngineTest_assertEquals(
    "旧版",
    operation5.payload.values["状態"],
    "operation5.payload.values.状態"
  );


  ExecutionPlanEngineTest_assertEquals(
    true,
    operation5.rollback.supported,
    "operation5.rollback.supported"
  );


  ExecutionPlanEngineTest_assertEquals(
    EXECUTION_PLAN_OPERATION_UPDATE,
    operation5.rollback.operationType,
    "operation5.rollback.operationType"
  );


  ExecutionPlanEngineTest_assertEquals(
    "標準",
    operation5.rollback.payload.values["状態"],
    "operation5.rollback.payload.values.状態"
  );


  ExecutionPlanEngineTest_assertEquals(
    "旧版",
    operation5.rollback.payload.criteria["状態"],
    "operation5.rollback.payload.criteria.状態"
  );


  ExecutionPlanEngineTest_assertEquals(
    "COND-000152",
    operation5.rollback.payload.criteria["条件ID"],
    "operation5.rollback.payload.criteria.条件ID"
  );

















  ExecutionPlanEngineTest_assertEquals(

    1,

    executionPlan.bindings.length,

    "bindings"

  );




}




/*
=========================================
Subject and Binding
=========================================
*/

/**
 * SubjectとRuntime Bindingが
 * 正しく生成されることを確認する。
 */
function test_ExecutionPlanEngine_build_subjectAndBinding() {

  const fixture =
    ExecutionPlanEngineTest_createExecutionPlanFixture();


  const confirmationExecution =
    fixture.confirmationExecution;


  const executionPlan =
    fixture.executionPlan;


  ExecutionPlanEngineTest_assertEquals(
    confirmationExecution
      .changePlan
      .subject
      .entityType,
    executionPlan.subject.entityType,
    "executionPlan.subject.entityType"
  );


  ExecutionPlanEngineTest_assertEquals(
    confirmationExecution
      .changePlan
      .subject
      .entityId,
    executionPlan.subject.entityId,
    "executionPlan.subject.entityId"
  );


  ExecutionPlanEngineTest_assertEquals(
    confirmationExecution
      .changePlan
      .subject
      .displayName,
    executionPlan.subject.entityName,
    "executionPlan.subject.entityName"
  );


  ExecutionPlanEngineTest_assertEquals(
    1,
    executionPlan.bindings.length,
    "executionPlan.bindings.length"
  );


  const binding =
    executionPlan.bindings[0];


  ExecutionPlanEngineTest_assertEquals(
    "NEW_CONDITION_ID",
    binding.bindingId,
    "binding.bindingId"
  );


  ExecutionPlanEngineTest_assertEquals(
    "generated_id",
    binding.bindingType,
    "binding.bindingType"
  );


  ExecutionPlanEngineTest_assertEquals(
    "sequence_id",
    binding.generator.type,
    "binding.generator.type"
  );


  ExecutionPlanEngineTest_assertEquals(
    "COND",
    binding.generator.prefix,
    "binding.generator.prefix"
  );


  ExecutionPlanEngineTest_assertEquals(
    null,
    binding.resolvedValue,
    "binding.resolvedValue"
  );

}



/*
=========================================
Operation Sequence
=========================================
*/

/**
 * 5件のOperationが、
 * 現行ConditionUpdateEngineと同じ順序で
 * 生成されることを確認する。
 */
function test_ExecutionPlanEngine_build_operationSequence() {

  const fixture =
    ExecutionPlanEngineTest_createExecutionPlanFixture();


  const operations =
    fixture.executionPlan.operations;


  const expectedOperationIds = [

    "INSERT_NEW_CONDITION",

    "INSERT_NEW_CONDITION_DETAIL",

    "PROMOTE_NEW_CONDITION_TO_STANDARD",

    "SWITCH_PRODUCT_CURRENT_CONDITION",

    "ARCHIVE_OLD_STANDARD_CONDITION"

  ];


  ExecutionPlanEngineTest_assertEquals(
    expectedOperationIds.length,
    operations.length,
    "operations.length"
  );


  operations.forEach(
    function(operation, index) {

      ExecutionPlanEngineTest_assertEquals(
        index + 1,
        operation.sequence,
        "operations[" +
        index +
        "].sequence"
      );


      ExecutionPlanEngineTest_assertEquals(
        expectedOperationIds[index],
        operation.operationId,
        "operations[" +
        index +
        "].operationId"
      );

    }
  );

}




/*
=========================================
Rollback Plan
=========================================
*/

/**
 * 全OperationがRollback対応であることを確認する。
 */
function test_ExecutionPlanEngine_build_rollbackPlan() {

  const fixture =
    ExecutionPlanEngineTest_createExecutionPlanFixture();


  const operations =
    fixture.executionPlan.operations;


  operations.forEach(
    function(operation, index) {

      ExecutionPlanEngineTest_assertEquals(
        true,
        operation.rollback.supported,
        "operations[" +
        index +
        "].rollback.supported"
      );


      ExecutionPlanEngineTest_assertTrue(
        typeof operation.rollback.operationType ===
          "string" &&
        operation.rollback.operationType.trim() !==
          "",
        "operations[" +
        index +
        "].rollback.operationType"
      );


      ExecutionPlanEngineTest_assertTrue(
        operation.rollback.payload !==
          null &&
        typeof operation.rollback.payload ===
          "object" &&
        !Array.isArray(
          operation.rollback.payload
        ),
        "operations[" +
        index +
        "].rollback.payload"
      );

    }
  );


  ExecutionPlanEngineTest_assertEquals(
    EXECUTION_PLAN_OPERATION_DELETE,
    operations[0].rollback.operationType,
    "operation1.rollback.operationType"
  );


  ExecutionPlanEngineTest_assertEquals(
    EXECUTION_PLAN_OPERATION_DELETE,
    operations[1].rollback.operationType,
    "operation2.rollback.operationType"
  );


  ExecutionPlanEngineTest_assertEquals(
    EXECUTION_PLAN_OPERATION_UPDATE,
    operations[2].rollback.operationType,
    "operation3.rollback.operationType"
  );


  ExecutionPlanEngineTest_assertEquals(
    EXECUTION_PLAN_OPERATION_UPDATE,
    operations[3].rollback.operationType,
    "operation4.rollback.operationType"
  );


  ExecutionPlanEngineTest_assertEquals(
    EXECUTION_PLAN_OPERATION_UPDATE,
    operations[4].rollback.operationType,
    "operation5.rollback.operationType"
  );

}




/*
=========================================
Binding References
=========================================
*/

/**
 * 新条件IDを必要とする全Operationが、
 * 同じNEW_CONDITION_ID Bindingを
 * 参照していることを確認する。
 */
function test_ExecutionPlanEngine_build_bindingReferences() {

  const fixture =
    ExecutionPlanEngineTest_createExecutionPlanFixture();


  const operations =
    fixture.executionPlan.operations;


  ExecutionPlanEngineTest_assertBindingReference(
    operations[0]
      .payload
      .values["条件ID"],
    "NEW_CONDITION_ID",
    "operation1.payload.values.条件ID"
  );


  ExecutionPlanEngineTest_assertBindingReference(
    operations[0]
      .rollback
      .payload
      .criteria["条件ID"],
    "NEW_CONDITION_ID",
    "operation1.rollback.criteria.条件ID"
  );


  ExecutionPlanEngineTest_assertBindingReference(
    operations[1]
      .payload
      .values["条件ID"],
    "NEW_CONDITION_ID",
    "operation2.payload.values.条件ID"
  );


  ExecutionPlanEngineTest_assertBindingReference(
    operations[1]
      .rollback
      .payload
      .criteria["条件ID"],
    "NEW_CONDITION_ID",
    "operation2.rollback.criteria.条件ID"
  );


  ExecutionPlanEngineTest_assertBindingReference(
    operations[2]
      .payload
      .criteria["条件ID"],
    "NEW_CONDITION_ID",
    "operation3.payload.criteria.条件ID"
  );


  ExecutionPlanEngineTest_assertBindingReference(
    operations[3]
      .payload
      .values["現在標準条件ID"],
    "NEW_CONDITION_ID",
    "operation4.payload.values.現在標準条件ID"
  );


  ExecutionPlanEngineTest_assertBindingReference(
    operations[3]
      .rollback
      .payload
      .criteria["現在標準条件ID"],
    "NEW_CONDITION_ID",
    "operation4.rollback.criteria.現在標準条件ID"
  );

}




/*
=========================================
Input Immutability
=========================================
*/

/**
 * Execution Plan生成によって、
 * Confirmation Execution Resultの原本が
 * 変更されないことを確認する。
 */
function test_ExecutionPlanEngine_confirmationExecutionIsNotModified() {

  const confirmationExecution =
    ExecutionPlanEngineTest_createConfirmationExecution();


  const originalJson =
    JSON.stringify(
      confirmationExecution
    );


  ExecutionPlanEngine_build(
    confirmationExecution
  );


  ExecutionPlanEngineTest_assertEquals(
    originalJson,
    JSON.stringify(
      confirmationExecution
    ),
    "confirmationExecution"
  );

}





/*
=========================================
Final State
=========================================
*/

/**
 * Execution Planが、
 * Transaction Engineへ渡せる完成状態で
 * 生成されることを確認する。
 */
function test_ExecutionPlanEngine_build_finalState() {

  const fixture =
    ExecutionPlanEngineTest_createExecutionPlanFixture();


  const confirmationExecution =
    fixture.confirmationExecution;


  const executionPlan =
    fixture.executionPlan;


  ExecutionPlanEngineTest_assertTrue(
    typeof executionPlan.executionPlanId ===
      "string" &&
    executionPlan.executionPlanId.indexOf(
      "EXECUTION-PLAN-"
    ) ===
      0,
    "executionPlan.executionPlanId"
  );


  ExecutionPlanEngineTest_assertEquals(
    confirmationExecution.changePlanId,
    executionPlan.changePlanId,
    "executionPlan.changePlanId"
  );


  ExecutionPlanEngineTest_assertEquals(
    confirmationExecution.proposalId,
    executionPlan.proposalId,
    "executionPlan.proposalId"
  );


  ExecutionPlanEngineTest_assertEquals(
    EXECUTION_PLAN_STATUS_READY,
    executionPlan.status,
    "executionPlan.status"
  );


  ExecutionPlanEngineTest_assertEquals(
    true,
    executionPlan.executable,
    "executionPlan.executable"
  );


  ExecutionPlanEngineTest_assertEquals(
    true,
    executionPlan.executionPolicy.atomic,
    "executionPlan.executionPolicy.atomic"
  );


  ExecutionPlanEngineTest_assertEquals(
    true,
    executionPlan.executionPolicy.stopOnError,
    "executionPlan.executionPolicy.stopOnError"
  );


  ExecutionPlanEngineTest_assertEquals(
    true,
    executionPlan.executionPolicy.rollbackRequired,
    "executionPlan.executionPolicy.rollbackRequired"
  );


  ExecutionPlanEngineTest_assertEquals(
    confirmationExecution.decidedAt,
    executionPlan.createdAt,
    "executionPlan.createdAt"
  );


  ExecutionPlanEngineTest_assertEquals(
    confirmationExecution.metadata.decidedBy,
    executionPlan.createdBy,
    "executionPlan.createdBy"
  );


  ExecutionPlanEngineTest_assertEquals(
    "confirmation_execution",
    executionPlan.metadata.source,
    "executionPlan.metadata.source"
  );


  ExecutionPlanEngineTest_assertEquals(
    confirmationExecution.metadata.requestId,
    executionPlan.metadata.requestId,
    "executionPlan.metadata.requestId"
  );


  ExecutionPlanEngineTest_assertEquals(
    confirmationExecution.proposalId,
    executionPlan.metadata.correlationId,
    "executionPlan.metadata.correlationId"
  );

}



/*
=========================================
Contract Validation
=========================================
*/

/**
 * ExecutionPlanEngineが生成した完成Planが、
 * ExecutionPlanContractを通過することを確認する。
 */
function test_ExecutionPlanEngine_build_passesExecutionPlanContract() {

  const fixture =
    ExecutionPlanEngineTest_createExecutionPlanFixture();


  const result =
    ExecutionPlanContract_validate(
      fixture.executionPlan
    );


  ExecutionPlanEngineTest_assertEquals(
    true,
    result,
    "ExecutionPlanContract_validate result"
  );

}
















/*
=========================================
Execution Plan Fixture
=========================================
*/

/**
 * 実際のConfirmation Execution Resultから
 * Execution Planを生成する。
 *
 * @return {Object}
 */
function ExecutionPlanEngineTest_createExecutionPlanFixture() {

  const confirmationExecution =
    ExecutionPlanEngineTest_createConfirmationExecution();


  const executionPlan =
    ExecutionPlanEngine_build(
      confirmationExecution
    );


  return {

    confirmationExecution:
      confirmationExecution,

    executionPlan:
      executionPlan

  };

}














/**
 * 実際の処理経路から
 * confirmed状態のConfirmation Execution Resultを生成する。
 *
 * Spreadsheetは読み取るが更新しない。
 * Pending Change Storeには一時保存するが、
 * confirm処理によって自動的に削除される。
 *
 * @return {Object}
 */
function ExecutionPlanEngineTest_createConfirmationExecution() {

  ExecutionPlanEngineTest_setSnapshotOverride();


  /*
  =========================================
  Entity Mutation
  =========================================
  */

  const mutation =
    EntityMutationContract_createEmpty();


  mutation.mutationId =
    "MUTATION_EXECUTION_PLAN_ENGINE_TEST_" +
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


  /*
  =========================================
  Entity Resolution
  =========================================
  */

  const resolutionResult =
    EntityMutationResolutionEngine_resolve(
      mutation
    );


  ExecutionPlanEngineTest_assertEquals(
    "resolved",
    resolutionResult.status,
    "resolutionResult.status"
  );


  /*
  =========================================
  Change Plan
  =========================================
  */

  const changePlan =
    ChangePlanEngine_build(
      resolutionResult
    );


  ExecutionPlanEngineTest_assertEquals(
    "ready_for_confirmation",
    changePlan.status,
    "changePlan.status"
  );


  /*
  =========================================
  Confirmation Proposal
  =========================================
  */

  const proposal =
    ConfirmationProposalEngine_build(
      changePlan
    );


  /*
  =========================================
  Pending Store
  =========================================
  */

  PendingChangeStore_save(
    changePlan,
    proposal
  );


  /*
  =========================================
  Confirmation Execution
  =========================================
  */

  const confirmationExecution =
    ConfirmationExecutionEngine_confirm(
      proposal.proposalId,
      changePlan.changePlanId,
      {

        source:
          "execution_plan_engine_test",

        decidedBy:
          "USER_TEST_001",

        requestId:
          "REQUEST_EXECUTION_PLAN_ENGINE_TEST_001"

      }
    );


  ExecutionPlanEngineTest_assertEquals(
    "confirmed",
    confirmationExecution.status,
    "confirmationExecution.status"
  );


  ExecutionPlanEngineTest_assertEquals(
    "confirm",
    confirmationExecution.actionType,
    "confirmationExecution.actionType"
  );


  return confirmationExecution;

}







/*
=========================================
Snapshot Override
=========================================
*/

let ExecutionPlanEngineTest_originalSnapshotGetter =
  null;


/**
 * Change Plan生成時に使用するProduct Snapshotを、
 * Execution Plan Engine Test専用の固定値へ差し替える。
 */
function ExecutionPlanEngineTest_setSnapshotOverride() {

  if (
    ExecutionPlanEngineTest_originalSnapshotGetter ===
      null
  ) {

    ExecutionPlanEngineTest_originalSnapshotGetter =
      SnapshotEngine_getProductSnapshot;

  }


  SnapshotEngine_getProductSnapshot =
    function(productId) {

      ExecutionPlanEngineTest_assertEquals(
        "P-000035",
        productId,
        "Snapshot productId"
      );


      return {

        status:
          "success",

        product: {

          "製品ID":
            "P-000035",

          "製品名":
            "LEVER, CLAMP",

          "図番":
            "KLW-M374C-000",

          "現在標準条件ID":
            "COND-000152"

        },

        condition: {

          "条件ID":
            "COND-000152",

          "製品ID":
            "P-000035",

          "状態":
            "標準",

          "版数":
            4,

          "親条件ID":
            null,

          "変更理由":
            null,

          "最終更新日":
            "2026-08-01T00:00:00.000Z"

        },

        conditionDetail: {

          "条件ID":
            "COND-000152",

          "金型温度(℃)":
            60,

          "冷却時間":
            8,

          "最終更新日":
            "2026-08-01T00:00:00.000Z"

        }

      };

    };

}


/**
 * Snapshot Overrideを解除する。
 */
function ExecutionPlanEngineTest_clearSnapshotOverride() {

  if (
    ExecutionPlanEngineTest_originalSnapshotGetter !==
      null
  ) {

    SnapshotEngine_getProductSnapshot =
      ExecutionPlanEngineTest_originalSnapshotGetter;


    ExecutionPlanEngineTest_originalSnapshotGetter =
      null;

  }

}









function ExecutionPlanEngineTest_assertTrue(

  value,

  label

) {

  if (

    !value

  ) {

    throw new Error(

      label +
      " failed."

    );

  }

}



function ExecutionPlanEngineTest_assertEquals(

  expected,

  actual,

  label

) {

  if (

    expected !== actual

  ) {

    throw new Error(

      label +

      " expected=" +

      expected +

      " actual=" +

      actual

    );

  }

}






/**
 * bindingRef Objectを確認する。
 *
 * @param {*} actual
 * @param {string} expectedBindingId
 * @param {string} label
 */
function ExecutionPlanEngineTest_assertBindingReference(
  actual,
  expectedBindingId,
  label
) {

  ExecutionPlanEngineTest_assertTrue(
    actual !==
      null &&
    typeof actual ===
      "object" &&
    !Array.isArray(
      actual
    ),
    label +
    "はObjectである必要があります。"
  );


  ExecutionPlanEngineTest_assertEquals(
    1,
    Object.keys(
      actual
    ).length,
    label +
    ".keys.length"
  );


  ExecutionPlanEngineTest_assertEquals(
    expectedBindingId,
    actual.bindingRef,
    label +
    ".bindingRef"
  );

}











