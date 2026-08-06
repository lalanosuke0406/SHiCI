/*
=========================================
SHiCI
48_ExecutionPlanEngine.js

Execution Plan Engine
Version 1.0

役割：
・Confirmation Execution Resultから
  Execution Planを生成する
・Confirmed Change Planを
  Storage操作列へ変換する
・Runtime Bindingを定義する
・OperationとRollbackを計画する
・Execution Plan Contractで検証する

Ver.1.0対応範囲：
・product Entity
・change_state
・standard_condition.mold_temperature
・create_new_version

禁止：
・Spreadsheetを更新しない
・IDを採番しない
・Operationを実行しない
・Rollbackを実行しない
・Entityを検索しない
・Snapshotを再取得しない
・LLMを呼び出さない
=========================================
*/


/*
=========================================
Public API
=========================================
*/

/**
 * Confirmation Execution Resultから
 * Execution Planを生成する。
 *
 * @param {Object} confirmationExecution
 * @return {Object}
 */
function ExecutionPlanEngine_build(
  confirmationExecution
) {

  ExecutionPlanEngine_validateInput(
    confirmationExecution
  );


  const executionPlan =
    ExecutionPlanContract_createEmpty();


  ExecutionPlanEngine_initializePlan(
    executionPlan,
    confirmationExecution
  );


  ExecutionPlanEngine_copySubject(
    executionPlan,
    confirmationExecution
  );


  ExecutionPlanEngine_buildBindings(
    executionPlan,
    confirmationExecution
  );


  const executionContext =
  ExecutionPlanEngine_buildExecutionContext(
    confirmationExecution
  );


  ExecutionPlanEngine_buildOperations(
    executionPlan,
    confirmationExecution,
    executionContext
  );


  ExecutionPlanEngine_buildExecutionPolicy(
    executionPlan
  );


  ExecutionPlanEngine_buildMetadata(
    executionPlan,
    confirmationExecution
  );


  ExecutionPlanEngine_finalize(
    executionPlan,
    confirmationExecution
  );


  return executionPlan;

}




/*
=========================================
Input Validation
=========================================
*/

/**
 * Confirmation Execution Resultを検証する。
 *
 * @param {Object} confirmationExecution
 */
function ExecutionPlanEngine_validateInput(
  confirmationExecution
) {

  ExecutionPlanEngine_assertObject(
    confirmationExecution,
    "confirmationExecution"
  );


  /*
   * Confirmed Resultの正式な構造検証を行う。
   */
  ConfirmationExecutionEngine_validateConfirmedResult(
    confirmationExecution
  );


  if (
    confirmationExecution.status !==
      "confirmed"
  ) {

    throw new Error(
      "Confirmation Executionはconfirmedである必要があります。"
    );

  }


  if (
    confirmationExecution.actionType !==
      "confirm"
  ) {

    throw new Error(
      "Confirmation ExecutionのactionTypeはconfirmである必要があります。"
    );

  }


  ExecutionPlanEngine_assertObject(
    confirmationExecution.changePlan,
    "confirmationExecution.changePlan"
  );


  ChangePlanContract_validate(
    confirmationExecution.changePlan
  );


  if (
    confirmationExecution.changePlanId !==
      confirmationExecution.changePlan.changePlanId
  ) {

    throw new Error(
      "Confirmation ExecutionとChange PlanのchangePlanIdが一致しません。"
    );

  }

}


/*
=========================================
Plan Initialization
=========================================
*/

/**
 * Execution Planの基本情報を設定する。
 *
 * この段階ではまだdraftであり、
 * Operationも未生成である。
 *
 * @param {Object} executionPlan
 * @param {Object} confirmationExecution
 */
function ExecutionPlanEngine_initializePlan(
  executionPlan,
  confirmationExecution
) {

  ExecutionPlanEngine_assertObject(
    executionPlan,
    "executionPlan"
  );


  executionPlan.executionPlanId =
    null;


  executionPlan.changePlanId =
    confirmationExecution
      .changePlan
      .changePlanId;


  executionPlan.proposalId =
    confirmationExecution
      .proposalId;


  executionPlan.status =
    EXECUTION_PLAN_STATUS_DRAFT;


  executionPlan.executable =
    false;

}


/*
=========================================
Subject
=========================================
*/

/**
 * Change PlanのSubjectを
 * Execution Planへ変換する。
 *
 * Change PlanではdisplayName、
 * Execution PlanではentityNameを使用する。
 *
 * @param {Object} executionPlan
 * @param {Object} confirmationExecution
 */
