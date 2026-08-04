/*
=========================================
SHiCI
112_SpreadsheetRepositoryTest.js

Spreadsheet Repository Test
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
 * SpreadsheetRepositoryの全テストを実行する。
 */
function test_SpreadsheetRepository_runAll() {

  const tests = [

    {
      name:
        "insert",
      run:
        test_SpreadsheetRepository_insert
    },

    {
      name:
        "update",
      run:
        test_SpreadsheetRepository_update
    },

    {
      name:
        "delete",
      run:
        test_SpreadsheetRepository_delete
    },

    {
      name:
        "executeDispatch",
      run:
        test_SpreadsheetRepository_executeDispatch
    },

    {
      name:
        "unknownHeaderIsRejected",
      run:
        test_SpreadsheetRepository_unknownHeaderIsRejected
    },

    {
      name:
        "emptyCriteriaIsRejected",
      run:
        test_SpreadsheetRepository_emptyCriteriaIsRejected
    },

    {
      name:
        "noMatchingRowIsRejected",
      run:
        test_SpreadsheetRepository_noMatchingRowIsRejected
    },

    {
      name:
        "multipleMatchingRowsAreRejected",
      run:
        test_SpreadsheetRepository_multipleMatchingRowsAreRejected
    },

    {
      name:
        "unresolvedBindingIsRejected",
      run:
        test_SpreadsheetRepository_unresolvedBindingIsRejected
    },

    {
      name:
        "updatePreservesUnspecifiedColumns",
      run:
        test_SpreadsheetRepository_updatePreservesUnspecifiedColumns
    },

    {
      name:
        "spreadsheetOverrideIsCleared",
      run:
        test_SpreadsheetRepository_spreadsheetOverrideIsCleared
    }

  ];


  const failures =
    [];


  console.log(
    "========================================="
  );

  console.log(
    "SpreadsheetRepository Test Start"
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
      "SpreadsheetRepository Test Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  console.log(
    "[Spreadsheet Repository Ver.1.0 Test Passed]"
  );

}


/*
=========================================
INSERT
=========================================
*/

/**
 * Header順に1行追加されることを確認する。
 */
function test_SpreadsheetRepository_insert() {

  const spreadsheet =
    SpreadsheetRepositoryTest_createSpreadsheet({

      "製品マスター": [

        [
          "製品ID",
          "製品名",
          "現在標準条件ID",
          "最終更新日"
        ],

        [
          "P-000001",
          "Existing Product",
          "COND-000001",
          "2026-08-01T00:00:00.000Z"
        ]

      ]

    });


  SpreadsheetRepository_setSpreadsheetOverride(
    spreadsheet
  );


  const result =
    SpreadsheetRepository_insert(
      "製品マスター",
      {

        "製品ID":
          "P-000002",

        "製品名":
          "New Product",

        "現在標準条件ID":
          "COND-000002"

      }
    );


  SpreadsheetRepositoryTest_assertEquals(
    1,
    result.affectedRows,
    "result.affectedRows"
  );


  const rows =
    spreadsheet
      .getSheetByName(
        "製品マスター"
      )
      .getAllValues();


  SpreadsheetRepositoryTest_assertEquals(
    3,
    rows.length,
    "rows.length"
  );


  SpreadsheetRepositoryTest_assertDeepEquals(
    [
      "P-000002",
      "New Product",
      "COND-000002",
      ""
    ],
    rows[2],
    "inserted row"
  );

}


/*
=========================================
UPDATE
=========================================
*/

/**
 * criteriaに一致する1行だけ更新されることを確認する。
 */
function test_SpreadsheetRepository_update() {

  const spreadsheet =
    SpreadsheetRepositoryTest_createSpreadsheet({

      "製品マスター": [

        [
          "製品ID",
          "製品名",
          "現在標準条件ID",
          "最終更新日"
        ],

        [
          "P-000035",
          "LEVER, CLAMP",
          "COND-000152",
          "2026-08-01T00:00:00.000Z"
        ]

      ]

    });


  SpreadsheetRepository_setSpreadsheetOverride(
    spreadsheet
  );


  const result =
    SpreadsheetRepository_update(
      "製品マスター",
      {

        "現在標準条件ID":
          "COND-000153",

        "最終更新日":
          "2026-08-04T08:00:00.000Z"

      },
      {

        "製品ID":
          "P-000035",

        "現在標準条件ID":
          "COND-000152"

      }
    );


  SpreadsheetRepositoryTest_assertEquals(
    1,
    result.affectedRows,
    "result.affectedRows"
  );


  const row =
    spreadsheet
      .getSheetByName(
        "製品マスター"
      )
      .getAllValues()[1];


  SpreadsheetRepositoryTest_assertDeepEquals(
    [
      "P-000035",
      "LEVER, CLAMP",
      "COND-000153",
      "2026-08-04T08:00:00.000Z"
    ],
    row,
    "updated row"
  );

}


/*
=========================================
DELETE
=========================================
*/

/**
 * criteriaに一致する1行だけ削除されることを確認する。
 */
