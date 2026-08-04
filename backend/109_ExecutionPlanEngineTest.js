/*
=========================================
SHiCI

ExecutionPlanEngine Test

Ver.1.0

=========================================
*/


/**
 * 全テスト実行
 */
function test_ExecutionPlanEngine_runAll() {

  Logger.log(
    "========================================="
  );

  Logger.log(
    "ExecutionPlanEngine Test Start"
  );

  Logger.log(
    "========================================="
  );


  test_ExecutionPlanEngine_build_basic();


  Logger.log(
    "========================================="
  );

  Logger.log(
    "All ExecutionPlanEngine Tests Passed."
  );

  Logger.log(
    "========================================="
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

    2,

    executionPlan.operations.length,

    "operations"

  );


  ExecutionPlanEngineTest_assertEquals(

    1,

    executionPlan.bindings.length,

    "bindings"

  );


  Logger.log(

    "[PASS] build_basic"

  );

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











