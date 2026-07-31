/*
=========================================
SHiCI
101_ChangePlanInputProbe.js

Change Plan Input Probe
Version 1.0

役割：
・Entity Mutation Resolution後のMutationを確認する
・現在のProduct Snapshot構造を確認する
・Change Plan Engine実装前に
  実データのキーと値を確定する

禁止：
・Spreadsheetを更新しない
・成形条件を複製しない
・製品マスターを更新しない
・OpenAI APIを呼び出さない
=========================================
*/


/*
=========================================
Entry Point
=========================================
*/

/**
 * 「ワンワン」を対象として、
 *
 * Entity Mutation
 *     ↓
 * Entity Resolution
 *     ↓
 * Product Snapshot
 *
 * の実データを確認する。
 */
function ChangePlanInputProbe_run() {

  console.log(
    "[Change Plan Input Probe Start]"
  );


  /*
  =========================================
  1. Entity Mutation生成
  =========================================
  */

  const mutation =
    ChangePlanInputProbe_createMutation();


  EntityMutationContract_validate(
    mutation
  );


  console.log(
    "[1. Original Entity Mutation]\n" +
    JSON.stringify(
      mutation,
      null,
      2
    )
  );


  /*
  =========================================
  2. Entity Resolution
  =========================================
  */

  const resolutionResult =
    EntityMutationResolutionEngine_resolve(
      mutation
    );


  console.log(
    "[2. Entity Mutation Resolution Result]\n" +
    JSON.stringify(
      resolutionResult,
      null,
      2
    )
  );


  if (
    resolutionResult.status !==
      "resolved"
  ) {

    throw new Error(
      "対象Entityを一意に解決できませんでした。status=" +
      resolutionResult.status
    );

  }


  const resolvedMutation =
    resolutionResult.mutation;


  const productId =
    resolvedMutation.subject.entityId;


  if (
    typeof productId !==
      "string" ||
    productId.trim() ===
      ""
  ) {

    throw new Error(
      "解決結果にProduct IDがありません。"
    );

  }


  /*
  =========================================
  3. Product Snapshot取得
  =========================================
  */

  const snapshot =
    SnapshotEngine_getProductSnapshot(
      productId
    );


  console.log(
    "[3. Raw Product Snapshot]\n" +
    JSON.stringify(
      snapshot,
      null,
      2
    )
  );


  if (
    !snapshot ||
    snapshot.status !==
      "success"
  ) {

    throw new Error(
      "Product Snapshotを取得できませんでした。" +
      (
        snapshot &&
        snapshot.message
          ? " message=" +
            snapshot.message
          : ""
      )
    );

  }


  /*
  =========================================
  4. Snapshot構成要素のキー確認
  =========================================
  */

  const keyReport = {

    productKeys:
      ChangePlanInputProbe_getKeys(
        snapshot.product
      ),

    materialKeys:
      ChangePlanInputProbe_getKeys(
        snapshot.material
      ),

    machineKeys:
      ChangePlanInputProbe_getKeys(
        snapshot.machine
      ),

    moldKeys:
      ChangePlanInputProbe_getKeys(
        snapshot.mold
      ),

    conditionKeys:
      ChangePlanInputProbe_getKeys(
        snapshot.condition
      ),

    conditionDetailKeys:
      ChangePlanInputProbe_getKeys(
        snapshot.conditionDetail
      )

  };


  console.log(
    "[4. Snapshot Key Report]\n" +
    JSON.stringify(
      keyReport,
      null,
      2
    )
  );


  /*
  =========================================
  5. Change Plan候補値の確認
  =========================================
  */

  const valueReport = {

    resolvedProductId:
      productId,

    productName:
      ChangePlanInputProbe_findFirstValue(
        snapshot.product,
        [
          "製品名",
          "品名",
          "名称"
        ]
      ),

    drawingNumber:
      ChangePlanInputProbe_findFirstValue(
        snapshot.product,
        [
          "図番",
          "図面番号"
        ]
      ),

    currentConditionId:
      ChangePlanInputProbe_findFirstValue(
        snapshot.condition,
        [
          "条件ID",
          "成形条件ID"
        ]
      ),

    productCurrentConditionId:
      ChangePlanInputProbe_findFirstValue(
        snapshot.product,
        [
          "現在標準条件ID",
          "標準条件ID"
        ]
      ),

    moldTemperatureCandidates:
      ChangePlanInputProbe_findValuesByKeyword(
        snapshot.conditionDetail,
        [
          "型温",
          "金型温度",
          "mold"
        ]
      )

  };


  console.log(
    "[5. Change Plan Value Report]\n" +
    JSON.stringify(
      valueReport,
      null,
      2
    )
  );


  console.log(
    "[Change Plan Input Probe Completed]"
  );

}


/*
=========================================
Mutation Fixture
=========================================
*/

/**
 * 「ワンワンの型温を61℃にして」
 * に相当するEntity Mutationを生成する。
 *
 * @return {Object}
 */
function ChangePlanInputProbe_createMutation() {

  const mutation =
    EntityMutationContract_createEmpty();


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


  return mutation;

}


/*
=========================================
Inspection Utility
=========================================
*/

/**
 * Objectのキー一覧を返す。
 *
 * @param {*} value
 * @return {Array<string>}
 */
function ChangePlanInputProbe_getKeys(
  value
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

    return [];

  }


  return Object.keys(
    value
  );

}


/**
 * 指定した候補キーのうち、
 * 最初に存在した値を返す。
 *
 * @param {Object|null} object
 * @param {Array<string>} keys
 * @return {*}
 */
function ChangePlanInputProbe_findFirstValue(
  object,
  keys
) {

  if (
    object ===
      null ||
    typeof object !==
      "object" ||
    Array.isArray(
      object
    )
  ) {

    return null;

  }


  for (
    let index = 0;
    index < keys.length;
    index++
  ) {

    const key =
      keys[index];


    if (
      Object.prototype.hasOwnProperty.call(
        object,
        key
      )
    ) {

      return object[key];

    }

  }


  return null;

}


/**
 * キー名に指定語を含む値を列挙する。
 *
 * 金型温度を推測して採用するためではなく、
 * 実際の列名を調査するためだけに使用する。
 *
 * @param {Object|null} object
 * @param {Array<string>} keywords
 * @return {Array<Object>}
 */
function ChangePlanInputProbe_findValuesByKeyword(
  object,
  keywords
) {

  if (
    object ===
      null ||
    typeof object !==
      "object" ||
    Array.isArray(
      object
    )
  ) {

    return [];

  }


  const results =
    [];


  Object.keys(
    object
  ).forEach(
    function(key) {

      const normalizedKey =
        String(
          key
        ).toLowerCase();


      const matched =
        keywords.some(
          function(keyword) {

            return (
              normalizedKey.indexOf(
                String(
                  keyword
                ).toLowerCase()
              ) !==
                -1
            );

          }
        );


      if (
        matched
      ) {

        results.push({

          key:
            key,

          value:
            object[key]

        });

      }

    }
  );


  return results;

}