function ExecutionPlanEngine_copySubject(
  executionPlan,
  confirmationExecution
) {

  const changePlanSubject =
    confirmationExecution
      .changePlan
      .subject;


  ExecutionPlanEngine_assertObject(
    changePlanSubject,
    "confirmationExecution.changePlan.subject"
  );


  executionPlan.subject.entityType =
    changePlanSubject.entityType;


  executionPlan.subject.entityId =
    changePlanSubject.entityId;


  executionPlan.subject.entityName =
    changePlanSubject.displayName;

}



/*
=========================================
Runtime Bindings
=========================================
*/

/**
 * Execution Planに必要な
 * Runtime Bindingを生成する。
 *
 * Ver.1.0では、
 * 新しい成形条件IDだけを生成する。
 *
 * @param {Object} executionPlan
 * @param {Object} confirmationExecution
 */
function ExecutionPlanEngine_buildBindings(
  executionPlan,
  confirmationExecution
) {

  ExecutionPlanEngine_assertObject(
    executionPlan,
    "executionPlan"
  );


  ExecutionPlanEngine_assertObject(
    confirmationExecution,
    "confirmationExecution"
  );


  const conditionBinding =
    ExecutionPlanEngine_createConditionIdBinding();


  ExecutionPlanEngine_addBinding(
    executionPlan,
    conditionBinding
  );

}


/**
 * 新しい成形条件ID用の
 * Runtime Bindingを生成する。
 *
 * 実際のID採番はTransaction Engineが行う。
 *
 * @return {Object}
 */
function ExecutionPlanEngine_createConditionIdBinding() {

  const binding =
    ExecutionPlanContract_createEmptyBinding();


  binding.bindingId =
    "NEW_CONDITION_ID";


  binding.bindingType =
    "generated_id";


  binding.generator.type =
    "sequence_id";


  binding.generator.prefix =
    "COND";


  binding.resolvedValue =
    null;


  binding.metadata.description =
    "新しい成形条件ID";


  return binding;

}


/**
 * BindingをExecution Planへ追加する。
 *
 * 同じbindingIdの重複追加は拒否する。
 *
 * @param {Object} executionPlan
 * @param {Object} binding
 */
function ExecutionPlanEngine_addBinding(
  executionPlan,
  binding
) {

  ExecutionPlanEngine_assertObject(
    executionPlan,
    "executionPlan"
  );


  ExecutionPlanEngine_assertObject(
    binding,
    "binding"
  );


  if (
    !Array.isArray(
      executionPlan.bindings
    )
  ) {

    throw new Error(
      "executionPlan.bindingsはArrayである必要があります。"
    );

  }


  const duplicated =
    executionPlan.bindings.some(
      function(existingBinding) {

        return (
          existingBinding &&
          existingBinding.bindingId ===
            binding.bindingId
        );

      }
    );


  if (
    duplicated
  ) {

    throw new Error(
      "Execution Planに重複したbindingIdを追加できません。bindingId=" +
      binding.bindingId
    );

  }


  executionPlan.bindings.push(
    ExecutionPlanEngine_deepCopy(
      binding
    )
  );

}



/*
=========================================
Execution Context
=========================================
*/

/**
 * Change Planから、
 * Operation生成に必要な確定値を抽出する。
 *
 * この関数はSnapshotを再取得しない。
 * Confirm済みChange Plan内の原本だけを使用する。
 *
 * @param {Object} confirmationExecution
 * @return {Object}
 */
