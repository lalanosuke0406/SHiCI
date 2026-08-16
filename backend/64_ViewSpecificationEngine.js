/*
=========================================
SHiCI
64_ViewSpecificationEngine.js

View Specification Engine
Version 1.0

役割：
・Canonical ViewとSnapshotから
  View Specification Resultを生成する
・View RegistryとField Registryを
  組み合わせてKnowledgeを構造化する

禁止：
・Spreadsheetへ直接アクセスしない
・表示文章を生成しない
・値を推測・補完しない
=========================================
*/


/*
=========================================
Public API
=========================================
*/

/**
 * Canonical ViewとSnapshotから
 * View Specification Resultを生成する。
 *
 * @param {string} viewName
 * @param {Object} snapshot
 * @return {Object}
 */
function ViewSpecificationEngine_build(
  viewName,
  snapshot
) {

  const definition =
    ViewSpecificationRegistry_require(
      viewName
    );


  const result =
    ViewSpecificationContract_createEmpty();


  result.viewName =
    definition.viewName;

  result.label =
    definition.label;


  const conditionDetail =
    (
      snapshot &&
      snapshot.conditionDetail &&
      typeof snapshot.conditionDetail ===
        "object"
    )
      ? snapshot.conditionDetail
      : {};


  definition.stages.forEach(
    function(stageDefinition) {

      const pressure =
        ViewSpecificationEngine_buildMember(
          stageDefinition.pressureField,
          "P" +
            String(
              stageDefinition.stage
            ),
          conditionDetail
        );


      const time =
        ViewSpecificationEngine_buildMember(
          stageDefinition.timeField,
          "T" +
            String(
              stageDefinition.stage
            ),
          conditionDetail
        );


      if (
        pressure.registered ===
          false &&
        time.registered ===
          false
      ) {

        return;

      }


      result.stages.push({

        stage:
          stageDefinition.stage,

        pressure:
          pressure,

        time:
          time

      });

    }
  );


  result.status =
    result.stages.length >
      0
      ? "ready"
      : "empty";


  return ViewSpecificationContract_validate(
    result
  );

}


/*
=========================================
Internal
=========================================
*/

/**
 * Canonical Fieldから
 * View Stage Memberを生成する。
 *
 * @param {string} changeField
 * @param {string} label
 * @param {Object} conditionDetail
 * @return {Object}
 */
function ViewSpecificationEngine_buildMember(
  changeField,
  label,
  conditionDetail
) {

  const fieldDefinition =
    StandardConditionFieldRegistry_require(
      changeField
    );


  const value =
    conditionDetail[
      fieldDefinition.spreadsheetHeader
    ];


  const registered =
    !(
      value ===
        null ||
      value ===
        undefined ||
      value ===
        ""
    );


  return {

    field:
      fieldDefinition.changeField,

    label:
      label,

    value:
      registered
        ? value
        : null,

    unit:
      fieldDefinition.displayUnit,

    registered:
      registered

  };

}