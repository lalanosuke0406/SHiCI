/*
=========================================
SHiCI
104_ConfirmationPresentationFormatterTest.js

Confirmation Presentation Formatter
Version 1.0 Test

役割：
・Change Planを表示用情報へ変換できることを確認する
・内部単位を表示単位へ変換できることを確認する
・製品名と図番からMessageを生成できることを確認する
・未対応Pathを拒否することを確認する
・Change Planを変更しないことを確認する

禁止：
・Spreadsheetを更新しない
・Confirmation Proposalを保存しない
・OpenAI APIを呼び出さない
=========================================
*/


/*
=========================================
Test Runner
=========================================
*/

/**
 * Confirmation Presentation Formatter
 * Ver.1.0の全テストを実行する。
 */
function ConfirmationPresentationFormatterTest_runAll() {

  const tests = [

    {
      name:
        "formatMoldTemperatureChange",
      run:
        ConfirmationPresentationFormatterTest_formatMoldTemperatureChange
    },

    {
        name:
            "formatCoolingTimeChange",
        run:
            ConfirmationPresentationFormatterTest_formatCoolingTimeChange
    },

    {
      name:
        "buildMessageWithDrawingNumber",
      run:
        ConfirmationPresentationFormatterTest_buildMessageWithDrawingNumber
    },

    {
      name:
        "buildMessageWithoutDrawingNumber",
      run:
        ConfirmationPresentationFormatterTest_buildMessageWithoutDrawingNumber
    },

    {
      name:
        "fallbackToCurrentSnapshotProduct",
      run:
        ConfirmationPresentationFormatterTest_fallbackToCurrentSnapshotProduct
    },

    {
      name:
        "unsupportedPathIsRejected",
      run:
        ConfirmationPresentationFormatterTest_unsupportedPathIsRejected
    },

    {
      name:
        "nonReadyChangePlanIsRejected",
      run:
        ConfirmationPresentationFormatterTest_nonReadyChangePlanIsRejected
    },

    {
      name:
        "emptyChangesIsRejected",
      run:
        ConfirmationPresentationFormatterTest_emptyChangesIsRejected
    },

    {
      name:
        "originalChangePlanIsNotModified",
      run:
        ConfirmationPresentationFormatterTest_originalChangePlanIsNotModified
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
      "Confirmation Presentation Formatter Test Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  console.log(
    "[Confirmation Presentation Formatter Ver.1.0 Test Passed]"
  );

}


/*
=========================================
正常系
=========================================
*/

/**
 * 金型温度変更が
 * 表示用情報へ変換されることを確認する。
 */
function ConfirmationPresentationFormatterTest_formatMoldTemperatureChange() {

  const changePlan =
    ConfirmationPresentationFormatterTest_createChangePlan();


  const presentation =
    ConfirmationPresentationFormatter_format(
      changePlan
    );


  ConfirmationPresentationFormatterTest_assertEqual(
    presentation.proposalType,
    "standard_condition_change",
    "proposalType"
  );


  ConfirmationPresentationFormatterTest_assertEqual(
    presentation.title,
    "標準成形条件の変更",
    "title"
  );


  ConfirmationPresentationFormatterTest_assertEqual(
    presentation.message,
    "LEVER, CLAMP（KLW-M374C-000）の標準成形条件を変更します。",
    "message"
  );


  ConfirmationPresentationFormatterTest_assertEqual(
    presentation.changes.length,
    1,
    "changes.length"
  );


  const change =
    presentation.changes[0];


  ConfirmationPresentationFormatterTest_assertEqual(
    change.path,
    "standard_condition.mold_temperature",
    "change.path"
  );


  ConfirmationPresentationFormatterTest_assertEqual(
    change.label,
    "金型温度",
    "change.label"
  );


  ConfirmationPresentationFormatterTest_assertEqual(
    change.before,
    60,
    "change.before"
  );


  ConfirmationPresentationFormatterTest_assertEqual(
    change.after,
    61,
    "change.after"
  );


  ConfirmationPresentationFormatterTest_assertEqual(
    change.unit,
    "℃",
    "change.unit"
  );

}



/**
 * 冷却時間変更が
 * Registry定義に基づいて表示用情報へ変換されることを確認する。
 */
function ConfirmationPresentationFormatterTest_formatCoolingTimeChange() {

  const changePlan =
    ConfirmationPresentationFormatterTest_createChangePlan();


  changePlan.changes = [

    {

      changeType:
        "state",

      path:
        "standard_condition.cooling_time",

      before:
        8,

      after:
        9,

      unit:
        "second",

      preservationPolicy:
        "create_new_version"

    }

  ];


  const presentation =
    ConfirmationPresentationFormatter_format(
      changePlan
    );


  ConfirmationPresentationFormatterTest_assertEqual(
    presentation.proposalType,
    "standard_condition_change",
    "proposalType"
  );


  ConfirmationPresentationFormatterTest_assertEqual(
    presentation.title,
    "標準成形条件の変更",
    "title"
  );


  ConfirmationPresentationFormatterTest_assertEqual(
    presentation.message,
    "LEVER, CLAMP（KLW-M374C-000）の標準成形条件を変更します。",
    "message"
  );


  ConfirmationPresentationFormatterTest_assertEqual(
    presentation.changes.length,
    1,
    "changes.length"
  );


  const change =
    presentation.changes[0];


  ConfirmationPresentationFormatterTest_assertEqual(
    change.path,
    "standard_condition.cooling_time",
    "change.path"
  );


  ConfirmationPresentationFormatterTest_assertEqual(
    change.label,
    "冷却時間",
    "change.label"
  );


  ConfirmationPresentationFormatterTest_assertEqual(
    change.before,
    8,
    "change.before"
  );


  ConfirmationPresentationFormatterTest_assertEqual(
    change.after,
    9,
    "change.after"
  );


  ConfirmationPresentationFormatterTest_assertEqual(
    change.unit,
    "秒",
    "change.unit"
  );

}







/**
 * 図番がある場合のMessageを確認する。
 */
function ConfirmationPresentationFormatterTest_buildMessageWithDrawingNumber() {

  const message =
    ConfirmationPresentationFormatter_buildMessage(
      "LEVER, CLAMP",
      "KLW-M374C-000"
    );


  ConfirmationPresentationFormatterTest_assertEqual(
    message,
    "LEVER, CLAMP（KLW-M374C-000）の標準成形条件を変更します。",
    "message"
  );

}


/**
 * 図番がない場合のMessageを確認する。
 */
function ConfirmationPresentationFormatterTest_buildMessageWithoutDrawingNumber() {

  const message =
    ConfirmationPresentationFormatter_buildMessage(
      "LEVER, CLAMP",
      null
    );


  ConfirmationPresentationFormatterTest_assertEqual(
    message,
    "LEVER, CLAMPの標準成形条件を変更します。",
    "message"
  );

}


/**
 * subjectとcurrentEntityに表示名がない場合、
 * currentSnapshot.productから取得できることを確認する。
 */
function ConfirmationPresentationFormatterTest_fallbackToCurrentSnapshotProduct() {

  const changePlan =
    ConfirmationPresentationFormatterTest_createChangePlan();


  changePlan.subject.displayName =
    null;

  changePlan.subject.drawingNumber =
    null;

  changePlan.currentEntity.displayName =
    null;

  changePlan.currentEntity.productName =
    null;

  changePlan.currentEntity.drawingNumber =
    null;


  const presentation =
    ConfirmationPresentationFormatter_format(
      changePlan
    );


  ConfirmationPresentationFormatterTest_assertEqual(
    presentation.message,
    "LEVER, CLAMP（KLW-M374C-000）の標準成形条件を変更します。",
    "message"
  );

}


/*
=========================================
異常系
=========================================
*/

/**
 * 未対応Pathを拒否することを確認する。
 */
function ConfirmationPresentationFormatterTest_unsupportedPathIsRejected() {

  const changePlan =
    ConfirmationPresentationFormatterTest_createChangePlan();


  changePlan.changes[0].path =
    "standard_condition.unknown";


  ConfirmationPresentationFormatterTest_assertThrows(
    function() {

      ConfirmationPresentationFormatter_format(
        changePlan
      );

    },
    "未対応のConfirmation表示項目です。path=standard_condition.unknown"
  );

}


/**
 * ready_for_confirmationではない
 * Change Planを拒否することを確認する。
 */
function ConfirmationPresentationFormatterTest_nonReadyChangePlanIsRejected() {

  const changePlan =
    ConfirmationPresentationFormatterTest_createChangePlan();


  changePlan.status =
    "blocked";


  ConfirmationPresentationFormatterTest_assertThrows(
    function() {

      ConfirmationPresentationFormatter_format(
        changePlan
      );

    },
    "Confirmation表示を生成するにはChange Planがready_for_confirmationである必要があります。"
  );

}


/**
 * changesが空のChange Planを
 * 拒否することを確認する。
 */
function ConfirmationPresentationFormatterTest_emptyChangesIsRejected() {

  const changePlan =
    ConfirmationPresentationFormatterTest_createChangePlan();


  changePlan.changes =
    [];


  ConfirmationPresentationFormatterTest_assertThrows(
    function() {

      ConfirmationPresentationFormatter_format(
        changePlan
      );

    },
    "Confirmation表示には1件以上のChangeが必要です。"
  );

}


/**
 * Formatterによって
 * 元のChange Planが変更されないことを確認する。
 */
function ConfirmationPresentationFormatterTest_originalChangePlanIsNotModified() {

  const changePlan =
    ConfirmationPresentationFormatterTest_createChangePlan();


  const originalJson =
    JSON.stringify(
      changePlan
    );


  ConfirmationPresentationFormatter_format(
    changePlan
  );


  const afterJson =
    JSON.stringify(
      changePlan
    );


  ConfirmationPresentationFormatterTest_assertEqual(
    afterJson,
    originalJson,
    "changePlan"
  );

}


/*
=========================================
Fixture
=========================================
*/

/**
 * Formatter Test用のChange Planを生成する。
 *
 * @return {Object}
 */
function ConfirmationPresentationFormatterTest_createChangePlan() {

  return {

    schemaVersion:
      "1.0",

    changePlanId:
      "CHANGE-PLAN-TEST-001",

    status:
      "ready_for_confirmation",

    subject: {

      entityType:
        "product",

      entityId:
        "P-000035",

      displayName:
        "LEVER, CLAMP",

      drawingNumber:
        "KLW-M374C-000"

    },

    currentEntity: {

      entityType:
        "product",

      entityId:
        "P-000035",

      displayName:
        "LEVER, CLAMP",

      productName:
        "LEVER, CLAMP",

      drawingNumber:
        "KLW-M374C-000"

    },

    changes: [

      {
        changeType:
          "state",

        path:
          "standard_condition.mold_temperature",

        before:
          60,

        after:
          61,

        unit:
          "celsius"
      }

    ],

    currentSnapshot: {

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

        "版数":
          4

      },

      conditionDetail: {

        "金型温度(℃)":
          60

      }

    },

    proposedSnapshot: {

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
          null,

        "親条件ID":
          "COND-000152",

        "版数":
          5,

        "変更理由":
          "ワンワンの型温を61℃にして"

      },

      conditionDetail: {

        "金型温度(℃)":
          61

      }

    },

    snapshotPlan: {

      currentSnapshotId:
        "COND-000152",

      proposedSnapshotId:
        null,

      preservationPolicy:
        "create_new_version",

      preservesCurrentSnapshot:
        true,

      establishesAsCurrent:
        true

    },

    events:
      [],

    reason:
      "ワンワンの型温を61℃にして",

    confirmation: {

      required:
        true,

      status:
        "pending"
    },

    executable:
      false,

    metadata: {

      source:
        "entity_mutation",

      createdAt:
        "2026-07-31T17:30:00+09:00"

    }

  };

}


/*
=========================================
Assertion
=========================================
*/

function ConfirmationPresentationFormatterTest_assertEqual(
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


function ConfirmationPresentationFormatterTest_assertThrows(
  callback,
  expectedMessage
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
        expectedMessage
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
      expectedMessage
    ) ===
      -1
  ) {

    throw new Error(
      "例外メッセージが一致しません。expected=" +
      JSON.stringify(
        expectedMessage
      ) +
      " actual=" +
      JSON.stringify(
        actualMessage
      )
    );

  }

}



