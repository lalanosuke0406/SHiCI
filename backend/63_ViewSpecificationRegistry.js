/*
=========================================
SHiCI
63_ViewSpecificationRegistry.js

View Specification Registry
Version 1.0

役割：
・Canonical Viewごとの
  View Definitionを管理する
・View Definitionを取得する

禁止：
・Spreadsheetへアクセスしない
・Snapshotを取得しない
・表示文章を生成しない
・実データ値を保持しない
=========================================
*/


const VIEW_SPECIFICATION_REGISTRY_VERSION =
  "1.0";


const VIEW_SPECIFICATION_DEFINITIONS = {

  holding_condition: {

    registryVersion:
      VIEW_SPECIFICATION_REGISTRY_VERSION,

    viewName:
      "holding_condition",

    label:
      "保圧条件",

    stages: [

      {
        stage:
          1,

        pressureField:
          "holding_pressure_p1",

        timeField:
          "holding_time_t1"
      },

      {
        stage:
          2,

        pressureField:
          "holding_pressure_p2",

        timeField:
          "holding_time_t2"
      },

      {
        stage:
          3,

        pressureField:
          "holding_pressure_p3",

        timeField:
          "holding_time_t3"
      },

      {
        stage:
          4,

        pressureField:
          "holding_pressure_p4",

        timeField:
          "holding_time_t4"
      }

    ]

  }

};


/*
=========================================
Public API
=========================================
*/

function ViewSpecificationRegistry_find(
  viewName
) {

  const normalized =
    String(
      viewName || ""
    ).trim();


  if (
    !normalized
  ) {

    return null;

  }


  const definition =
    VIEW_SPECIFICATION_DEFINITIONS[
      normalized
    ];


  if (
    !definition
  ) {

    return null;

  }


  return JSON.parse(
    JSON.stringify(
      definition
    )
  );

}


function ViewSpecificationRegistry_require(
  viewName
) {

  const definition =
    ViewSpecificationRegistry_find(
      viewName
    );


  if (
    definition ===
      null
  ) {

    throw new Error(
      "未登録のView Specificationです。 viewName=" +
      String(
        viewName
      )
    );

  }


  return definition;

}