function test_SpreadsheetRepository_delete() {

  const spreadsheet =
    SpreadsheetRepositoryTest_createSpreadsheet({

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
          "COND-000153",
          61
        ]

      ]

    });


  SpreadsheetRepository_setSpreadsheetOverride(
    spreadsheet
  );


  const result =
    SpreadsheetRepository_delete(
      "成形条件詳細マスター",
      {

        "条件ID":
          "COND-000153"

      }
    );


  SpreadsheetRepositoryTest_assertEquals(
    1,
    result.affectedRows,
    "result.affectedRows"
  );


  const rows =
    spreadsheet
      .getSheetByName(
        "成形条件詳細マスター"
      )
      .getAllValues();


  SpreadsheetRepositoryTest_assertDeepEquals(
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
    rows,
    "rows after delete"
  );

}


/*
=========================================
Execute Dispatch
=========================================
*/

/**
 * execute()がOperation Typeに応じて
 * 正しい処理へ振り分けることを確認する。
 */
function test_SpreadsheetRepository_executeDispatch() {

  const spreadsheet =
    SpreadsheetRepositoryTest_createSpreadsheet({

      "TestSheet": [

        [
          "ID",
          "Value"
        ]

      ]

    });


  SpreadsheetRepository_setSpreadsheetOverride(
    spreadsheet
  );


  const result =
    SpreadsheetRepository_execute(
      "insert",
      "TestSheet",
      {

        "ID":
          "TEST-001",

        "Value":
          "Inserted"

      },
      null
    );


  SpreadsheetRepositoryTest_assertEquals(
    1,
    result.affectedRows,
    "result.affectedRows"
  );


  SpreadsheetRepositoryTest_assertDeepEquals(
    [
      "TEST-001",
      "Inserted"
    ],
    spreadsheet
      .getSheetByName(
        "TestSheet"
      )
      .getAllValues()[1],
    "inserted row"
  );

}


/*
=========================================
Unknown Header
=========================================
*/

/**
 * Headerに存在しない項目を拒否することを確認する。
 */
function test_SpreadsheetRepository_unknownHeaderIsRejected() {

  const spreadsheet =
    SpreadsheetRepositoryTest_createSpreadsheet({

      "TestSheet": [

        [
          "ID",
          "Value"
        ]

      ]

    });


  SpreadsheetRepository_setSpreadsheetOverride(
    spreadsheet
  );


  SpreadsheetRepositoryTest_assertThrows(

    function() {

      SpreadsheetRepository_insert(
        "TestSheet",
        {

          "ID":
            "TEST-001",

          "UnknownField":
            "Invalid"

        }
      );

    },

    "SpreadsheetのHeaderに存在しない項目です。",

    "unknown header"

  );

}


/*
=========================================
Empty Criteria
=========================================
*/

/**
 * 空criteriaによるUPDATEを拒否することを確認する。
 */
function test_SpreadsheetRepository_emptyCriteriaIsRejected() {

  const spreadsheet =
    SpreadsheetRepositoryTest_createSpreadsheet({

      "TestSheet": [

        [
          "ID",
          "Value"
        ],

        [
          "TEST-001",
          "Before"
        ]

      ]

    });


  SpreadsheetRepository_setSpreadsheetOverride(
    spreadsheet
  );


  SpreadsheetRepositoryTest_assertThrows(

    function() {

      SpreadsheetRepository_update(
        "TestSheet",
        {

          "Value":
            "After"

        },
        {}
      );

    },

    "criteriaは空Objectにできません。",

    "empty criteria"

  );

}


/*
=========================================
No Matching Row
=========================================
*/

/**
 * 一致行が0件の場合に拒否することを確認する。
 */
function test_SpreadsheetRepository_noMatchingRowIsRejected() {

  const spreadsheet =
    SpreadsheetRepositoryTest_createSpreadsheet({

      "TestSheet": [

        [
          "ID",
          "Value"
        ],

        [
          "TEST-001",
          "Before"
        ]

      ]

    });


  SpreadsheetRepository_setSpreadsheetOverride(
    spreadsheet
  );


  SpreadsheetRepositoryTest_assertThrows(

    function() {

      SpreadsheetRepository_update(
        "TestSheet",
        {

          "Value":
            "After"

        },
        {

          "ID":
            "UNKNOWN"

        }
      );

    },

    "criteriaに一致する行が存在しません。",

    "no matching row"

  );

}


/*
=========================================
Multiple Matching Rows
=========================================
*/

/**
 * 一致行が複数ある場合に拒否することを確認する。
 */
function test_SpreadsheetRepository_multipleMatchingRowsAreRejected() {

  const spreadsheet =
    SpreadsheetRepositoryTest_createSpreadsheet({

      "TestSheet": [

        [
          "ID",
          "Value"
        ],

        [
          "DUPLICATE",
          "First"
        ],

        [
          "DUPLICATE",
          "Second"
        ]

      ]

    });


  SpreadsheetRepository_setSpreadsheetOverride(
    spreadsheet
  );


  SpreadsheetRepositoryTest_assertThrows(

    function() {

      SpreadsheetRepository_delete(
        "TestSheet",
        {

          "ID":
            "DUPLICATE"

        }
      );

    },

    "criteriaに一致する行が複数存在します。",

    "multiple matching rows"

  );

}