function ExecutionPlanEngine_buildExecutionContext(
  confirmationExecution
) {

  ExecutionPlanEngine_assertObject(
    confirmationExecution,
    "confirmationExecution"
  );


  const changePlan =
    confirmationExecution.changePlan;


  ExecutionPlanEngine_assertObject(
    changePlan,
    "confirmationExecution.changePlan"
  );


  const currentSnapshot =
    changePlan.currentSnapshot;


  const proposedSnapshot =
    changePlan.proposedSnapshot;


  ExecutionPlanEngine_assertObject(
    currentSnapshot,
    "changePlan.currentSnapshot"
  );


  ExecutionPlanEngine_assertObject(
    proposedSnapshot,
    "changePlan.proposedSnapshot"
  );


  ExecutionPlanEngine_assertObject(
    currentSnapshot.condition,
    "changePlan.currentSnapshot.condition"
  );


  ExecutionPlanEngine_assertObject(
    currentSnapshot.conditionDetail,
    "changePlan.currentSnapshot.conditionDetail"
  );


  ExecutionPlanEngine_assertObject(
    proposedSnapshot.condition,
    "changePlan.proposedSnapshot.condition"
  );


  ExecutionPlanEngine_assertObject(
    proposedSnapshot.conditionDetail,
    "changePlan.proposedSnapshot.conditionDetail"
  );


  const productId =
    ExecutionPlanEngine_requireNonEmptyString(
      changePlan.subject.entityId,
      "changePlan.subject.entityId"
    );


  const productName =
    ExecutionPlanEngine_requireNonEmptyString(
      changePlan.subject.displayName,
      "changePlan.subject.displayName"
    );


  const currentConditionId =
    ExecutionPlanEngine_requireNonEmptyString(
      currentSnapshot.condition["条件ID"],
      "changePlan.currentSnapshot.condition.条件ID"
    );


  const currentVersion =
    ExecutionPlanEngine_requireFiniteNumber(
      currentSnapshot.condition["版数"],
      "changePlan.currentSnapshot.condition.版数"
    );



  const proposedVersion =
    ExecutionPlanEngine_requireFiniteNumber(
      proposedSnapshot.condition["版数"],
      "changePlan.proposedSnapshot.condition.版数"
    );


  if (
    proposedVersion !==
      currentVersion + 1
  ) {

    throw new Error(
      "新しい条件の版数が現在版数の次版ではありません。" +
      " currentVersion=" +
      currentVersion +
      " proposedVersion=" +
      proposedVersion
    );

  }


  if (
    proposedSnapshot.condition["親条件ID"] !==
      currentConditionId
  ) {

    throw new Error(
      "新しい条件の親条件IDが現在条件IDと一致しません。"
    );

  }


  const reason =
    ExecutionPlanEngine_requireNonEmptyString(
      changePlan.reason,
      "changePlan.reason"
    );


  return {

    productId:
      productId,

    productName:
      productName,

    currentConditionId:
      currentConditionId,

    currentVersion:
      currentVersion,

    proposedVersion:
      proposedVersion,


    reason:
      reason,

    currentCondition:
      ExecutionPlanEngine_deepCopy(
        currentSnapshot.condition
      ),

    currentConditionDetail:
      ExecutionPlanEngine_deepCopy(
        currentSnapshot.conditionDetail
      ),

    proposedCondition:
      ExecutionPlanEngine_deepCopy(
        proposedSnapshot.condition
      ),

    proposedConditionDetail:
      ExecutionPlanEngine_deepCopy(
        proposedSnapshot.conditionDetail
      )

  };

}



/*
=========================================
Operations
=========================================
*/

/**
 * Execution PlanのOperation列を生成する。
 *
 * Ver.1.0では、標準成形条件の変更を
 * 5件のOperationへ展開する。
 *
 * Operation 1〜5を順番に生成する。
 *
 * @param {Object} executionPlan
 * @param {Object} confirmationExecution
 * @param {Object} executionContext
 */
function ExecutionPlanEngine_buildOperations(
  executionPlan,
  confirmationExecution,
  executionContext
) {

  ExecutionPlanEngine_assertObject(
    executionPlan,
    "executionPlan"
  );


  ExecutionPlanEngine_assertObject(
    confirmationExecution,
    "confirmationExecution"
  );


  ExecutionPlanEngine_assertObject(
    executionContext,
    "executionContext"
  );


  /*
  =========================================
  Operation 1
  新しい成形条件マスターを追加
  =========================================
  */

  const insertConditionOperation =
    ExecutionPlanEngine_createInsertConditionOperation(
      confirmationExecution,
      executionContext
    );


  ExecutionPlanEngine_addOperation(
    executionPlan,
    insertConditionOperation
  );


  /*
  =========================================
  Operation 2
  新しい成形条件詳細マスターを追加
  =========================================
  */

  const insertConditionDetailOperation =
    ExecutionPlanEngine_createInsertConditionDetailOperation(
      executionContext
    );


  ExecutionPlanEngine_addOperation(
    executionPlan,
    insertConditionDetailOperation
  );



  /*
  =========================================
  Operation 3
  新しい成形条件を標準状態へ変更
  =========================================
  */

  const promoteNewConditionOperation =
    ExecutionPlanEngine_createPromoteNewConditionOperation(
      confirmationExecution,
      executionContext
    );


  ExecutionPlanEngine_addOperation(
    executionPlan,
    promoteNewConditionOperation
  );



  /*
  =========================================
  Operation 4
  製品の現在標準条件IDを切り替える
  =========================================
  */

  const switchProductConditionOperation =
    ExecutionPlanEngine_createSwitchProductConditionOperation(
      confirmationExecution,
      executionContext
    );


  ExecutionPlanEngine_addOperation(
    executionPlan,
    switchProductConditionOperation
  );



  /*
  =========================================
  Operation 5
  旧成形条件を旧版状態へ変更
  =========================================
  */

  const archiveOldConditionOperation =
    ExecutionPlanEngine_createArchiveOldConditionOperation(
      confirmationExecution,
      executionContext
    );


  ExecutionPlanEngine_addOperation(
    executionPlan,
    archiveOldConditionOperation
  );




}









