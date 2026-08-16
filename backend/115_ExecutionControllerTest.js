/*
=========================================
SHiCI

Execution Controller Test

Version 1.0
=========================================
*/


/*
=========================================
Runner
=========================================
*/

/**
 * ExecutionControllerの全テストを実行する。
 */
function test_ExecutionController_runAll() {

  const tests = [

    {
      name:
        "success",
      run:
        test_ExecutionController_success
    },

    {
      name:
        "rolledBack",
      run:
        test_ExecutionController_rolledBack
    },

    {
      name:
        "failed",
      run:
        test_ExecutionController_failed
    },

    {
      name:
        "resultValidation",
      run:
        test_ExecutionController_resultValidation
    },

    {
      name:
        "metadata",
      run:
        test_ExecutionController_metadata
    },

    {
      name:
        "pendingConsumed",
      run:
        test_ExecutionController_pendingConsumed
    },

    {
        name:
            "holdingTimeT1Success",
        run:
            test_ExecutionController_holdingTimeT1Success
    },

  ];


  const failures =
    [];


  console.log(
    "========================================="
  );

  console.log(
    "ExecutionController Test Start"
  );

  console.log(
    "========================================="
  );


  try {

    tests.forEach(
      function(test) {

        try {

          ExecutionControllerTest_clearEnvironment();


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

          ExecutionControllerTest_clearEnvironment();

        }

      }
    );

  } finally {

    ExecutionControllerTest_clearEnvironment();

  }


  if (
    failures.length >
      0
  ) {

    throw new Error(
      "ExecutionController Test Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  console.log(
    "[Execution Controller Ver.1.0 Test Passed]"
  );

}









/*
=========================================
Common Validation
=========================================
*/

function ExecutionControllerTest_validateResult(
  result
) {

  ExecutionController_validateResult(
    result
  );


  ExecutionControllerTest_assertEquals(

    "1.0",

    result.schemaVersion,

    "schemaVersion"

  );


  ExecutionControllerTest_assertEquals(

    "1.0",

    result.controllerVersion,

    "controllerVersion"

  );

}






/*
=========================================
Part 2

Success Test
・Pending Change Fixture
・Fake Spreadsheet
・Test Environment
=========================================
*/


/*
=========================================
Success
=========================================
*/

/**
 * ConfirmationからTransactionまで
 * 正常に完了することを確認する。
 */
function test_ExecutionController_success() {

  const fixture =
    ExecutionControllerTest_createSuccessFixture();


  try {

    const result =
      ExecutionController_confirmAndExecute(
        fixture.proposal.proposalId,
        fixture.changePlan.changePlanId,
        {

          source:
            "execution_controller_test",

          decidedBy:
            "USER_EXECUTION_CONTROLLER_TEST",

          requestId:
            "REQUEST_EXECUTION_CONTROLLER_TEST_SUCCESS"

        }
      );


    ExecutionControllerTest_validateResult(
      result
    );


    ExecutionControllerTest_assertEquals(
      EXECUTION_CONTROLLER_STATUS_COMPLETED,
      result.status,
      "result.status"
    );


    ExecutionControllerTest_assertEquals(
      fixture.proposal.proposalId,
      result.proposalId,
      "result.proposalId"
    );


    ExecutionControllerTest_assertEquals(
      fixture.changePlan.changePlanId,
      result.changePlanId,
      "result.changePlanId"
    );


    ExecutionControllerTest_assertTrue(
      typeof result.executionPlanId ===
        "string" &&
      result.executionPlanId.indexOf(
        "EXECUTION-PLAN-"
      ) ===
        0,
      "result.executionPlanId"
    );


    ExecutionControllerTest_assertTrue(
      typeof result.executionResultId ===
        "string" &&
      result.executionResultId.indexOf(
        "EXECUTION-RESULT-"
      ) ===
        0,
      "result.executionResultId"
    );


    ExecutionControllerTest_assertEquals(
      "confirmed",
      result.confirmationExecution.status,
      "result.confirmationExecution.status"
    );


    ExecutionControllerTest_assertEquals(
      "confirm",
      result.confirmationExecution.actionType,
      "result.confirmationExecution.actionType"
    );


    ExecutionControllerTest_assertEquals(
      "USER_EXECUTION_CONTROLLER_TEST",
      result.confirmationExecution.decidedBy,
      "result.confirmationExecution.decidedBy"
    );


    ExecutionControllerTest_assertEquals(
      EXECUTION_RESULT_STATUS_SUCCESS,
      result.executionResult.status,
      "result.executionResult.status"
    );


    ExecutionControllerTest_assertEquals(
      5,
      result.executionResult.operations.length,
      "result.executionResult.operations.length"
    );


    result.executionResult.operations.forEach(
      function(operationResult, index) {

        ExecutionControllerTest_assertEquals(
          EXECUTION_OPERATION_STATUS_SUCCESS,
          operationResult.status,
          "result.executionResult.operations[" +
          index +
          "].status"
        );

      }
    );


    ExecutionControllerTest_assertEquals(
      false,
      result.executionResult.rollback.performed,
      "result.executionResult.rollback.performed"
    );


    ExecutionControllerTest_assertEquals(
      EXECUTION_ROLLBACK_STATUS_NONE,
      result.executionResult.rollback.status,
      "result.executionResult.rollback.status"
    );


    ExecutionControllerTest_assertEquals(
      0,
      result.executionResult.errors.length,
      "result.executionResult.errors.length"
    );


    /*
    =========================================
    Binding Result
    =========================================
    */

    ExecutionControllerTest_assertEquals(
      1,
      result.executionResult.bindings.length,
      "result.executionResult.bindings.length"
    );


    ExecutionControllerTest_assertEquals(
      "NEW_CONDITION_ID",
      result.executionResult.bindings[0].bindingId,
      "result.executionResult.bindings[0].bindingId"
    );


    ExecutionControllerTest_assertEquals(
      "COND-EXECUTION-CONTROLLER-TEST-001",
      result.executionResult.bindings[0].resolvedValue,
      "result.executionResult.bindings[0].resolvedValue"
    );


    ExecutionControllerTest_assertEquals(
      true,
      result.executionResult.bindings[0].resolved,
      "result.executionResult.bindings[0].resolved"
    );


    /*
    =========================================
    Spreadsheet Result
    =========================================
    */

    ExecutionControllerTest_validateSuccessSpreadsheet(
      fixture
    );

  } finally {

    ExecutionControllerTest_clearEnvironment();

  }

}


/*
=========================================
Success Fixture
=========================================
*/

/**
 * ExecutionControllerの正常実行Fixtureを生成する。
 *
 * 実際のEntity Mutationから
 * Change PlanとConfirmation Proposalを生成する。
 *
 * Spreadsheet更新先はFake Spreadsheetとする。
 *
 * @return {Object}
 */
function ExecutionControllerTest_createSuccessFixture() {

  const pendingFixture =
    ExecutionControllerTest_createPendingChangeFixture();


  const spreadsheet =
    ExecutionControllerTest_createSpreadsheetForChangePlan(
      pendingFixture.changePlan
    );


  ExecutionControllerTest_prepareEnvironment(
    spreadsheet
  );


  return {

    mutation:
      pendingFixture.mutation,

    resolutionResult:
      pendingFixture.resolutionResult,

    changePlan:
      pendingFixture.changePlan,

    proposal:
      pendingFixture.proposal,

    spreadsheet:
      spreadsheet

  };

}


/**
 * 実際の処理経路を通して、
 * Pending Changeを作成する。
 *
 * @return {Object}
 */
function ExecutionControllerTest_createPendingChangeFixture() {

  /*
  =========================================
  Entity Mutation
  =========================================
  */

  const mutation =
    EntityMutationContract_createEmpty();


  mutation.mutationId =
    "MUTATION_EXECUTION_CONTROLLER_TEST_" +
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
    "execution_controller_test";


  mutation.metadata.requestedBy =
    "USER_EXECUTION_CONTROLLER_TEST";


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


  ExecutionControllerTest_assertEquals(
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


  ExecutionControllerTest_assertEquals(
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


  return {

    mutation:
      mutation,

    resolutionResult:
      resolutionResult,

    changePlan:
      changePlan,

    proposal:
      proposal

  };

}


/*
=========================================
Test Environment
=========================================
*/

/**
 * Fake Spreadsheetと
 * テスト用ID Generatorを設定する。
 *
 * @param {Object} spreadsheet
 */
function ExecutionControllerTest_prepareEnvironment(
  spreadsheet
) {

  SpreadsheetRepository_setSpreadsheetOverride(
    spreadsheet
  );


  RuntimeBindingResolver_setIdGeneratorOverride(
    function(prefix) {

      ExecutionControllerTest_assertEquals(
        "COND",
        prefix,
        "Runtime Binding prefix"
      );


      return "COND-EXECUTION-CONTROLLER-TEST-001";

    }
  );

}


/**
 * テスト用Overrideを解除する。
 */
function ExecutionControllerTest_clearEnvironment() {

  SpreadsheetRepository_clearSpreadsheetOverride();


  RuntimeBindingResolver_clearIdGeneratorOverride();

}


/*
=========================================
Spreadsheet Fixture Builder
=========================================
*/

/**
 * Change PlanのSnapshotから、
 * 正常実行に必要なFake Spreadsheetを生成する。
 *
 * @param {Object} changePlan
 * @return {Object}
 */
function ExecutionControllerTest_createSpreadsheetForChangePlan(
  changePlan
) {

  ExecutionControllerTest_assertObject(
    changePlan,
    "changePlan"
  );


  const currentSnapshot =
    changePlan.currentSnapshot;


  const proposedSnapshot =
    changePlan.proposedSnapshot;


  ExecutionControllerTest_assertObject(
    currentSnapshot,
    "changePlan.currentSnapshot"
  );


  ExecutionControllerTest_assertObject(
    proposedSnapshot,
    "changePlan.proposedSnapshot"
  );


  /*
  =========================================
  Condition Master
  =========================================
  */

  const currentCondition =
    ExecutionControllerTest_deepCopy(
      currentSnapshot.condition
    );


  const proposedCondition =
    ExecutionControllerTest_deepCopy(
      proposedSnapshot.condition
    );


  const conditionHeaders =
    ExecutionControllerTest_collectHeaders(
      currentCondition,
      proposedCondition,
      {

        "条件ID":
          null,

        "親条件ID":
          null,

        "製品ID":
          null,

        "版数":
          null,

        "状態":
          null,

        "変更理由":
          null,

        "変更者":
          null,

        "最終更新日":
          null

      }
    );


  /*
  =========================================
  Condition Detail Master
  =========================================
  */

  const currentConditionDetail =
    ExecutionControllerTest_deepCopy(
      currentSnapshot.conditionDetail
    );


  const proposedConditionDetail =
    ExecutionControllerTest_deepCopy(
      proposedSnapshot.conditionDetail
    );


  const conditionDetailHeaders =
    ExecutionControllerTest_collectHeaders(
      currentConditionDetail,
      proposedConditionDetail,
      {

        "条件ID":
          null,

        "金型温度(℃)":
          null

      }
    );


  /*
  =========================================
  Product Master
  =========================================
  */

  const currentProduct =
    ExecutionControllerTest_createCurrentProductRow(
      changePlan
    );


  const productHeaders =
    ExecutionControllerTest_collectHeaders(
      currentProduct,
      {

        "製品ID":
          null,

        "現在標準条件ID":
          null,

        "最終更新日":
          null

      }
    );


  return ExecutionControllerTest_createSpreadsheet({

    "成形条件マスター": [

      conditionHeaders,

      ExecutionControllerTest_objectToRow(
        conditionHeaders,
        currentCondition
      )

    ],

    "成形条件詳細マスター": [

      conditionDetailHeaders,

      ExecutionControllerTest_objectToRow(
        conditionDetailHeaders,
        currentConditionDetail
      )

    ],

    "製品マスター": [

      productHeaders,

      ExecutionControllerTest_objectToRow(
        productHeaders,
        currentProduct
      )

    ]

  });

}


/**
 * Change Planから現在の製品行を生成する。
 *
 * @param {Object} changePlan
 * @return {Object}
 */
function ExecutionControllerTest_createCurrentProductRow(
  changePlan
) {

  let product =
    {};


  if (
    changePlan.currentSnapshot &&
    changePlan.currentSnapshot.product &&
    typeof changePlan.currentSnapshot.product ===
      "object" &&
    !Array.isArray(
      changePlan.currentSnapshot.product
    )
  ) {

    product =
      ExecutionControllerTest_deepCopy(
        changePlan.currentSnapshot.product
      );

  }


  product["製品ID"] =
    changePlan.subject.entityId;


  product["現在標準条件ID"] =
    changePlan
      .currentSnapshot
      .condition["条件ID"];


  if (
    !Object.prototype.hasOwnProperty.call(
      product,
      "最終更新日"
    )
  ) {

    product["最終更新日"] =
      "";

  }


  return product;

}


/**
 * 複数ObjectのKeyを結合し、
 * Header配列を生成する。
 *
 * @return {Array<string>}
 */
function ExecutionControllerTest_collectHeaders() {

  const headers =
    [];


  const seen =
    {};


  for (
    let index = 0;
    index < arguments.length;
    index += 1
  ) {

    const objectValue =
      arguments[index];


    ExecutionControllerTest_assertObject(
      objectValue,
      "headerSource[" +
      index +
      "]"
    );


    Object.keys(
      objectValue
    ).forEach(
      function(key) {

        if (
          !seen[
            key
          ]
        ) {

          seen[
            key
          ] =
            true;


          headers.push(
            key
          );

        }

      }
    );

  }


  return headers;

}


/**
 * ObjectをHeader順の行配列へ変換する。
 *
 * @param {Array<string>} headers
 * @param {Object} objectValue
 * @return {Array<*>}
 */
function ExecutionControllerTest_objectToRow(
  headers,
  objectValue
) {

  if (
    !Array.isArray(
      headers
    )
  ) {

    throw new Error(
      "headersはArrayである必要があります。"
    );

  }


  ExecutionControllerTest_assertObject(
    objectValue,
    "objectValue"
  );


  return headers.map(
    function(header) {

      return Object.prototype.hasOwnProperty.call(
        objectValue,
        header
      )
        ? objectValue[
            header
          ]
        : "";

    }
  );

}


/*
=========================================
Success Spreadsheet Validation
=========================================
*/

/**
 * 正常実行後のFake Spreadsheetを検証する。
 *
 * @param {Object} fixture
 */
function ExecutionControllerTest_validateSuccessSpreadsheet(
  fixture
) {

  const spreadsheet =
    fixture.spreadsheet;


  const changePlan =
    fixture.changePlan;


  const newConditionId =
    "COND-EXECUTION-CONTROLLER-TEST-001";


  /*
  =========================================
  Condition Master
  =========================================
  */

  const conditionSheet =
    spreadsheet.getSheetByName(
      "成形条件マスター"
    );


  const conditionRows =
    conditionSheet.getAllValues();


  ExecutionControllerTest_assertEquals(
    3,
    conditionRows.length,
    "conditionRows.length"
  );


  const conditionHeaderMap =
    ExecutionControllerTest_createHeaderMap(
      conditionRows[0]
    );


  const oldConditionRow =
    conditionRows[1];


  const newConditionRow =
    conditionRows[2];


  ExecutionControllerTest_assertEquals(
    "旧版",
    oldConditionRow[
      conditionHeaderMap["状態"]
    ],
    "oldCondition.状態"
  );


  ExecutionControllerTest_assertEquals(
    newConditionId,
    newConditionRow[
      conditionHeaderMap["条件ID"]
    ],
    "newCondition.条件ID"
  );


  ExecutionControllerTest_assertEquals(
    "標準",
    newConditionRow[
      conditionHeaderMap["状態"]
    ],
    "newCondition.状態"
  );


  /*
  =========================================
  Condition Detail Master
  =========================================
  */

  const detailRows =
    spreadsheet
      .getSheetByName(
        "成形条件詳細マスター"
      )
      .getAllValues();


  ExecutionControllerTest_assertEquals(
    3,
    detailRows.length,
    "detailRows.length"
  );


  const detailHeaderMap =
    ExecutionControllerTest_createHeaderMap(
      detailRows[0]
    );


  ExecutionControllerTest_assertEquals(
    newConditionId,
    detailRows[2][
      detailHeaderMap["条件ID"]
    ],
    "newConditionDetail.条件ID"
  );


  ExecutionControllerTest_assertEquals(
    61,
    Number(
      detailRows[2][
        detailHeaderMap["金型温度(℃)"]
      ]
    ),
    "newConditionDetail.金型温度"
  );


  /*
  =========================================
  Product Master
  =========================================
  */

  const productRows =
    spreadsheet
      .getSheetByName(
        "製品マスター"
      )
      .getAllValues();


  const productHeaderMap =
    ExecutionControllerTest_createHeaderMap(
      productRows[0]
    );


  ExecutionControllerTest_assertEquals(
    changePlan.subject.entityId,
    productRows[1][
      productHeaderMap["製品ID"]
    ],
    "product.製品ID"
  );


  ExecutionControllerTest_assertEquals(
    newConditionId,
    productRows[1][
      productHeaderMap["現在標準条件ID"]
    ],
    "product.現在標準条件ID"
  );

}


/**
 * Header配列から0始まりのMapを作る。
 *
 * @param {Array<string>} headers
 * @return {Object}
 */
function ExecutionControllerTest_createHeaderMap(
  headers
) {

  if (
    !Array.isArray(
      headers
    )
  ) {

    throw new Error(
      "headersはArrayである必要があります。"
    );

  }


  const map =
    {};


  headers.forEach(
    function(header, index) {

      map[
        header
      ] =
        index;

    }
  );


  return map;

}


/*
=========================================
Fake Spreadsheet
=========================================
*/

/**
 * Fake Spreadsheetを生成する。
 *
 * @param {Object<string, Array<Array<*>>>} sheetDataMap
 * @return {Object}
 */
function ExecutionControllerTest_createSpreadsheet(
  sheetDataMap
) {

  const sheets =
    {};


  Object.keys(
    sheetDataMap
  ).forEach(
    function(sheetName) {

      sheets[
        sheetName
      ] =
        ExecutionControllerTest_createSheet(
          sheetName,
          sheetDataMap[
            sheetName
          ]
        );

    }
  );


  return {

    getSheetByName:
      function(sheetName) {

        return Object.prototype.hasOwnProperty.call(
          sheets,
          sheetName
        )
          ? sheets[
              sheetName
            ]
          : null;

      },

    getAllSheetValues:
      function() {

        const result =
          {};


        Object.keys(
          sheets
        ).forEach(
          function(sheetName) {

            result[
              sheetName
            ] =
              sheets[
                sheetName
              ].getAllValues();

          }
        );


        return result;

      }

  };

}


/**
 * Fake Sheetを生成する。
 *
 * @param {string} sheetName
 * @param {Array<Array<*>>} initialValues
 * @return {Object}
 */
function ExecutionControllerTest_createSheet(
  sheetName,
  initialValues
) {

  let values =
    ExecutionControllerTest_deepCopy(
      initialValues
    );


  return {

    getName:
      function() {

        return sheetName;

      },

    getLastColumn:
      function() {

        return values.length ===
          0
          ? 0
          : values[0].length;

      },

    getLastRow:
      function() {

        return values.length;

      },

    getRange:
      function(
        startRow,
        startColumn,
        rowCount,
        columnCount
      ) {

        return ExecutionControllerTest_createRange(
          function() {

            const result =
              [];


            for (
              let rowOffset = 0;
              rowOffset < rowCount;
              rowOffset += 1
            ) {

              const row =
                [];


              for (
                let columnOffset = 0;
                columnOffset < columnCount;
                columnOffset += 1
              ) {

                const sourceRow =
                  values[
                    startRow -
                    1 +
                    rowOffset
                  ] ||
                  [];


                const sourceValue =
                  sourceRow[
                    startColumn -
                    1 +
                    columnOffset
                  ];


                row.push(
                  sourceValue ===
                    undefined
                    ? ""
                    : sourceValue
                );

              }


              result.push(
                row
              );

            }


            return ExecutionControllerTest_deepCopy(
              result
            );

          },
          function(newValues) {

            for (
              let rowOffset = 0;
              rowOffset < rowCount;
              rowOffset += 1
            ) {

              const targetRowIndex =
                startRow -
                1 +
                rowOffset;


              while (
                values.length <=
                  targetRowIndex
              ) {

                values.push(
                  []
                );

              }


              for (
                let columnOffset = 0;
                columnOffset < columnCount;
                columnOffset += 1
              ) {

                const targetColumnIndex =
                  startColumn -
                    1 +
                    columnOffset;


                while (
                  values[
                    targetRowIndex
                  ].length <=
                    targetColumnIndex
                ) {

                  values[
                    targetRowIndex
                  ].push(
                    ""
                  );

                }


                values[
                  targetRowIndex
                ][
                  targetColumnIndex
                ] =
                  newValues[
                    rowOffset
                  ][
                    columnOffset
                  ];

              }

            }

          }
        );

      },

    deleteRow:
      function(rowNumber) {

        if (
          !Number.isInteger(
            rowNumber
          ) ||
          rowNumber <
            1 ||
          rowNumber >
            values.length
        ) {

          throw new Error(
            "Fake Sheetの削除行番号が不正です。" +
            " rowNumber=" +
            rowNumber
          );

        }


        values.splice(
          rowNumber -
            1,
          1
        );

      },

    getAllValues:
      function() {

        return ExecutionControllerTest_deepCopy(
          values
        );

      }

  };

}


/**
 * Fake Rangeを生成する。
 */
function ExecutionControllerTest_createRange(
  readValues,
  writeValues
) {

  return {

    getValues:
      function() {

        return readValues();

      },

    setValues:
      function(newValues) {

        if (
          !Array.isArray(
            newValues
          )
        ) {

          throw new Error(
            "Fake Range.setValues()にはArrayが必要です。"
          );

        }


        writeValues(
          ExecutionControllerTest_deepCopy(
            newValues
          )
        );


        return this;

      }

  };

}


/*
=========================================
Additional Assertions
=========================================
*/

function ExecutionControllerTest_assertObject(
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


function ExecutionControllerTest_deepCopy(
  value
) {

  return JSON.parse(
    JSON.stringify(
      value
    )
  );

}


















/*
=========================================
Part 3

Rollback Success
・Rollback Failure
・Failure Fixtures
=========================================
*/


/*
=========================================
Rolled Back
=========================================
*/

/**
 * Operation途中で失敗し、
 * 成功済みOperationのRollbackがすべて成功した場合、
 * Execution Resultがrolled_backになることを確認する。
 */
function test_ExecutionController_rolledBack() {

  const fixture =
    ExecutionControllerTest_createRollbackSuccessFixture();


  const beforeSpreadsheetJson =
    JSON.stringify(
      fixture.spreadsheet.getAllSheetValues()
    );


  try {

    const result =
      ExecutionController_confirmAndExecute(
        fixture.proposal.proposalId,
        fixture.changePlan.changePlanId,
        {

          source:
            "execution_controller_test",

          decidedBy:
            "USER_EXECUTION_CONTROLLER_TEST",

          requestId:
            "REQUEST_EXECUTION_CONTROLLER_TEST_ROLLED_BACK"

        }
      );


    ExecutionControllerTest_validateResult(
      result
    );


    ExecutionControllerTest_assertEquals(
      EXECUTION_CONTROLLER_STATUS_COMPLETED,
      result.status,
      "result.status"
    );


    ExecutionControllerTest_assertEquals(
      EXECUTION_RESULT_STATUS_ROLLED_BACK,
      result.executionResult.status,
      "result.executionResult.status"
    );


    /*
    =========================================
    Forward Operation Results
    =========================================
    */

    ExecutionControllerTest_assertEquals(
      5,
      result.executionResult.operations.length,
      "executionResult.operations.length"
    );


    ExecutionControllerTest_assertEquals(
      EXECUTION_OPERATION_STATUS_SUCCESS,
      result.executionResult.operations[0].status,
      "operation1.status"
    );


    ExecutionControllerTest_assertEquals(
      EXECUTION_OPERATION_STATUS_SUCCESS,
      result.executionResult.operations[1].status,
      "operation2.status"
    );


    ExecutionControllerTest_assertEquals(
      EXECUTION_OPERATION_STATUS_SUCCESS,
      result.executionResult.operations[2].status,
      "operation3.status"
    );


    /*
     * Operation 4：
     * Productの現在標準条件ID切替で失敗する。
     */
    ExecutionControllerTest_assertEquals(
      EXECUTION_OPERATION_STATUS_FAILED,
      result.executionResult.operations[3].status,
      "operation4.status"
    );


    ExecutionControllerTest_assertSkippedOperation(
      result.executionResult.operations[4],
      "operation5"
    );


    /*
    =========================================
    Rollback Result
    =========================================
    */

    ExecutionControllerTest_assertEquals(
      true,
      result.executionResult.rollback.performed,
      "rollback.performed"
    );


    ExecutionControllerTest_assertEquals(
      EXECUTION_ROLLBACK_STATUS_SUCCESS,
      result.executionResult.rollback.status,
      "rollback.status"
    );


    ExecutionControllerTest_assertEquals(
      3,
      result.executionResult.rollback.operations.length,
      "rollback.operations.length"
    );


    /*
     * Forward Operation 3 → 2 → 1の逆順。
     */
    ExecutionControllerTest_assertEquals(
      "ROLLBACK_PROMOTE_NEW_CONDITION_TO_STANDARD",
      result.executionResult.rollback.operations[0].operationId,
      "rollback.operations[0].operationId"
    );


    ExecutionControllerTest_assertEquals(
      "ROLLBACK_INSERT_NEW_CONDITION_DETAIL",
      result.executionResult.rollback.operations[1].operationId,
      "rollback.operations[1].operationId"
    );


    ExecutionControllerTest_assertEquals(
      "ROLLBACK_INSERT_NEW_CONDITION",
      result.executionResult.rollback.operations[2].operationId,
      "rollback.operations[2].operationId"
    );


    result.executionResult.rollback.operations.forEach(
      function(operationResult, index) {

        ExecutionControllerTest_assertEquals(
          EXECUTION_OPERATION_STATUS_SUCCESS,
          operationResult.status,
          "rollback.operations[" +
          index +
          "].status"
        );

      }
    );


    /*
    =========================================
    Error
    =========================================
    */

    ExecutionControllerTest_assertTrue(
      result.executionResult.errors.length >=
        1,
      "executionResult.errors.length"
    );


    ExecutionControllerTest_assertEquals(
      result.executionResult.operations[3].operationId,
      result.executionResult.errors[0].operationId,
      "executionResult.errors[0].operationId"
    );


    /*
    =========================================
    Spreadsheet Restored
    =========================================
    */

    ExecutionControllerTest_assertEquals(
      beforeSpreadsheetJson,
      JSON.stringify(
        fixture.spreadsheet.getAllSheetValues()
      ),
      "spreadsheet after rollback"
    );

  } finally {

    ExecutionControllerTest_clearEnvironment();

  }

}


/*
=========================================
Rollback Failed
=========================================
*/

/**
 * Forward Operation失敗後に、
 * Rollback Operationも失敗した場合、
 * Execution Resultがfailedになることを確認する。
 */
function test_ExecutionController_failed() {

  const fixture =
    ExecutionControllerTest_createRollbackFailureFixture();


  try {

    const result =
      ExecutionController_confirmAndExecute(
        fixture.proposal.proposalId,
        fixture.changePlan.changePlanId,
        {

          source:
            "execution_controller_test",

          decidedBy:
            "USER_EXECUTION_CONTROLLER_TEST",

          requestId:
            "REQUEST_EXECUTION_CONTROLLER_TEST_FAILED"

        }
      );


    ExecutionControllerTest_validateResult(
      result
    );


    ExecutionControllerTest_assertEquals(
      EXECUTION_CONTROLLER_STATUS_COMPLETED,
      result.status,
      "result.status"
    );


    ExecutionControllerTest_assertEquals(
      EXECUTION_RESULT_STATUS_FAILED,
      result.executionResult.status,
      "result.executionResult.status"
    );


    /*
    =========================================
    Forward Failure
    =========================================
    */

    ExecutionControllerTest_assertEquals(
      EXECUTION_OPERATION_STATUS_FAILED,
      result.executionResult.operations[3].status,
      "operation4.status"
    );


    ExecutionControllerTest_assertSkippedOperation(
      result.executionResult.operations[4],
      "operation5"
    );


    /*
    =========================================
    Rollback Failure
    =========================================
    */

    ExecutionControllerTest_assertEquals(
      true,
      result.executionResult.rollback.performed,
      "rollback.performed"
    );


    ExecutionControllerTest_assertEquals(
      EXECUTION_ROLLBACK_STATUS_FAILED,
      result.executionResult.rollback.status,
      "rollback.status"
    );


    ExecutionControllerTest_assertEquals(
      3,
      result.executionResult.rollback.operations.length,
      "rollback.operations.length"
    );


    const failedRollbackOperations =
      result.executionResult.rollback.operations.filter(
        function(operationResult) {

          return (
            operationResult.status ===
              EXECUTION_OPERATION_STATUS_FAILED
          );

        }
      );


    ExecutionControllerTest_assertTrue(
      failedRollbackOperations.length >=
        1,
      "failedRollbackOperations.length"
    );


    /*
     * Forward ErrorとRollback Errorの
     * 両方がExecution Resultへ収集される。
     */
    ExecutionControllerTest_assertTrue(
      result.executionResult.errors.length >=
        2,
      "executionResult.errors.length"
    );


    const errorOperationIds =
      result.executionResult.errors.map(
        function(errorObject) {

          return errorObject.operationId;

        }
      );


    ExecutionControllerTest_assertTrue(
      errorOperationIds.indexOf(
        result.executionResult.operations[3].operationId
      ) !==
        -1,
      "forward error exists"
    );


    ExecutionControllerTest_assertTrue(
      errorOperationIds.indexOf(
        "ROLLBACK_INSERT_NEW_CONDITION_DETAIL"
      ) !==
        -1,
      "rollback error exists"
    );

  } finally {

    ExecutionControllerTest_clearEnvironment();

  }

}


/*
=========================================
Rollback Success Fixture
=========================================
*/

/**
 * Operation 4で失敗し、
 * Operation 1～3のRollbackが成功するFixtureを作る。
 *
 * Product Masterの現在標準条件IDを、
 * Change Planの旧条件IDとは異なる値へ変更することで、
 * Operation 4の楽観的排他条件を不一致にする。
 *
 * @return {Object}
 */
function ExecutionControllerTest_createRollbackSuccessFixture() {

  const pendingFixture =
    ExecutionControllerTest_createPendingChangeFixture();


  const spreadsheet =
    ExecutionControllerTest_createSpreadsheetForChangePlan(
      pendingFixture.changePlan
    );


  ExecutionControllerTest_changeProductCurrentCondition(
    spreadsheet,
    "COND-CONCURRENT-UPDATE"
  );


  ExecutionControllerTest_prepareEnvironment(
    spreadsheet
  );


  return {

    mutation:
      pendingFixture.mutation,

    resolutionResult:
      pendingFixture.resolutionResult,

    changePlan:
      pendingFixture.changePlan,

    proposal:
      pendingFixture.proposal,

    spreadsheet:
      spreadsheet

  };

}


/*
=========================================
Rollback Failure Fixture
=========================================
*/

/**
 * Operation 4でForward処理を失敗させ、
 * Operation 2のRollback DELETEも
 * 意図的に失敗させるFixtureを作る。
 *
 * @return {Object}
 */
function ExecutionControllerTest_createRollbackFailureFixture() {

  const fixture =
    ExecutionControllerTest_createRollbackSuccessFixture();


  const detailSheet =
    fixture.spreadsheet.getSheetByName(
      "成形条件詳細マスター"
    );


  ExecutionControllerTest_assertObject(
    detailSheet,
    "detailSheet"
  );


  /*
   * Forward INSERTではdeleteRow()を使用しない。
   * Rollback DELETE時だけ例外となる。
   */
  detailSheet.deleteRow =
    function() {

      const error =
        new Error(
          "ExecutionControllerTestによるRollback DELETE失敗"
        );


      error.code =
        "ROLLBACK_DELETE_TEST_FAILURE";


      throw error;

    };


  return fixture;

}


/*
=========================================
Fixture Mutation
=========================================
*/

/**
 * Fake Product Masterの現在標準条件IDを変更する。
 *
 * Change Plan確認後に別処理が更新した状態を再現する。
 *
 * @param {Object} spreadsheet
 * @param {string} conditionId
 */
function ExecutionControllerTest_changeProductCurrentCondition(
  spreadsheet,
  conditionId
) {

  ExecutionControllerTest_assertObject(
    spreadsheet,
    "spreadsheet"
  );


  const productSheet =
    spreadsheet.getSheetByName(
      "製品マスター"
    );


  ExecutionControllerTest_assertObject(
    productSheet,
    "productSheet"
  );


  const rows =
    productSheet.getAllValues();


  const headerMap =
    ExecutionControllerTest_createHeaderMap(
      rows[0]
    );


  const conditionColumnIndex =
    headerMap["現在標準条件ID"];


  if (
    !Number.isInteger(
      conditionColumnIndex
    )
  ) {

    throw new Error(
      "製品マスターに現在標準条件ID Headerが存在しません。"
    );

  }


  /*
   * Fake Sheetの2行目・対象列だけを書き換える。
   */
  productSheet
    .getRange(
      2,
      conditionColumnIndex +
        1,
      1,
      1
    )
    .setValues(
      [
        [
          conditionId
        ]
      ]
    );

}


/*
=========================================
Additional Validation Helper
=========================================
*/

/**
 * skipped Operation Resultを確認する。
 *
 * @param {Object} operationResult
 * @param {string} label
 */
function ExecutionControllerTest_assertSkippedOperation(
  operationResult,
  label
) {

  ExecutionControllerTest_assertObject(
    operationResult,
    label
  );


  ExecutionControllerTest_assertEquals(
    EXECUTION_OPERATION_STATUS_SKIPPED,
    operationResult.status,
    label +
    ".status"
  );


  ExecutionControllerTest_assertEquals(
    0,
    operationResult.affectedRows,
    label +
    ".affectedRows"
  );


  ExecutionControllerTest_assertEquals(
    null,
    operationResult.error,
    label +
    ".error"
  );

}



/*
=========================================
Controller Result Validation
=========================================
*/

/**
 * ExecutionControllerが返す結果が、
 * Controller Resultの正式な検証を通過することを確認する。
 *
 * Execution Plan IDとExecution Result IDの
 * 伝播整合性も確認する。
 */
function test_ExecutionController_resultValidation() {

  const fixture =
    ExecutionControllerTest_createSuccessFixture();


  try {

    const result =
      ExecutionController_confirmAndExecute(
        fixture.proposal.proposalId,
        fixture.changePlan.changePlanId,
        {

          source:
            "execution_controller_test",

          decidedBy:
            "USER_EXECUTION_CONTROLLER_TEST",

          requestId:
            "REQUEST_EXECUTION_CONTROLLER_TEST_VALIDATION"

        }
      );


    ExecutionControllerTest_assertEquals(
      true,
      ExecutionController_validateResult(
        result
      ),
      "ExecutionController_validateResult"
    );


    ExecutionControllerTest_assertEquals(
      result.executionPlanId,
      result.executionResult.executionPlanId,
      "executionPlanId propagation"
    );


    ExecutionControllerTest_assertEquals(
      result.executionResultId,
      result.executionResult.executionResultId,
      "executionResultId propagation"
    );


    ExecutionControllerTest_assertTrue(
      result.executionPlanId !==
        result.executionResultId,
      "executionPlanId and executionResultId must differ"
    );


    ExecutionControllerTest_assertEquals(
      fixture.proposal.proposalId,
      result.proposalId,
      "proposalId propagation"
    );


    ExecutionControllerTest_assertEquals(
      fixture.changePlan.changePlanId,
      result.changePlanId,
      "changePlanId propagation"
    );

  } finally {

    ExecutionControllerTest_clearEnvironment();

  }

}



/*
=========================================
Metadata Propagation
=========================================
*/

/**
 * Controllerへ渡したMetadataが、
 * Confirmation Execution・Execution Plan・
 * Execution Resultへ正しく伝播することを確認する。
 */
function test_ExecutionController_metadata() {

  const fixture =
    ExecutionControllerTest_createSuccessFixture();


  const metadata = {

    source:
      "execution_controller_metadata_test",

    decidedBy:
      "USER_METADATA_TEST",

    requestId:
      "REQUEST_EXECUTION_CONTROLLER_METADATA_TEST"

  };


  const originalMetadataJson =
    JSON.stringify(
      metadata
    );


  try {

    const result =
      ExecutionController_confirmAndExecute(
        fixture.proposal.proposalId,
        fixture.changePlan.changePlanId,
        metadata
      );


    ExecutionControllerTest_validateResult(
      result
    );


    /*
    =========================================
    Confirmation Metadata
    =========================================
    */

    ExecutionControllerTest_assertEquals(
      "USER_METADATA_TEST",
      result.confirmationExecution.decidedBy,
      "confirmationExecution.decidedBy"
    );


    /*
    =========================================
    Execution Result Metadata
    =========================================
    */

    ExecutionControllerTest_assertEquals(
      "REQUEST_EXECUTION_CONTROLLER_METADATA_TEST",
      result.executionResult.metadata.requestId,
      "executionResult.metadata.requestId"
    );


    ExecutionControllerTest_assertEquals(
      "spreadsheet_transaction_engine",
      result.executionResult.metadata.executor,
      "executionResult.metadata.executor"
    );


    ExecutionControllerTest_assertEquals(
      fixture.proposal.proposalId,
      result.executionResult.metadata.correlationId,
      "executionResult.metadata.correlationId"
    );


    /*
    =========================================
    Input Metadata Immutability
    =========================================
    */

    ExecutionControllerTest_assertEquals(
      originalMetadataJson,
      JSON.stringify(
        metadata
      ),
      "metadata"
    );

  } finally {

    ExecutionControllerTest_clearEnvironment();

  }

}





/*
=========================================
Pending Change Consumption
=========================================
*/

/**
 * Pending ChangeがConfirmation Executionによって
 * 一度だけ消費されることを確認する。
 *
 * 同じproposalId・changePlanIdで
 * 2回目の実行を試みた場合は例外となる必要がある。
 */
function test_ExecutionController_pendingConsumed() {

  const fixture =
    ExecutionControllerTest_createSuccessFixture();


  try {

    const firstResult =
      ExecutionController_confirmAndExecute(
        fixture.proposal.proposalId,
        fixture.changePlan.changePlanId,
        {

          source:
            "execution_controller_pending_test",

          decidedBy:
            "USER_PENDING_TEST",

          requestId:
            "REQUEST_EXECUTION_CONTROLLER_PENDING_FIRST"

        }
      );


    ExecutionControllerTest_validateResult(
      firstResult
    );


    ExecutionControllerTest_assertEquals(
      EXECUTION_RESULT_STATUS_SUCCESS,
      firstResult.executionResult.status,
      "firstResult.executionResult.status"
    );


    /*
     * 同じPending Changeを再利用できないことを確認する。
     */
    ExecutionControllerTest_assertThrows(

      function() {

        ExecutionController_confirmAndExecute(
          fixture.proposal.proposalId,
          fixture.changePlan.changePlanId,
          {

            source:
              "execution_controller_pending_test",

            decidedBy:
              "USER_PENDING_TEST",

            requestId:
              "REQUEST_EXECUTION_CONTROLLER_PENDING_SECOND"

          }
        );

      },

      null,

      "Pending Change must be consumed once"

    );

  } finally {

    ExecutionControllerTest_clearEnvironment();

  }

}











/*
=========================================
Assertion
=========================================
*/

function ExecutionControllerTest_assertEquals(
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

      JSON.stringify(expected) +

      " actual=" +

      JSON.stringify(actual)

    );

  }

}



function ExecutionControllerTest_assertTrue(
  value,
  label
) {

  if (
    value !== true
  ) {

    throw new Error(

      label +

      " must be true."

    );

  }

}



/**
 * 指定処理で例外が発生することを確認する。
 *
 * expectedMessageがnullの場合は、
 * エラーメッセージの内容を限定しない。
 *
 * @param {Function} callback
 * @param {string|null} expectedMessage
 * @param {string} label
 */
function ExecutionControllerTest_assertThrows(
  callback,
  expectedMessage,
  label
) {

  if (
    typeof callback !==
      "function"
  ) {

    throw new Error(
      label +
      "のcallbackはFunctionである必要があります。"
    );

  }


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
      null
  ) {

    if (
      typeof expectedMessage !==
        "string" ||
      expectedMessage.trim() ===
        ""
    ) {

      throw new Error(
        "[AssertThrows Failed] " +
        label +
        " expectedMessageはnullまたは空でないstringである必要があります。"
      );

    }


    const actualMessage =
      thrownError &&
      typeof thrownError.message ===
        "string"
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
        "[AssertThrows Failed] " +
        label +
        " expectedMessage=" +
        JSON.stringify(
          expectedMessage
        ) +
        " actualMessage=" +
        JSON.stringify(
          actualMessage
        )
      );

    }

  }

}



