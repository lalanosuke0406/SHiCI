/*
=========================================
SHiCI
111_RuntimeBindingResolverTest.js

Runtime Binding Resolver Test
Version 1.0
=========================================
*/


/*
=========================================
Test Runner
=========================================
*/

/**
 * RuntimeBindingResolverの全テストを実行する。
 */
function test_RuntimeBindingResolver_runAll() {

  const tests = [

    {
      name:
        "resolveBindingMap",
      run:
        test_RuntimeBindingResolver_resolveBindingMap
    },

    {
      name:
        "resolveBindingResults",
      run:
        test_RuntimeBindingResolver_resolveBindingResults
    },

    {
      name:
        "resolveNestedBindingReference",
      run:
        test_RuntimeBindingResolver_resolveNestedBindingReference
    },

    {
      name:
        "executionPlanIsNotModified",
      run:
        test_RuntimeBindingResolver_executionPlanIsNotModified
    },

    {
      name:
        "reuseExistingResolvedValue",
      run:
        test_RuntimeBindingResolver_reuseExistingResolvedValue
    },

    {
      name:
        "undefinedBindingReferenceIsRejected",
      run:
        test_RuntimeBindingResolver_undefinedBindingReferenceIsRejected
    },

    {
      name:
        "generatorOverrideIsCleared",
      run:
        test_RuntimeBindingResolver_generatorOverrideIsCleared
    }

  ];


  const failures =
    [];


  console.log(
    "========================================="
  );

  console.log(
    "RuntimeBindingResolver Test Start"
  );

  console.log(
    "========================================="
  );


  try {

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

        } finally {

          RuntimeBindingResolver_clearIdGeneratorOverride();

        }

      }
    );

  } finally {

    RuntimeBindingResolver_clearIdGeneratorOverride();

  }


  if (
    failures.length >
      0
  ) {

    throw new Error(
      "RuntimeBindingResolver Test Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  console.log(
    "[Runtime Binding Resolver Ver.1.1 Test Passed]"
  );

}


/*
=========================================
Binding Map
=========================================
*/

/**
 * Runtime BindingがBinding Mapへ
 * 正しく解決されることを確認する。
 */
function test_RuntimeBindingResolver_resolveBindingMap() {

  RuntimeBindingResolver_setIdGeneratorOverride(
    function(prefix) {

      RuntimeBindingResolverTest_assertEquals(
        "COND",
        prefix,
        "generator prefix"
      );


      return "COND-TEST-000001";

    }
  );


  const executionPlan =
    RuntimeBindingResolverTest_createExecutionPlanFixture();


  const result =
    RuntimeBindingResolver_resolve(
      executionPlan
    );


  RuntimeBindingResolverTest_assertObject(
    result,
    "result"
  );


  RuntimeBindingResolverTest_assertObject(
    result.bindingMap,
    "result.bindingMap"
  );


  RuntimeBindingResolverTest_assertEquals(
    "COND-TEST-000001",
    result.bindingMap.NEW_CONDITION_ID,
    "result.bindingMap.NEW_CONDITION_ID"
  );

}


/*
=========================================
Binding Results
=========================================
*/

/**
 * Execution Result用Binding Resultが
 * 正しく生成されることを確認する。
 */
function test_RuntimeBindingResolver_resolveBindingResults() {

  RuntimeBindingResolver_setIdGeneratorOverride(
    function() {

      return "COND-TEST-000002";

    }
  );


  const executionPlan =
    RuntimeBindingResolverTest_createExecutionPlanFixture();


  const result =
    RuntimeBindingResolver_resolve(
      executionPlan
    );


  RuntimeBindingResolverTest_assertArrayLength(
    1,
    result.bindingResults,
    "result.bindingResults"
  );


  const bindingResult =
    result.bindingResults[0];


  RuntimeBindingResolverTest_assertEquals(
    "NEW_CONDITION_ID",
    bindingResult.bindingId,
    "bindingResult.bindingId"
  );


  RuntimeBindingResolverTest_assertEquals(
    "COND-TEST-000002",
    bindingResult.resolvedValue,
    "bindingResult.resolvedValue"
  );


  RuntimeBindingResolverTest_assertEquals(
    true,
    bindingResult.resolved,
    "bindingResult.resolved"
  );


  ExecutionResultContract_validateBindings(
    result.bindingResults
  );

}