/**
 * Operation 1を生成する。
 *
 * 現在の成形条件を基に、
 * 新しい成形条件マスター行を
 * 「試験」状態で追加する。
 *
 * 新しい条件IDは採番せず、
 * NEW_CONDITION_ID Bindingを参照する。
 *
 * @param {Object} confirmationExecution
 * @param {Object} executionContext
 * @return {Object}
 */
function ExecutionPlanEngine_createInsertConditionOperation(
  confirmationExecution,
  executionContext
) {

  ExecutionPlanEngine_assertObject(
    confirmationExecution,
    "confirmationExecution"
  );


  ExecutionPlanEngine_assertObject(
    executionContext,
    "executionContext"
  );


  const operation =
    ExecutionPlanContract_createEmptyOperation();


  operation.operationId =
    "INSERT_NEW_CONDITION";


  operation.sequence =
    1;


  operation.operationType =
    EXECUTION_PLAN_OPERATION_INSERT;


  /*
  =========================================
  Target
  =========================================
  */

  operation.target.repository =
    "spreadsheet";


  operation.target.sheetName =
    "成形条件マスター";


  operation.target.entityType =
    "condition";


  /*
   * 新条件IDは実行時に確定するため、
   * target.entityIdにはまだ設定しない。
   *
   * 実際のIDはpayload内のbindingRefで表現する。
   */
  operation.target.entityId =
    null;


  /*
  =========================================
  Values
  =========================================
  */

  const values =
    ExecutionPlanEngine_deepCopy(
      executionContext.proposedCondition
    );


  values["条件ID"] =
    ExecutionPlanEngine_createBindingReference(
      "NEW_CONDITION_ID"
    );


  values["親条件ID"] =
    executionContext.currentConditionId;


  values["版数"] =
    executionContext.proposedVersion;


  /*
   * 現行ConditionUpdateEngineと同じく、
   * 新条件は一度「試験」で作成する。
   *
   * 後続Operationで「標準」へ変更する。
   */
  values["状態"] =
    "試験";


  values["変更理由"] =
    executionContext.reason;


  values["変更者"] =
    ExecutionPlanEngine_resolveChangedBy(
      confirmationExecution,
      values
    );


  /*
   * 実行時刻を暗黙生成せず、
   * Confirmation確定時刻を使用する。
   */
  values["最終更新日"] =
    ExecutionPlanEngine_requireNonEmptyString(
      confirmationExecution.decidedAt,
      "confirmationExecution.decidedAt"
    );


  operation.payload.values =
    values;


  operation.payload.criteria =
    null;


  /*
  =========================================
  Rollback
  =========================================
  */

  operation.rollback.supported =
    true;


  operation.rollback.operationType =
    EXECUTION_PLAN_OPERATION_DELETE;


  /*
   * 新条件IDだけでなく親条件IDも照合し、
   * 別の条件を誤って削除しないようにする。
   */
  operation.rollback.payload = {

    values:
      null,

    criteria: {

      "条件ID":
        ExecutionPlanEngine_createBindingReference(
          "NEW_CONDITION_ID"
        ),

      "親条件ID":
        executionContext.currentConditionId

    }

  };


  /*
  =========================================
  Metadata
  =========================================
  */

  operation.metadata.description =
    "現在の成形条件を複製し、新しい成形条件を試験状態で追加する";


  operation.metadata.sourcePath =
    "changePlan.proposedSnapshot.condition";


  return operation;

}


/**
 * Operation 2を生成する。
 *
 * 現在の成形条件詳細を基に、
 * 新しい成形条件詳細マスター行を追加する。
 *
 * 新しい条件IDは、
 * Operation 1と同じNEW_CONDITION_ID Bindingを参照する。
 *
 * @param {Object} executionContext
 * @return {Object}
 */
function ExecutionPlanEngine_createInsertConditionDetailOperation(
  executionContext
) {

  ExecutionPlanEngine_assertObject(
    executionContext,
    "executionContext"
  );


  const operation =
    ExecutionPlanContract_createEmptyOperation();


  operation.operationId =
    "INSERT_NEW_CONDITION_DETAIL";


  operation.sequence =
    2;


  operation.operationType =
    EXECUTION_PLAN_OPERATION_INSERT;


  /*
  =========================================
  Target
  =========================================
  */

  operation.target.repository =
    "spreadsheet";


  operation.target.sheetName =
    "成形条件詳細マスター";


  operation.target.entityType =
    "condition_detail";


  operation.target.entityId =
    null;


  /*
  =========================================
  Values
  =========================================
  */

  const values =
    ExecutionPlanEngine_deepCopy(
      executionContext.proposedConditionDetail
    );


  values["条件ID"] =
    ExecutionPlanEngine_createBindingReference(
      "NEW_CONDITION_ID"
    );


  operation.payload.values =
    values;


  operation.payload.criteria =
    null;


  /*
  =========================================
  Rollback
  =========================================
  */

  operation.rollback.supported =
    true;


  operation.rollback.operationType =
    EXECUTION_PLAN_OPERATION_DELETE;


  operation.rollback.payload = {

    values:
      null,

    criteria: {

      "条件ID":
        ExecutionPlanEngine_createBindingReference(
          "NEW_CONDITION_ID"
        )

    }

  };


  /*
  =========================================
  Metadata
  =========================================
  */

  operation.metadata.description =
    "新しい成形条件詳細を追加する";


  operation.metadata.sourcePath =
    "changePlan.proposedSnapshot.conditionDetail";


  return operation;

}



