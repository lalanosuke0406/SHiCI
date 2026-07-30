/*
=========================================
SHiCI
27_UpdateIntentEngine.js

役割：
・更新指示の判定
・更新値の抽出
・更新意図の構造化

このEngineは、
マスターデータを書き換えない。
=========================================
*/


/*
=========================================
公開関数
=========================================
*/

/**
 * ユーザー発言から更新意図を解析する
 *
 * 現在対応する更新：
 * ・金型温度
 *
 * @param {string} text
 * @returns {Object|null}
 */
function UpdateIntentEngine_analyze(
  text
) {

  const normalizedText =
    UpdateIntentEngine_normalizeText(
      text
    );

  if (!normalizedText) {

    return null;

  }

  /*
   * 金型温度に関する発言でなければ、
   * 更新意図として扱わない。
   */
  if (
    !UpdateIntentEngine_containsMoldTemperatureKeyword(
      normalizedText
    )
  ) {

    return null;

  }

  /*
   * 「型温は？」
   * 「型温を教えて」
   * などの参照質問を、
   * 更新と誤判定しない。
   */
  if (
    !UpdateIntentEngine_containsUpdateExpression(
      normalizedText
    )
  ) {

    return null;

  }

  const newMoldTemperature =
    UpdateIntentEngine_extractMoldTemperature(
      normalizedText
    );

  /*
   * 更新表現はあるが、
   * 新しい温度を取得できない場合。
   *
   * 例：
   * 「型温を変更して」
   */
  if (
    newMoldTemperature ===
    null
  ) {

    return {
      status:
        "incomplete",

      intentType:
        "update",

      updateType:
        "mold_temperature",

      targetField:
        "金型温度(℃)",

      newValue:
        null,

      unit:
        "℃",

      message:
        "変更後の金型温度を指定してください。"
    };

  }

  return {
    status:
      "ready",

    intentType:
      "update",

    updateType:
      "mold_temperature",

    targetField:
      "金型温度(℃)",

    newValue:
      newMoldTemperature,

    unit:
      "℃"
  };

}


/*
=========================================
入力の正規化
=========================================
*/

/**
 * 意味を変えない範囲で入力を正規化する
 *
 * @param {string} text
 * @returns {string}
 */