function test_ExecutionController_holdingTimeT1Success() {

  const fixture =
    ExecutionControllerTest_createHoldingTimeT1SuccessFixture();


  try {

    const result =
      ExecutionController_confirmAndExecute(
        fixture.proposal.proposalId,
        fixture.changePlan.changePlanId,
        {

          source:
            "execution_controller_test",

          decidedBy:
            "USER_EXECUTION_CONTROLLER_TEST",

          requestId:
            "REQUEST_EXECUTION_CONTROLLER_TEST_HT_T1"

        }
      );


    ExecutionControllerTest_validateResult(
      result
    );


    ExecutionControllerTest_assertEquals(
      EXECUTION_CONTROLLER_STATUS_COMPLETED,
      result.status,
      "result.status"
    );


    const detailRows =
      fixture.spreadsheet
        .getSheetByName(
          "成形条件詳細マスター"
        )
        .getAllValues();


    const detailHeaderMap =
      ExecutionControllerTest_createHeaderMap(
        detailRows[0]
      );


    ExecutionControllerTest_assertEquals(
      3,
      detailRows.length,
      "detailRows.length"
    );


    ExecutionControllerTest_assertEquals(
      9,
      Number(
        detailRows[2][
          detailHeaderMap["保圧時間:T1"]
        ]
      ),
      "newConditionDetail.保圧時間:T1"
    );


    console.log(
      "[PASS] holdingTimeT1Success"
    );

  } finally {

    ExecutionControllerTest_clearEnvironment();

  }

}