/**
 * Operation 3を生成する。
 *
 * Operation 1で「試験」として追加した新条件を、
 * 「標準」状態へ変更する。
 *
 * 現行ConditionUpdateEngineの実行順序を維持し、
 * Productの現在標準条件IDを切り替える前に実行する。
 *
 * @param {Object} confirmationExecution
 * @param {Object} executionContext
 * @return {Object}
 */
function ExecutionPlanEngine_createPromoteNewConditionOperation(
  confirmationExecution,
  executionContext
) {

  ExecutionPlanEngine_assertObject(
    confirmationExecution,
    "confirmationExecution"
  );


  ExecutionPlanEngine_assertObject(
    executionContext,
    "executionContext"
  );


  const operation =
    ExecutionPlanContract_createEmptyOperation();


  operation.operationId =
    "PROMOTE_NEW_CONDITION_TO_STANDARD";


  operation.sequence =
    3;


  operation.operationType =
    EXECUTION_PLAN_OPERATION_UPDATE;


  /*
  =========================================
  Target
  =========================================
  */

  operation.target.repository =
    "spreadsheet";


  operation.target.sheetName =
    "成形条件マスター";


  operation.target.entityType =
    "condition";


  /*
   * 新条件IDは実行時に採番されるため、
   * target.entityIdには設定しない。
   *
   * 更新対象はcriteria内のbindingRefで指定する。
   */
  operation.target.entityId =
    null;


  /*
  =========================================
  Values
  =========================================
  */

  operation.payload.values = {

    "状態":
      "標準",

    "最終更新日":
      ExecutionPlanEngine_requireNonEmptyString(
        confirmationExecution.decidedAt,
        "confirmationExecution.decidedAt"
      )

  };


  /*
   * 条件IDだけでなく、
   * 親条件IDと現在状態も照合する。
   *
   * これにより、意図しない条件や、
   * 既に状態が変わった条件を更新しない。
   */
  operation.payload.criteria = {

    "条件ID":
      ExecutionPlanEngine_createBindingReference(
        "NEW_CONDITION_ID"
      ),

    "親条件ID":
      executionContext.currentConditionId,

    "状態":
      "試験"

  };


  /*
  =========================================
  Rollback
  =========================================
  */

  operation.rollback.supported =
    true;


  operation.rollback.operationType =
    EXECUTION_PLAN_OPERATION_UPDATE;


  /*
   * Operation 3を取り消す場合は、
   * 新条件を「試験」へ戻す。
   *
   * Rollback時にも、
   * 条件ID・親条件ID・現在状態を照合する。
   */
  operation.rollback.payload = {

    values: {

      "状態":
        "試験",

      "最終更新日":
        ExecutionPlanEngine_requireNonEmptyString(
          confirmationExecution.decidedAt,
          "confirmationExecution.decidedAt"
        )

    },

    criteria: {

      "条件ID":
        ExecutionPlanEngine_createBindingReference(
          "NEW_CONDITION_ID"
        ),

      "親条件ID":
        executionContext.currentConditionId,

      "状態":
        "標準"

    }

  };


  /*
  =========================================
  Metadata
  =========================================
  */

  operation.metadata.description =
    "新しい成形条件を試験状態から標準状態へ変更する";


  operation.metadata.sourcePath =
    "changePlan.proposedSnapshot.condition.状態";


  return operation;

}




/**
 * Operation 4を生成する。
 *
 * 製品マスターの現在標準条件IDを、
 * 旧条件IDから新条件IDへ切り替える。
 *
 * 新条件IDは実行時に採番されるため、
 * NEW_CONDITION_ID Bindingを参照する。
 *
 * @param {Object} confirmationExecution
 * @param {Object} executionContext
 * @return {Object}
 */