function UpdateIntentEngine_normalizeText(
  text
) {

  return String(
    text || ""
  )
    .normalize(
      "NFKC"
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}


/*
=========================================
金型温度キーワード
=========================================
*/

/**
 * 金型温度に関する語が含まれるか
 *
 * @param {string} text
 * @returns {boolean}
 */
function UpdateIntentEngine_containsMoldTemperatureKeyword(
  text
) {

  return (
    text.includes(
      "金型温度"
    ) ||
    text.includes(
      "型温"
    )
  );

}


/*
=========================================
更新表現
=========================================
*/

/**
 * 更新を明示する表現が含まれるか
 *
 * @param {string} text
 * @returns {boolean}
 */
function UpdateIntentEngine_containsUpdateExpression(
  text
) {

  const updatePatterns = [

    /変更/,
    /更新/,
    /修正/,
    /設定/,
    /登録/,
    /書き換え/,
    /置き換え/,
    /変えて/,
    /変える/,
    /にして/,
    /にする/

  ];

  return updatePatterns.some(
    function(pattern) {

      return pattern.test(
        text
      );

    }
  );

}


/*
=========================================
金型温度の抽出
=========================================
*/

/**
 * 発言から変更後の金型温度を抽出する
 *
 * 対応例：
 * ・型温を70℃に変更して
 * ・金型温度を70度にして
 * ・型温70に変更
 * ・70℃へ変更して
 *
 * @param {string} text
 * @returns {number|null}
 */
function UpdateIntentEngine_extractMoldTemperature(
  text
) {

  const patterns = [

    /*
     * 型温を70℃に変更
     * 金型温度を70度にして
     */
    /(?:金型温度|型温)\s*(?:を|は|:|：)?\s*(-?\d+(?:\.\d+)?)\s*(?:℃|度)?\s*(?:に|へ)?\s*(?:変更|更新|修正|設定|登録|書き換え|置き換え|変えて|変える|にして|にする)/,

    /*
     * 70℃に型温を変更
     */
    /(-?\d+(?:\.\d+)?)\s*(?:℃|度)\s*(?:に|へ)?\s*(?:金型温度|型温)\s*(?:を|は)?\s*(?:変更|更新|修正|設定|登録|書き換え|置き換え|変えて|変える)/,

    /*
     * 型温を変更して、70℃
     */
    /(?:金型温度|型温)[\s\S]*?(?:変更|更新|修正|設定|登録|書き換え|置き換え|変えて|変える|にして|にする)[\s\S]*?(-?\d+(?:\.\d+)?)\s*(?:℃|度)/,

    /*
     * 更新表現があり、明示的な温度単位がある場合
     * 例：ワンワンの型温を変更。70℃
     */
    /(-?\d+(?:\.\d+)?)\s*(?:℃|度)/

  ];

  for (
    let index = 0;
    index < patterns.length;
    index++
  ) {

    const match =
      text.match(
        patterns[index]
      );

    if (
      !match ||
      match[1] ===
        undefined
    ) {

      continue;

    }

    const value =
      Number(
        match[1]
      );

    if (
      Number.isFinite(
        value
      )
    ) {

      return value;

    }

  }

  return null;

}



/*
=========================================
更新対象Entityの検索語抽出
=========================================
*/

/**
 * 更新指示から、
 * 対象Entityを特定するための検索語を抽出する
 *
 * 例：
 *
 * 「ワンワンの型温を70℃に変更して」
 *     ↓
 * 「ワンワン」
 *
 * 「GX-F8 ボビンの金型温度を65度に設定」
 *     ↓
 * 「GX-F8 ボビン」
 *
 * 「型温を70℃に変更して」
 *     ↓
 * ""
 *
 * 対象名が省略されている場合は、
 * Conversation StateのcurrentEntityを
 * 後続処理で使用する。
 *
 * @param {string} text
 * @returns {string}
 */
function UpdateIntentEngine_extractTargetEntityQuery(
  text
) {

  let query =
    UpdateIntentEngine_normalizeText(
      text
    );

  if (!query) {

    return "";

  }


  /*
  =========================================
  金型温度キーワードより前を優先
  ==========================================
  */

  const keywordMatch =
    query.match(
      /金型温度|型温/
    );

  if (
    keywordMatch &&
    keywordMatch.index !==
      undefined
  ) {

    const beforeKeyword =
      query
        .slice(
          0,
          keywordMatch.index
        )
        .trim();

    /*
     * 通常の更新指示では、
     * 金型温度キーワードより前に
     * 対象製品名が置かれる。
     */
    if (beforeKeyword) {

      query =
        beforeKeyword;

    } else {

      query =
        "";

    }

  }


  /*
  =========================================
  温度値を除去
  ==========================================
  */

  query =
    query.replace(
      /-?\d+(?:\.\d+)?\s*(?:℃|度)/g,
      " "
    );


  /*
  =========================================
  更新操作を示す語を除去
  ==========================================
  */

  query =
    query.replace(
      /変更|更新|修正|設定|登録|書き換え|置き換え|変えて|変える|にして|にする/g,
      " "
    );


  /*
  =========================================
  金型温度キーワードを除去
  ==========================================
  */

  query =
    query.replace(
      /金型温度|型温/g,
      " "
    );


  /*
  =========================================
  操作文に付随する助詞を整理
  ==========================================
  */

  query =
    query
      .replace(
        /(?:を|は|へ|に)\s*$/g,
        ""
      )
      .replace(
        /の\s*$/g,
        ""
      )
      .replace(
        /^(?:を|は|へ|に|の)\s*/g,
        ""
      );


  /*
  =========================================
  空白を整理
  ==========================================
  */

  query =
    query
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  return query;

}