/*
=========================================
Unresolved Binding
=========================================
*/

/**
 * 未解決bindingRefをRepositoryが拒否することを確認する。
 */
function test_SpreadsheetRepository_unresolvedBindingIsRejected() {

  const spreadsheet =
    SpreadsheetRepositoryTest_createSpreadsheet({

      "TestSheet": [

        [
          "ID",
          "Value"
        ]

      ]

    });


  SpreadsheetRepository_setSpreadsheetOverride(
    spreadsheet
  );


  SpreadsheetRepositoryTest_assertThrows(

    function() {

      SpreadsheetRepository_insert(
        "TestSheet",
        {

          "ID": {

            bindingRef:
              "NEW_CONDITION_ID"

          },

          "Value":
            "Invalid"

        }
      );

    },

    "SpreadsheetへObjectまたはArrayを直接書き込むことはできません。",

    "unresolved binding"

  );

}


/*
=========================================
Preserve Unspecified Columns
=========================================
*/

/**
 * UPDATEで指定していない列が
 * 元の値のまま保持されることを確認する。
 */
function test_SpreadsheetRepository_updatePreservesUnspecifiedColumns() {

  const spreadsheet =
    SpreadsheetRepositoryTest_createSpreadsheet({

      "TestSheet": [

        [
          "ID",
          "Name",
          "Status",
          "Memo"
        ],

        [
          "TEST-001",
          "Original Name",
          "before",
          "Keep This Memo"
        ]

      ]

    });


  SpreadsheetRepository_setSpreadsheetOverride(
    spreadsheet
  );


  SpreadsheetRepository_update(
    "TestSheet",
    {

      "Status":
        "after"

    },
    {

      "ID":
        "TEST-001",

      "Status":
        "before"

    }
  );


  SpreadsheetRepositoryTest_assertDeepEquals(
    [
      "TEST-001",
      "Original Name",
      "after",
      "Keep This Memo"
    ],
    spreadsheet
      .getSheetByName(
        "TestSheet"
      )
      .getAllValues()[1],
    "updated row"
  );

}


/*
=========================================
Override
=========================================
*/

/**
 * Spreadsheet Overrideが解除されることを確認する。
 */
function test_SpreadsheetRepository_spreadsheetOverrideIsCleared() {

  const spreadsheet =
    SpreadsheetRepositoryTest_createSpreadsheet({

      "TestSheet": [

        [
          "ID"
        ]

      ]

    });


  SpreadsheetRepository_setSpreadsheetOverride(
    spreadsheet
  );


  SpreadsheetRepositoryTest_assertEquals(
    spreadsheet,
    SpreadsheetRepository_spreadsheetOverride,
    "override before clear"
  );


  SpreadsheetRepository_clearSpreadsheetOverride();


  SpreadsheetRepositoryTest_assertEquals(
    null,
    SpreadsheetRepository_spreadsheetOverride,
    "override after clear"
  );

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
function SpreadsheetRepositoryTest_createSpreadsheet(
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
        SpreadsheetRepositoryTest_createSheet(
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

    getSheets:
      function() {

        return Object.keys(
          sheets
        ).map(
          function(sheetName) {

            return sheets[
              sheetName
            ];

          }
        );

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
function SpreadsheetRepositoryTest_createSheet(
  sheetName,
  initialValues
) {

  let values =
    SpreadsheetRepositoryTest_deepCopy(
      initialValues
    );


  const sheet = {

    getName:
      function() {

        return sheetName;

      },

    getLastColumn:
      function() {

        if (
          values.length ===
            0
        ) {

          return 0;

        }


        return values[0].length;

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

        return SpreadsheetRepositoryTest_createRange(
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

                const sourceRowIndex =
                  startRow -
                  1 +
                  rowOffset;


                const sourceColumnIndex =
                  startColumn -
                  1 +
                  columnOffset;


                const sourceRow =
                  values[
                    sourceRowIndex
                  ] ||
                  [];


                row.push(
                  sourceRow[
                    sourceColumnIndex
                  ] ===
                    undefined
                    ? ""
                    : sourceRow[
                        sourceColumnIndex
                      ]
                );

              }


              result.push(
                row
              );

            }


            return SpreadsheetRepositoryTest_deepCopy(
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

        return SpreadsheetRepositoryTest_deepCopy(
          values
        );

      }

  };


  return sheet;

}


/**
 * Fake Rangeを生成する。
 *
 * @param {Function} readValues
 * @param {Function} writeValues
 * @return {Object}
 */
function SpreadsheetRepositoryTest_createRange(
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
          SpreadsheetRepositoryTest_deepCopy(
            newValues
          )
        );


        return this;

      }

  };

}


/*
=========================================
Assertion
=========================================
*/

function SpreadsheetRepositoryTest_assertEquals(
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


function SpreadsheetRepositoryTest_assertDeepEquals(
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


function SpreadsheetRepositoryTest_assertThrows(
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


function SpreadsheetRepositoryTest_deepCopy(
  value
) {

  return JSON.parse(
    JSON.stringify(
      value
    )
  );

}