function ExecutionPlanEngine_createSwitchProductConditionOperation(
  confirmationExecution,
  executionContext
) {

  ExecutionPlanEngine_assertObject(
    confirmationExecution,
    "confirmationExecution"
  );


  ExecutionPlanEngine_assertObject(
    executionContext,
    "executionContext"
  );


  const operation =
    ExecutionPlanContract_createEmptyOperation();


  operation.operationId =
    "SWITCH_PRODUCT_CURRENT_CONDITION";


  operation.sequence =
    4;


  operation.operationType =
    EXECUTION_PLAN_OPERATION_UPDATE;


  /*
  =========================================
  Target
  =========================================
  */

  operation.target.repository =
    "spreadsheet";


  operation.target.sheetName =
    "製品マスター";


  operation.target.entityType =
    "product";


  operation.target.entityId =
    executionContext.productId;


  /*
  =========================================
  Values
  =========================================
  */

  operation.payload.values = {

    "現在標準条件ID":
      ExecutionPlanEngine_createBindingReference(
        "NEW_CONDITION_ID"
      ),

    "最終更新日":
      ExecutionPlanEngine_requireNonEmptyString(
        confirmationExecution.decidedAt,
        "confirmationExecution.decidedAt"
      )

  };


  /*
   * 製品IDだけではなく、
   * 現在標準条件IDが確認時点の旧条件IDと
   * 一致することも更新条件とする。
   *
   * 確認後に別の更新が行われていた場合は、
   * 上書きせず失敗させる。
   */
  operation.payload.criteria = {

    "製品ID":
      executionContext.productId,

    "現在標準条件ID":
      executionContext.currentConditionId

  };


  /*
  =========================================
  Rollback
  =========================================
  */

  operation.rollback.supported =
    true;


  operation.rollback.operationType =
    EXECUTION_PLAN_OPERATION_UPDATE;


  /*
   * Rollbackでは、
   * 製品が新条件を参照している場合に限り、
   * 旧条件IDへ戻す。
   */
  operation.rollback.payload = {

    values: {

      "現在標準条件ID":
        executionContext.currentConditionId,

      "最終更新日":
        ExecutionPlanEngine_requireNonEmptyString(
          confirmationExecution.decidedAt,
          "confirmationExecution.decidedAt"
        )

    },

    criteria: {

      "製品ID":
        executionContext.productId,

      "現在標準条件ID":
        ExecutionPlanEngine_createBindingReference(
          "NEW_CONDITION_ID"
        )

    }

  };


  /*
  =========================================
  Metadata
  =========================================
  */

  operation.metadata.description =
    "製品の現在標準条件IDを旧条件から新条件へ切り替える";


  operation.metadata.sourcePath =
    "changePlan.proposedSnapshot.product.現在標準条件ID";


  return operation;

}




/**
 * Operation 5を生成する。
 *
 * Productの現在標準条件IDを新条件へ切り替えた後、
 * 旧条件を「標準」から「旧版」へ変更する。
 *
 * @param {Object} confirmationExecution
 * @param {Object} executionContext
 * @return {Object}
 */
function ExecutionPlanEngine_createArchiveOldConditionOperation(
  confirmationExecution,
  executionContext
) {

  ExecutionPlanEngine_assertObject(
    confirmationExecution,
    "confirmationExecution"
  );


  ExecutionPlanEngine_assertObject(
    executionContext,
    "executionContext"
  );


  const operation =
    ExecutionPlanContract_createEmptyOperation();


  operation.operationId =
    "ARCHIVE_OLD_STANDARD_CONDITION";


  operation.sequence =
    5;


  operation.operationType =
    EXECUTION_PLAN_OPERATION_UPDATE;


  /*
  =========================================
  Target
  =========================================
  */

  operation.target.repository =
    "spreadsheet";


  operation.target.sheetName =
    "成形条件マスター";


  operation.target.entityType =
    "condition";


  operation.target.entityId =
    executionContext.currentConditionId;


  /*
  =========================================
  Values
  =========================================
  */

  operation.payload.values = {

    "状態":
      "旧版",

    "最終更新日":
      ExecutionPlanEngine_requireNonEmptyString(
        confirmationExecution.decidedAt,
        "confirmationExecution.decidedAt"
      )

  };


  /*
   * 旧条件IDだけでなく、
   * 対象製品ID・状態・版数も照合する。
   *
   * 確認後に旧条件の状態や版数が変化していた場合は、
   * 意図せず上書きせず失敗させる。
   */
  operation.payload.criteria = {

    "条件ID":
      executionContext.currentConditionId,

    "製品ID":
      executionContext.productId,

    "版数":
      executionContext.currentVersion,

    "状態":
      "標準"

  };


  /*
  =========================================
  Rollback
  =========================================
  */

  operation.rollback.supported =
    true;


  operation.rollback.operationType =
    EXECUTION_PLAN_OPERATION_UPDATE;


  /*
   * Operation 5を取り消す場合は、
   * 旧条件が「旧版」である場合に限り
   * 「標準」へ戻す。
   */
  operation.rollback.payload = {

    values: {

      "状態":
        "標準",

      "最終更新日":
        ExecutionPlanEngine_requireNonEmptyString(
          confirmationExecution.decidedAt,
          "confirmationExecution.decidedAt"
        )

    },

    criteria: {

      "条件ID":
        executionContext.currentConditionId,

      "製品ID":
        executionContext.productId,

      "版数":
        executionContext.currentVersion,

      "状態":
        "旧版"

    }

  };


  /*
  =========================================
  Metadata
  =========================================
  */

  operation.metadata.description =
    "旧標準成形条件を標準状態から旧版状態へ変更する";


  operation.metadata.sourcePath =
    "changePlan.currentSnapshot.condition.状態";


  return operation;

}




 









