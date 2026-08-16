/*
=========================================
SHiCI
59_ViewSpecificationContract.js

View Specification Contract
Version 1.0

役割：
・View Specification Resultの
  基本構造を定義する
・View Specification層の
  Contractを提供する

禁止：
・Spreadsheetへアクセスしない
・Snapshotを取得しない
・View固有のKnowledge解決をしない
・表示文章を生成しない
=========================================
*/


const VIEW_SPECIFICATION_CONTRACT_VERSION =
  "1.0";

const VIEW_SPECIFICATION_RESULT_TYPE =
  "view_specification_result";

const VIEW_SPECIFICATION_ALLOWED_STATUSES = [
  "draft",
  "ready",
  "empty"
];


/*
=========================================
Public API
=========================================
*/

/**
 * 空のView Specification Resultを生成する。
 *
 * @return {Object}
 */
function ViewSpecificationContract_createEmpty() {

  return {

    schemaVersion:
      VIEW_SPECIFICATION_CONTRACT_VERSION,

    resultType:
      VIEW_SPECIFICATION_RESULT_TYPE,

    viewName:
      null,

    label:
      null,

    status:
      "draft",

    stages:
      []

  };

}



/**
 * View Specification Resultを検証する。
 *
 * @param {Object} result
 * @return {Object}
 */
function ViewSpecificationContract_validate(
  result
) {

  if (
    !result ||
    typeof result !==
      "object" ||
    Array.isArray(
      result
    )
  ) {

    throw new Error(
      "View Specification ResultはObjectである必要があります。"
    );

  }


  if (
    result.schemaVersion !==
      VIEW_SPECIFICATION_CONTRACT_VERSION
  ) {

    throw new Error(
      "schemaVersionが不正です。"
    );

  }


  if (
    result.resultType !==
      VIEW_SPECIFICATION_RESULT_TYPE
  ) {

    throw new Error(
      "resultTypeが不正です。"
    );

  }


  if (
    VIEW_SPECIFICATION_ALLOWED_STATUSES.indexOf(
      result.status
    ) ===
      -1
  ) {

    throw new Error(
      "statusに許可されていない値が設定されています: " +
      String(
        result.status
      )
    );

  }


  if (
    !Array.isArray(
      result.stages
    )
  ) {

    throw new Error(
      "stagesはArrayである必要があります。"
    );

  }


    /*
  =========================================
  ready不変条件
  =========================================
  */

  if (
    result.status ===
      "ready"
  ) {

    if (
      typeof result.viewName !==
        "string" ||
      result.viewName.trim() ===
        ""
    ) {

      throw new Error(
        "readyではviewNameが必要です。"
      );

    }


    if (
      typeof result.label !==
        "string" ||
      result.label.trim() ===
        ""
    ) {

      throw new Error(
        "readyではlabelが必要です。"
      );

    }


        if (
      result.stages.length ===
        0
    ) {

      throw new Error(
        "readyではstagesが必要です。"
      );

    }


        result.stages.forEach(
      function(stage) {

        if (
          !stage ||
          typeof stage !==
            "object" ||
          Array.isArray(
            stage
          )
        ) {

          throw new Error(
            "stageはObjectである必要があります。"
          );

        }


        if (
          !stage.pressure ||
          typeof stage.pressure !==
            "object" ||
          Array.isArray(
            stage.pressure
          )
        ) {

          throw new Error(
            "Stageにはpressureが必要です。"
          );

        }


        if (
            !stage.time ||
            typeof stage.time !==
                "object" ||
            Array.isArray(
                stage.time
            )
        ) {

            throw new Error(
                "Stageにはtimeが必要です。"
            );

        }


        ViewSpecificationContract_validateStageMember(
            stage.pressure,
            "pressure"
        );


        ViewSpecificationContract_validateStageMember(
            stage.time,
            "time"
        );

      }
    );

  }


  /*
  =========================================
  empty不変条件
  =========================================
  */

  if (
    result.status ===
      "empty" &&
    result.stages.length !==
      0
  ) {

    throw new Error(
      "emptyではstagesが空である必要があります。"
    );

  }


  return JSON.parse(
    JSON.stringify(
      result
    )
  );

}


/**
 * Stage Memberを検証する。
 *
 * @param {Object} member
 * @param {string} memberName
 */
function ViewSpecificationContract_validateStageMember(
  member,
  memberName
) {

  if (
    typeof member.field !==
      "string" ||
    member.field.trim() ===
      ""
  ) {

    throw new Error(
      memberName +
      ".fieldが不正です。"
    );

  }


  if (
    typeof member.label !==
      "string" ||
    member.label.trim() ===
      ""
  ) {

    throw new Error(
      memberName +
      ".labelが不正です。"
    );

  }


  if (
    typeof member.unit !==
      "string" ||
    member.unit.trim() ===
      ""
  ) {

    throw new Error(
      memberName +
      ".unitが不正です。"
    );

  }


  if (
    typeof member.registered !==
      "boolean"
  ) {

    throw new Error(
      memberName +
      ".registeredはbooleanである必要があります。"
    );

  }


    /*
  =========================================
  registered / value 整合性
  =========================================
  */

  const valueIsEmpty =
    (
      member.value ===
        null ||
      member.value ===
        ""
    );


  if (
    member.registered ===
      true &&
    valueIsEmpty
  ) {

    throw new Error(
      memberName +
      ".valueはregistered=trueの場合に必要です。"
    );

  }


  if (
    member.registered ===
      false &&
    !valueIsEmpty
  ) {

    throw new Error(
      memberName +
      ".valueはregistered=falseの場合は未登録である必要があります。"
    );

  }

}