/*
=========================================
Binding Reference Resolution
=========================================
*/

/**
 * Object・Array内に入れ子になったbindingRefが
 * 再帰的に解決されることを確認する。
 */
function test_RuntimeBindingResolver_resolveNestedBindingReference() {

  const originalValue = {

    direct: {

      bindingRef:
        "NEW_CONDITION_ID"

    },

    nested: {

      values: [

        "unchanged",

        {

          conditionId: {

            bindingRef:
              "NEW_CONDITION_ID"

          }

        }

      ]

    }

  };


  const originalJson =
    JSON.stringify(
      originalValue
    );


  const resolvedValue =
    RuntimeBindingResolver_resolveValue(
      originalValue,
      {

        NEW_CONDITION_ID:
          "COND-TEST-000003"

      },
      "payload"
    );


  RuntimeBindingResolverTest_assertEquals(
    "COND-TEST-000003",
    resolvedValue.direct,
    "resolvedValue.direct"
  );


  RuntimeBindingResolverTest_assertEquals(
    "unchanged",
    resolvedValue.nested.values[0],
    "resolvedValue.nested.values[0]"
  );


  RuntimeBindingResolverTest_assertEquals(
    "COND-TEST-000003",
    resolvedValue
      .nested
      .values[1]
      .conditionId,
    "resolvedValue.nested.values[1].conditionId"
  );


  RuntimeBindingResolverTest_assertEquals(
    originalJson,
    JSON.stringify(
      originalValue
    ),
    "originalValue"
  );

}


/*
=========================================
Execution Plan Immutability
=========================================
*/

/**
 * Binding解決によってExecution Plan原本が
 * 変更されないことを確認する。
 */
function test_RuntimeBindingResolver_executionPlanIsNotModified() {

  RuntimeBindingResolver_setIdGeneratorOverride(
    function() {

      return "COND-TEST-000004";

    }
  );


  const executionPlan =
    RuntimeBindingResolverTest_createExecutionPlanFixture();


  const originalJson =
    JSON.stringify(
      executionPlan
    );


  RuntimeBindingResolver_resolve(
    executionPlan
  );


  RuntimeBindingResolverTest_assertEquals(
    originalJson,
    JSON.stringify(
      executionPlan
    ),
    "executionPlan"
  );


  RuntimeBindingResolverTest_assertEquals(
    null,
    executionPlan.bindings[0].resolvedValue,
    "executionPlan.bindings[0].resolvedValue"
  );


  RuntimeBindingResolverTest_assertBindingReference(
    executionPlan
      .operations[0]
      .payload
      .values["条件ID"],
    "NEW_CONDITION_ID",
    "executionPlan.operations[0].payload.values.条件ID"
  );

}


/*
=========================================
Existing Resolved Value
=========================================
*/

/**
 * resolvedValueが既に存在するBindingでは
 * Generatorを呼ばずに既存値を再利用することを確認する。
 */
function test_RuntimeBindingResolver_reuseExistingResolvedValue() {

  let generatorCalled =
    false;


  RuntimeBindingResolver_setIdGeneratorOverride(
    function() {

      generatorCalled =
        true;

      return "COND-SHOULD-NOT-BE-USED";

    }
  );


  const executionPlan =
    RuntimeBindingResolverTest_createExecutionPlanFixture();


  executionPlan.bindings[0].resolvedValue =
    "COND-EXISTING-000001";


  const result =
    RuntimeBindingResolver_resolve(
      executionPlan
    );


  RuntimeBindingResolverTest_assertEquals(
    false,
    generatorCalled,
    "generatorCalled"
  );


  RuntimeBindingResolverTest_assertEquals(
    "COND-EXISTING-000001",
    result.bindingMap.NEW_CONDITION_ID,
    "result.bindingMap.NEW_CONDITION_ID"
  );


  RuntimeBindingResolverTest_assertEquals(
    "COND-EXISTING-000001",
    result.bindingResults[0].resolvedValue,
    "result.bindingResults[0].resolvedValue"
  );

}


