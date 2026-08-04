/*
=========================================
SHiCI
113_SpreadsheetOperationExecutorTest.js

Spreadsheet Operation Executor Test
Version 1.0

実際のSpreadsheetは使用しない。
すべてFake Spreadsheet上で検証する。
=========================================
*/


/*
=========================================
Test Runner
=========================================
*/

/**
 * SpreadsheetOperationExecutorの全テストを実行する。
 */
function test_SpreadsheetOperationExecutor_runAll() {

  const tests = [

    {
      name:
        "executeInsertSuccess",
      run:
        test_SpreadsheetOperationExecutor_executeInsertSuccess
    },

    {
      name:
        "executeUpdateSuccess",
      run:
        test_SpreadsheetOperationExecutor_executeUpdateSuccess
    },

    {
      name:
        "executeDeleteSuccess",
      run:
        test_SpreadsheetOperationExecutor_executeDeleteSuccess
    },

    {
      name:
        "resolveBindingReference",
      run:
        test_SpreadsheetOperationExecutor_resolveBindingReference
    },

    {
      name:
        "repositoryFailureReturnsFailedResult",
      run:
        test_SpreadsheetOperationExecutor_repositoryFailureReturnsFailedResult
    },

    {
      name:
        "operationIsNotModified",
      run:
        test_SpreadsheetOperationExecutor_operationIsNotModified
    },

    {
      name:
        "bindingMapIsNotModified",
      run:
        test_SpreadsheetOperationExecutor_bindingMapIsNotModified
    },

    {
      name:
        "unsupportedRepositoryIsRejected",
      run:
        test_SpreadsheetOperationExecutor_unsupportedRepositoryIsRejected
    },

    {
      name:
        "undefinedBindingReferenceReturnsFailedResult",
      run:
        test_SpreadsheetOperationExecutor_undefinedBindingReferenceReturnsFailedResult
    }

  ];


  const failures =
    [];


  console.log(
    "========================================="
  );

  console.log(
    "SpreadsheetOperationExecutor Test Start"
  );

  console.log(
    "========================================="
  );


  try {

    tests.forEach(
      function(test) {

        try {

          SpreadsheetRepository_clearSpreadsheetOverride();


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

          SpreadsheetRepository_clearSpreadsheetOverride();

        }

      }
    );

  } finally {

    SpreadsheetRepository_clearSpreadsheetOverride();

  }


  if (
    failures.length >
      0
  ) {

    throw new Error(
      "SpreadsheetOperationExecutor Test Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  console.log(
    "[Spreadsheet Operation Executor Ver.1.0 Test Passed]"
  );

}


/*
=========================================
INSERT Success
=========================================
*/

/**
 * INSERT Operationが正常終了し、
 * success Operation Resultを返すことを確認する。
 */
function test_SpreadsheetOperationExecutor_executeInsertSuccess() {

  const spreadsheet =
    SpreadsheetOperationExecutorTest_createSpreadsheet({

      "成形条件マスター": [

        [
          "条件ID",
          "製品ID",
          "状態"
        ]

      ]

    });


  SpreadsheetRepository_setSpreadsheetOverride(
    spreadsheet
  );


  const operation =
    SpreadsheetOperationExecutorTest_createInsertOperation();


  const bindingMap = {

    NEW_CONDITION_ID:
      "COND-TEST-000001"

  };


  const result =
    SpreadsheetOperationExecutor_execute(
      operation,
      bindingMap
    );


  SpreadsheetOperationExecutorTest_assertEquals(
    EXECUTION_OPERATION_STATUS_SUCCESS,
    result.status,
    "result.status"
  );


  SpreadsheetOperationExecutorTest_assertEquals(
    1,
    result.affectedRows,
    "result.affectedRows"
  );


  SpreadsheetOperationExecutorTest_assertEquals(
    null,
    result.error,
    "result.error"
  );


  SpreadsheetOperationExecutorTest_assertDeepEquals(
    [
      "COND-TEST-000001",
      "P-000035",
      "試験"
    ],
    spreadsheet
      .getSheetByName(
        "成形条件マスター"
      )
      .getAllValues()[1],
    "inserted row"
  );


  ExecutionResultContract_validateOperationResult(
    result,
    0
  );

}


/*
=========================================
UPDATE Success
=========================================
*/

/**
 * UPDATE Operationが正常終了することを確認する。
 */
function test_SpreadsheetOperationExecutor_executeUpdateSuccess() {

  const spreadsheet =
    SpreadsheetOperationExecutorTest_createSpreadsheet({

      "製品マスター": [

        [
          "製品ID",
          "現在標準条件ID"
        ],

        [
          "P-000035",
          "COND-000152"
        ]

      ]

    });


  SpreadsheetRepository_setSpreadsheetOverride(
    spreadsheet
  );


  const operation =
    SpreadsheetOperationExecutorTest_createUpdateOperation();


  const result =
    SpreadsheetOperationExecutor_execute(
      operation,
      {

        NEW_CONDITION_ID:
          "COND-TEST-000002"

      }
    );


  SpreadsheetOperationExecutorTest_assertEquals(
    EXECUTION_OPERATION_STATUS_SUCCESS,
    result.status,
    "result.status"
  );


  SpreadsheetOperationExecutorTest_assertDeepEquals(
    [
      "P-000035",
      "COND-TEST-000002"
    ],
    spreadsheet
      .getSheetByName(
        "製品マスター"
      )
      .getAllValues()[1],
    "updated row"
  );

}


/*
=========================================
DELETE Success
=========================================
*/

/**
 * DELETE Operationが正常終了することを確認する。
 */
function test_SpreadsheetOperationExecutor_executeDeleteSuccess() {

  const spreadsheet =
    SpreadsheetOperationExecutorTest_createSpreadsheet({

      "成形条件詳細マスター": [

        [
          "条件ID",
          "金型温度(℃)"
        ],

        [
          "COND-000152",
          60
        ],

        [
          "COND-TEST-000003",
          61
        ]

      ]

    });


  SpreadsheetRepository_setSpreadsheetOverride(
    spreadsheet
  );


  const operation =
    SpreadsheetOperationExecutorTest_createDeleteOperation();


  const result =
    SpreadsheetOperationExecutor_execute(
      operation,
      {

        NEW_CONDITION_ID:
          "COND-TEST-000003"

      }
    );


  SpreadsheetOperationExecutorTest_assertEquals(
    EXECUTION_OPERATION_STATUS_SUCCESS,
    result.status,
    "result.status"
  );


  SpreadsheetOperationExecutorTest_assertDeepEquals(
    [
      [
        "条件ID",
        "金型温度(℃)"
      ],
      [
        "COND-000152",
        60
      ]
    ],
    spreadsheet
      .getSheetByName(
        "成形条件詳細マスター"
      )
      .getAllValues(),
    "rows after delete"
  );

}


/*
=========================================
Binding Resolution
=========================================
*/

/**
 * bindingRefが実行直前に解決され、
 * Operation原本には残ることを確認する。
 */
function test_SpreadsheetOperationExecutor_resolveBindingReference() {

  const spreadsheet =
    SpreadsheetOperationExecutorTest_createSpreadsheet({

      "成形条件マスター": [

        [
          "条件ID",
          "製品ID",
          "状態"
        ]

      ]

    });


  SpreadsheetRepository_setSpreadsheetOverride(
    spreadsheet
  );


  const operation =
    SpreadsheetOperationExecutorTest_createInsertOperation();


  SpreadsheetOperationExecutor_execute(
    operation,
    {

      NEW_CONDITION_ID:
        "COND-TEST-000004"

    }
  );


  SpreadsheetOperationExecutorTest_assertEquals(
    "COND-TEST-000004",
    spreadsheet
      .getSheetByName(
        "成形条件マスター"
      )
      .getAllValues()[1][0],
    "resolved conditionId"
  );


  SpreadsheetOperationExecutorTest_assertBindingReference(
    operation
      .payload
      .values["条件ID"],
    "NEW_CONDITION_ID",
    "operation.payload.values.条件ID"
  );

}


/*
=========================================
Repository Failure
=========================================
*/

/**
 * Repository内で例外が発生しても、
 * Executorは例外を外へ投げず
 * failed Operation Resultへ変換することを確認する。
 */
function test_SpreadsheetOperationExecutor_repositoryFailureReturnsFailedResult() {

  const spreadsheet =
    SpreadsheetOperationExecutorTest_createSpreadsheet({

      "製品マスター": [

        [
          "製品ID",
          "現在標準条件ID"
        ],

        [
          "P-000035",
          "COND-OTHER"
        ]

      ]

    });


  SpreadsheetRepository_setSpreadsheetOverride(
    spreadsheet
  );


  const operation =
    SpreadsheetOperationExecutorTest_createUpdateOperation();


  const result =
    SpreadsheetOperationExecutor_execute(
      operation,
      {

        NEW_CONDITION_ID:
          "COND-TEST-000005"

      }
    );


  SpreadsheetOperationExecutorTest_assertEquals(
    EXECUTION_OPERATION_STATUS_FAILED,
    result.status,
    "result.status"
  );


  SpreadsheetOperationExecutorTest_assertEquals(
    0,
    result.affectedRows,
    "result.affectedRows"
  );


  SpreadsheetOperationExecutorTest_assertObject(
    result.error,
    "result.error"
  );


  SpreadsheetOperationExecutorTest_assertEquals(
    operation.operationId,
    result.error.operationId,
    "result.error.operationId"
  );


  SpreadsheetOperationExecutorTest_assertContains(
    "criteriaに一致する行が存在しません。",
    result.error.message,
    "result.error.message"
  );


  ExecutionResultContract_validateOperationResult(
    result,
    0
  );

}


/*
=========================================
Operation Immutability
=========================================
*/

/**
 * 実行後もOperation原本が変更されないことを確認する。
 */
function test_SpreadsheetOperationExecutor_operationIsNotModified() {

  const spreadsheet =
    SpreadsheetOperationExecutorTest_createSpreadsheet({

      "成形条件マスター": [

        [
          "条件ID",
          "製品ID",
          "状態"
        ]

      ]

    });


  SpreadsheetRepository_setSpreadsheetOverride(
    spreadsheet
  );


  const operation =
    SpreadsheetOperationExecutorTest_createInsertOperation();


  const originalJson =
    JSON.stringify(
      operation
    );


  SpreadsheetOperationExecutor_execute(
    operation,
    {

      NEW_CONDITION_ID:
        "COND-TEST-000006"

    }
  );


  SpreadsheetOperationExecutorTest_assertEquals(
    originalJson,
    JSON.stringify(
      operation
    ),
    "operation"
  );

}


/*
=========================================
Binding Map Immutability
=========================================
*/

/**
 * 実行後もBinding Map原本が変更されないことを確認する。
 */
function test_SpreadsheetOperationExecutor_bindingMapIsNotModified() {

  const spreadsheet =
    SpreadsheetOperationExecutorTest_createSpreadsheet({

      "成形条件マスター": [

        [
          "条件ID",
          "製品ID",
          "状態"
        ]

      ]

    });


  SpreadsheetRepository_setSpreadsheetOverride(
    spreadsheet
  );


  const bindingMap = {

    NEW_CONDITION_ID:
      "COND-TEST-000007"

  };


  const originalJson =
    JSON.stringify(
      bindingMap
    );


  SpreadsheetOperationExecutor_execute(
    SpreadsheetOperationExecutorTest_createInsertOperation(),
    bindingMap
  );


  SpreadsheetOperationExecutorTest_assertEquals(
    originalJson,
    JSON.stringify(
      bindingMap
    ),
    "bindingMap"
  );

}


/*
=========================================
Unsupported Repository
=========================================
*/

/**
 * spreadsheet以外のrepositoryを拒否することを確認する。
 *
 * 入力検証エラーはPublic APIのtryより前に発生するため、
 * このケースでは例外が投げられる。
 */
function test_SpreadsheetOperationExecutor_unsupportedRepositoryIsRejected() {

  const operation =
    SpreadsheetOperationExecutorTest_createInsertOperation();


  operation.target.repository =
    "firestore";


  SpreadsheetOperationExecutorTest_assertThrows(

    function() {

      SpreadsheetOperationExecutor_execute(
        operation,
        {

          NEW_CONDITION_ID:
            "COND-TEST-000008"

        }
      );

    },

    "repository=spreadsheet",

    "unsupported repository"

  );

}


/*
=========================================
Undefined Binding
=========================================
*/

/**
 * 未定義bindingRefは、
 * failed Operation Resultへ変換されることを確認する。
 */
function test_SpreadsheetOperationExecutor_undefinedBindingReferenceReturnsFailedResult() {

  const spreadsheet =
    SpreadsheetOperationExecutorTest_createSpreadsheet({

      "成形条件マスター": [

        [
          "条件ID",
          "製品ID",
          "状態"
        ]

      ]

    });


  SpreadsheetRepository_setSpreadsheetOverride(
    spreadsheet
  );


  const result =
    SpreadsheetOperationExecutor_execute(
      SpreadsheetOperationExecutorTest_createInsertOperation(),
      {}
    );


  SpreadsheetOperationExecutorTest_assertEquals(
    EXECUTION_OPERATION_STATUS_FAILED,
    result.status,
    "result.status"
  );


  SpreadsheetOperationExecutorTest_assertContains(
    "未解決のbindingRefです。",
    result.error.message,
    "result.error.message"
  );

}


/*
=========================================
Operation Fixtures
=========================================
*/

/**
 * 正常なINSERT Operationを生成する。
 *
 * @return {Object}
 */
function SpreadsheetOperationExecutorTest_createInsertOperation() {

  const operation =
    ExecutionPlanContract_createEmptyOperation();


  operation.operationId =
    "INSERT_NEW_CONDITION_TEST";


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


  return operation;

}


/**
 * 正常なUPDATE Operationを生成する。
 *
 * @return {Object}
 */
function SpreadsheetOperationExecutorTest_createUpdateOperation() {

  const operation =
    ExecutionPlanContract_createEmptyOperation();


  operation.operationId =
    "SWITCH_PRODUCT_CONDITION_TEST";


  operation.sequence =
    1;


  operation.operationType =
    EXECUTION_PLAN_OPERATION_UPDATE;


  operation.target.repository =
    "spreadsheet";

  operation.target.sheetName =
    "製品マスター";

  operation.target.entityType =
    "product";

  operation.target.entityId =
    "P-000035";


  operation.payload.values = {

    "現在標準条件ID": {

      bindingRef:
        "NEW_CONDITION_ID"

    }

  };


  operation.payload.criteria = {

    "製品ID":
      "P-000035",

    "現在標準条件ID":
      "COND-000152"

  };


  return operation;

}


/**
 * 正常なDELETE Operationを生成する。
 *
 * @return {Object}
 */
function SpreadsheetOperationExecutorTest_createDeleteOperation() {

  const operation =
    ExecutionPlanContract_createEmptyOperation();


  operation.operationId =
    "DELETE_NEW_CONDITION_DETAIL_TEST";


  operation.sequence =
    1;


  operation.operationType =
    EXECUTION_PLAN_OPERATION_DELETE;


  operation.target.repository =
    "spreadsheet";

  operation.target.sheetName =
    "成形条件詳細マスター";

  operation.target.entityType =
    "condition_detail";

  operation.target.entityId =
    null;


  operation.payload.values =
    null;


  operation.payload.criteria = {

    "条件ID": {

      bindingRef:
        "NEW_CONDITION_ID"

    }

  };


  return operation;

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
function SpreadsheetOperationExecutorTest_createSpreadsheet(
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
        SpreadsheetOperationExecutorTest_createSheet(
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
function SpreadsheetOperationExecutorTest_createSheet(
  sheetName,
  initialValues
) {

  let values =
    SpreadsheetOperationExecutorTest_deepCopy(
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

        return SpreadsheetOperationExecutorTest_createRange(
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


            return SpreadsheetOperationExecutorTest_deepCopy(
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

        values.splice(
          rowNumber -
            1,
          1
        );

      },

    getAllValues:
      function() {

        return SpreadsheetOperationExecutorTest_deepCopy(
          values
        );

      }

  };

}


/**
 * Fake Rangeを生成する。
 */
function SpreadsheetOperationExecutorTest_createRange(
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

        writeValues(
          SpreadsheetOperationExecutorTest_deepCopy(
            newValues
          )
        );


        return this;

      }

  };

}


/*
=========================================
Assertions
=========================================
*/

function SpreadsheetOperationExecutorTest_assertEquals(
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


function SpreadsheetOperationExecutorTest_assertDeepEquals(
  expected,
  actual,
  label
) {

  const expectedJson =
    JSON.stringify(
      expected
    );


  const actualJson =
    JSON.stringify(
      actual
    );


  if (
    expectedJson !==
      actualJson
  ) {

    throw new Error(
      "[AssertDeepEquals Failed] " +
      label +
      " expected=" +
      expectedJson +
      " actual=" +
      actualJson
    );

  }

}


function SpreadsheetOperationExecutorTest_assertObject(
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
      label
    );

  }

}


function SpreadsheetOperationExecutorTest_assertBindingReference(
  actual,
  expectedBindingId,
  label
) {

  SpreadsheetOperationExecutorTest_assertObject(
    actual,
    label
  );


  SpreadsheetOperationExecutorTest_assertEquals(
    1,
    Object.keys(
      actual
    ).length,
    label +
    ".keys.length"
  );


  SpreadsheetOperationExecutorTest_assertEquals(
    expectedBindingId,
    actual.bindingRef,
    label +
    ".bindingRef"
  );

}


function SpreadsheetOperationExecutorTest_assertContains(
  expectedText,
  actualText,
  label
) {

  if (
    typeof actualText !==
      "string" ||
    actualText.indexOf(
      expectedText
    ) ===
      -1
  ) {

    throw new Error(
      "[AssertContains Failed] " +
      label +
      " expectedText=" +
      JSON.stringify(
        expectedText
      ) +
      " actualText=" +
      JSON.stringify(
        actualText
      )
    );

  }

}


function SpreadsheetOperationExecutorTest_assertThrows(
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


function SpreadsheetOperationExecutorTest_deepCopy(
  value
) {

  return JSON.parse(
    JSON.stringify(
      value
    )
  );

}