function ExecutionControllerTest_createHoldingTimeT1SuccessFixture() {

  const pendingFixture =
    ExecutionControllerTest_createHoldingTimeT1PendingChangeFixture();


  const spreadsheet =
    ExecutionControllerTest_createSpreadsheetForChangePlan(
      pendingFixture.changePlan
    );


  ExecutionControllerTest_prepareEnvironment(
    spreadsheet
  );


  return {

    mutation:
      pendingFixture.mutation,

    resolutionResult:
      pendingFixture.resolutionResult,

    changePlan:
      pendingFixture.changePlan,

    proposal:
      pendingFixture.proposal,

    spreadsheet:
      spreadsheet

  };

}



function ExecutionControllerTest_createHoldingTimeT1PendingChangeFixture() {

  const mutation =
    EntityMutationContract_createEmpty();


  mutation.mutationId =
    "MUTATION_EXECUTION_CONTROLLER_HT_T1_" +
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
      "standard_condition.holding_time_t1",

    currentValue:
      "",

    proposedValue:
      9,

    unit:
      "second",

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
        "holding_time_t1",

      currentValue:
        "",

      proposedValue:
        9,

      unit:
        "second"

    }

  });


  mutation.reason =
    "ワンワンのT1を9秒にして";


  mutation.metadata.source =
    "execution_controller_test";

  mutation.metadata.requestedBy =
    "USER_EXECUTION_CONTROLLER_TEST";

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


  ExecutionControllerTest_assertEquals(
    "resolved",
    resolutionResult.status,
    "resolutionResult.status"
  );


  const changePlan =
    ChangePlanEngine_build(
      resolutionResult
    );


  ExecutionControllerTest_assertEquals(
    "ready_for_confirmation",
    changePlan.status,
    "changePlan.status"
  );


  const proposal =
    ConfirmationProposalEngine_build(
      changePlan
    );


  PendingChangeStore_save(
    changePlan,
    proposal
  );


  return {

    mutation:
      mutation,

    resolutionResult:
      resolutionResult,

    changePlan:
      changePlan,

    proposal:
      proposal

  };

}