/*
=========================================
Undefined Binding Reference
=========================================
*/

/**
 * Binding Mapに存在しないbindingRefを
 * 解決しようとした場合に例外となることを確認する。
 */
function test_RuntimeBindingResolver_undefinedBindingReferenceIsRejected() {

  RuntimeBindingResolverTest_assertThrows(

    function() {

      RuntimeBindingResolver_resolveValue(
        {

          conditionId: {

            bindingRef:
              "UNKNOWN_BINDING"

          }

        },
        {

          NEW_CONDITION_ID:
            "COND-TEST-000005"

        },
        "payload"
      );

    },

    "未解決のbindingRefです。",

    "undefined bindingRef"

  );

}


/*
=========================================
Generator Override
=========================================
*/

/**
 * clearIdGeneratorOverride()によって
 * Overrideが解除されることを確認する。
 *
 * 本番generateId()は呼び出さないため、
 * 内部保持変数の状態のみ確認する。
 */
function test_RuntimeBindingResolver_generatorOverrideIsCleared() {

  const override =
    function() {

      return "COND-TEST-000006";

    };


  RuntimeBindingResolver_setIdGeneratorOverride(
    override
  );


  RuntimeBindingResolverTest_assertEquals(
    override,
    RuntimeBindingResolver_idGeneratorOverride,
    "idGeneratorOverride before clear"
  );


  RuntimeBindingResolver_clearIdGeneratorOverride();


  RuntimeBindingResolverTest_assertEquals(
    null,
    RuntimeBindingResolver_idGeneratorOverride,
    "idGeneratorOverride after clear"
  );

}


/*
=========================================
Fixture
=========================================
*/

/**
 * RuntimeBindingResolver用の
 * 正常なExecution Planを生成する。
 *
 * Spreadsheetへの書き込みは行わない。
 *
 * @return {Object}
 */
function RuntimeBindingResolverTest_createExecutionPlanFixture() {

  const executionPlan =
    ExecutionPlanContract_createEmpty();


  executionPlan.executionPlanId =
    "EXECUTION-PLAN-RUNTIME-BINDING-TEST-001";


  executionPlan.changePlanId =
    "CHANGE-PLAN-RUNTIME-BINDING-TEST-001";


  executionPlan.proposalId =
    "PROPOSAL-RUNTIME-BINDING-TEST-001";


  executionPlan.status =
    EXECUTION_PLAN_STATUS_READY;


  executionPlan.subject.entityType =
    "product";

  executionPlan.subject.entityId =
    "P-000035";

  executionPlan.subject.entityName =
    "LEVER, CLAMP";


  executionPlan.bindings = [

    RuntimeBindingResolverTest_createBinding()

  ];


  executionPlan.operations = [

    RuntimeBindingResolverTest_createOperation()

  ];


  executionPlan.executionPolicy.atomic =
    true;

  executionPlan.executionPolicy.stopOnError =
    true;

  executionPlan.executionPolicy.rollbackRequired =
    true;


  executionPlan.executable =
    true;


  executionPlan.createdAt =
    "2026-08-04T00:00:00.000Z";


  executionPlan.createdBy =
    "RuntimeBindingResolverTest";


  executionPlan.metadata.source =
    "unit_test";

  executionPlan.metadata.requestId =
    "REQUEST-RUNTIME-BINDING-TEST-001";

  executionPlan.metadata.correlationId =
    "CORRELATION-RUNTIME-BINDING-TEST-001";


  ExecutionPlanContract_validate(
    executionPlan
  );


  return executionPlan;

}