/**
 * OperationをExecution Planへ追加する。
 *
 * sequenceは、追加時点の配列順と
 * 一致しなければならない。
 *
 * operationIdの重複も拒否する。
 *
 * @param {Object} executionPlan
 * @param {Object} operation
 */
function ExecutionPlanEngine_addOperation(
  executionPlan,
  operation
) {

  ExecutionPlanEngine_assertObject(
    executionPlan,
    "executionPlan"
  );


  ExecutionPlanEngine_assertObject(
    operation,
    "operation"
  );


  if (
    !Array.isArray(
      executionPlan.operations
    )
  ) {

    throw new Error(
      "executionPlan.operationsはArrayである必要があります。"
    );

  }


  const expectedSequence =
    executionPlan.operations.length +
    1;


  if (
    operation.sequence !==
      expectedSequence
  ) {

    throw new Error(
      "追加するOperationのsequenceが不正です。" +
      " expected=" +
      expectedSequence +
      " actual=" +
      operation.sequence
    );

  }


  const duplicated =
    executionPlan.operations.some(
      function(existingOperation) {

        return (
          existingOperation &&
          existingOperation.operationId ===
            operation.operationId
        );

      }
    );


  if (
    duplicated
  ) {

    throw new Error(
      "Execution Planに重複したoperationIdを追加できません。" +
      " operationId=" +
      operation.operationId
    );

  }


  executionPlan.operations.push(
    ExecutionPlanEngine_deepCopy(
      operation
    )
  );

}









/*
=========================================
Execution Policy
=========================================
*/

/**
 * Execution Planの実行方針を設定する。
 *
 * Spreadsheetでは真のDB Transactionではなく、
 * 失敗時に逆操作を行う補償型Transactionとして扱う。
 *
 * @param {Object} executionPlan
 */
function ExecutionPlanEngine_buildExecutionPolicy(
  executionPlan
) {

  ExecutionPlanEngine_assertObject(
    executionPlan,
    "executionPlan"
  );


  executionPlan.executionPolicy.atomic =
    true;


  executionPlan.executionPolicy.stopOnError =
    true;


  executionPlan.executionPolicy.rollbackRequired =
    true;

}







/*
=========================================
Metadata
=========================================
*/

/**
 * Execution PlanのMetadataを設定する。
 *
 * @param {Object} executionPlan
 * @param {Object} confirmationExecution
 */
function ExecutionPlanEngine_buildMetadata(
  executionPlan,
  confirmationExecution
) {

  ExecutionPlanEngine_assertObject(
    executionPlan,
    "executionPlan"
  );


  ExecutionPlanEngine_assertObject(
    confirmationExecution,
    "confirmationExecution"
  );


  executionPlan.metadata.source =
    "confirmation_execution";


  executionPlan.metadata.requestId =
    confirmationExecution.metadata &&
    typeof confirmationExecution
      .metadata
      .requestId ===
        "string" &&
    confirmationExecution
      .metadata
      .requestId
      .trim() !==
        ""
      ? confirmationExecution
          .metadata
          .requestId
          .trim()
      : null;


  /*
   * proposalIdを、確認から実行までを追跡する
   * correlationIdとして使用する。
   */
  executionPlan.metadata.correlationId =
    ExecutionPlanEngine_requireNonEmptyString(
      confirmationExecution.proposalId,
      "confirmationExecution.proposalId"
    );

}





/*
=========================================
Finalize
=========================================
*/

/**
 * Execution Planを実行可能な状態へ確定する。
 *
 * 全項目を設定した後にContract検証を行う。
 *
 * @param {Object} executionPlan
 * @param {Object} confirmationExecution
 */