/**
 * 正常なRuntime Bindingを生成する。
 *
 * @return {Object}
 */
function RuntimeBindingResolverTest_createBinding() {

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
    "Runtime Binding Resolver Test";


  return binding;

}


/**
 * bindingRefを含む正常なOperationを生成する。
 *
 * @return {Object}
 */
function RuntimeBindingResolverTest_createOperation() {

  const operation =
    ExecutionPlanContract_createEmptyOperation();


  operation.operationId =
    "INSERT_RUNTIME_BINDING_TEST";


  operation.sequence =
    1;


  operation.operationType =
    EXECUTION_PLAN_OPERATION_INSERT;


  operation.target.repository =
    "spreadsheet";

  operation.target.sheetName =
    "成形条件マスター";

  operation.target.entityType =
    "condition";

  operation.target.entityId =
    null;


  operation.payload.values = {

    "条件ID": {

      bindingRef:
        "NEW_CONDITION_ID"

    },

    "製品ID":
      "P-000035",

    "状態":
      "試験"

  };


  operation.payload.criteria =
    null;


  operation.rollback.supported =
    true;


  operation.rollback.operationType =
    EXECUTION_PLAN_OPERATION_DELETE;


  operation.rollback.payload = {

    values:
      null,

    criteria: {

      "条件ID": {

        bindingRef:
          "NEW_CONDITION_ID"

      }

    }

  };


  operation.metadata.description =
    "Runtime Binding Resolver Test Operation";


  operation.metadata.sourcePath =
    "test.operation";


  return operation;

}


/*
=========================================
Assertion
=========================================
*/

/**
 * 値が一致することを確認する。
 */
function RuntimeBindingResolverTest_assertEquals(
  expected,
  actual,
  label
) {

  if (
    expected !==
      actual
  ) {

    throw new Error(
      "[AssertEquals Failed] " +
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
 * Objectであることを確認する。
 */
function RuntimeBindingResolverTest_assertObject(
  actual,
  label
) {

  if (
    actual ===
      null ||
    typeof actual !==
      "object" ||
    Array.isArray(
      actual
    )
  ) {

    throw new Error(
      "[AssertObject Failed] " +
      label +
      " actual=" +
      JSON.stringify(
        actual
      )
    );

  }

}


/**
 * Arrayの件数を確認する。
 */
function RuntimeBindingResolverTest_assertArrayLength(
  expectedLength,
  actual,
  label
) {

  if (
    !Array.isArray(
      actual
    )
  ) {

    throw new Error(
      "[AssertArrayLength Failed] " +
      label +
      "はArrayではありません。"
    );

  }


  RuntimeBindingResolverTest_assertEquals(
    expectedLength,
    actual.length,
    label +
    ".length"
  );

}


/**
 * bindingRef Objectを確認する。
 */
function RuntimeBindingResolverTest_assertBindingReference(
  actual,
  expectedBindingId,
  label
) {

  RuntimeBindingResolverTest_assertObject(
    actual,
    label
  );


  RuntimeBindingResolverTest_assertEquals(
    1,
    Object.keys(
      actual
    ).length,
    label +
    ".keys.length"
  );


  RuntimeBindingResolverTest_assertEquals(
    expectedBindingId,
    actual.bindingRef,
    label +
    ".bindingRef"
  );

}


/**
 * 例外が発生することを確認する。
 */
function RuntimeBindingResolverTest_assertThrows(
  callback,
  expectedMessage,
  label
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
      "[AssertThrows Failed] " +
      label +
      " 例外が発生しませんでした。"
    );

  }


  if (
    expectedMessage !==
      null &&
    String(
      thrownError.message
    ).indexOf(
      expectedMessage
    ) ===
      -1
  ) {

    throw new Error(
      "[AssertThrows Failed] " +
      label +
      " expectedMessage=" +
      JSON.stringify(
        expectedMessage
      ) +
      " actualMessage=" +
      JSON.stringify(
        thrownError.message
      )
    );

  }

}