function ExecutionPlanEngine_finalize(
  executionPlan,
  confirmationExecution
) {

  ExecutionPlanEngine_assertObject(
    executionPlan,
    "executionPlan"
  );


  ExecutionPlanEngine_assertObject(
    confirmationExecution,
    "confirmationExecution"
  );


  executionPlan.executionPlanId =
    ExecutionPlanEngine_createExecutionPlanId();


  executionPlan.createdAt =
    ExecutionPlanEngine_requireNonEmptyString(
      confirmationExecution.decidedAt,
      "confirmationExecution.decidedAt"
    );


  const decidedBy =
    confirmationExecution.metadata &&
    typeof confirmationExecution
      .metadata
      .decidedBy ===
        "string"
      ? confirmationExecution
          .metadata
          .decidedBy
          .trim()
      : "";


  executionPlan.createdBy =
    decidedBy ||
    null;


  executionPlan.status =
    EXECUTION_PLAN_STATUS_READY;


  executionPlan.executable =
    true;


  /*
   * Transaction Engineへ渡す前の
   * 最終Contract検証。
   */
  ExecutionPlanContract_validate(
    executionPlan
  );

}



















/*
=========================================
Utility
=========================================
*/

/**
 * JSON互換値を複製する。
 *
 * @param {*} value
 * @return {*}
 */
function ExecutionPlanEngine_deepCopy(
  value
) {

  return JSON.parse(
    JSON.stringify(
      value
    )
  );

}



/**
 * 空でないstringを返す。
 *
 * @param {*} value
 * @param {string} label
 * @return {string}
 */
function ExecutionPlanEngine_requireNonEmptyString(
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


  return value.trim();

}


/**
 * 有限のnumberを返す。
 *
 * 数値文字列も許可する。
 *
 * @param {*} value
 * @param {string} label
 * @return {number}
 */
function ExecutionPlanEngine_requireFiniteNumber(
  value,
  label
) {

  const numericValue =
    Number(
      value
    );


  if (
    !Number.isFinite(
      numericValue
    )
  ) {

    throw new Error(
      label +
      "は有限のnumberである必要があります。"
    );

  }


  return numericValue;

}



/**
 * Runtime Bindingへの参照Objectを生成する。
 *
 * bindingRef Objectには、
 * bindingRef以外の項目を含めない。
 *
 * @param {string} bindingId
 * @return {Object}
 */
function ExecutionPlanEngine_createBindingReference(
  bindingId
) {

  const normalizedBindingId =
    ExecutionPlanEngine_requireNonEmptyString(
      bindingId,
      "bindingId"
    );


  return {

    bindingRef:
      normalizedBindingId

  };

}


/**
 * 新条件の変更者表示を決定する。
 *
 * Confirmation ExecutionのdecidedByを優先し、
 * 存在しない場合だけChange Plan内の値を使用する。
 *
 * @param {Object} confirmationExecution
 * @param {Object} conditionValues
 * @return {string}
 */
function ExecutionPlanEngine_resolveChangedBy(
  confirmationExecution,
  conditionValues
) {

  ExecutionPlanEngine_assertObject(
    confirmationExecution,
    "confirmationExecution"
  );


  ExecutionPlanEngine_assertObject(
    conditionValues,
    "conditionValues"
  );


  const decidedBy =
    confirmationExecution.metadata &&
    typeof confirmationExecution
      .metadata
      .decidedBy ===
        "string"
      ? confirmationExecution
          .metadata
          .decidedBy
          .trim()
      : "";


  if (
    decidedBy
  ) {

    return decidedBy;

  }


  const existingChangedBy =
    typeof conditionValues["変更者"] ===
      "string"
      ? conditionValues["変更者"].trim()
      : "";


  if (
    existingChangedBy
  ) {

    return existingChangedBy;

  }


  throw new Error(
    "新しい成形条件の変更者を取得できません。"
  );

}



/**
 * Execution Plan IDを生成する。
 *
 * 永続Storageは更新しない。
 * Ver.1.0ではUUIDを使用する。
 *
 * @return {string}
 */
function ExecutionPlanEngine_createExecutionPlanId() {

  let uniquePart =
    null;


  if (
    typeof Utilities !==
      "undefined" &&
    Utilities &&
    typeof Utilities.getUuid ===
      "function"
  ) {

    uniquePart =
      Utilities
        .getUuid()
        .replace(
          /-/g,
          ""
        )
        .toUpperCase();

  } else {

    uniquePart =
      String(
        new Date().getTime()
      ) +
      "_" +
      String(
        Math.floor(
          Math.random() *
          1000000000
        )
      );

  }


  return (
    "EXECUTION-PLAN-" +
    uniquePart
  );

}















/*
=========================================
Assertion
=========================================
*/

/**
 * Objectであることを確認する。
 *
 * @param {*} value
 * @param {string} label
 */
function ExecutionPlanEngine_assertObject(
  value,
  label
) {

  if (
    value ===
      null ||
    typeof value !==
      "object" ||
    Array.isArray(
      value
    )
  ) {

    throw new Error(
      label +
      "はObjectである必要があります。"
    );

  }

}






