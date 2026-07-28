/*
=========================================
SHiCI
KnowledgeBoundaryEngine.js

役割：
・Knowledge Boundary判定
=========================================
*/

/**
 * SHiCI Knowledge Boundary Engine
 *
 * 発話がどのKnowledge Boundaryで処理されるべきかを判定する。
 *
 * Version 1.1
 */


/**
 * 発話のKnowledge Boundaryを選択する。
 *
 * 判定は保守的に行う。
 * 判断できない場合はCompany Knowledgeへ委譲する。
 *
 * @param {string} text
 * @return {string}
 */
function KnowledgeBoundaryEngine_select(text) {

  const normalized =
    KnowledgeBoundaryEngine_normalizeText(text);

  /*
   * Communication
   */
  if (
    CommunicationEngine_canHandle(
      normalized
    )
  ) {
    return "communication";
  }

  /*
   * General Knowledge
   *
   * Company Knowledgeを必要としない
   * 明らかな一般知識のみ対象。
   */
  if (
    GeneralKnowledgeEngine_canHandle(
      normalized
    )
  ) {
    return "general";
  }

  /*
   * Version 1.1では、
   * その他はCompany Knowledgeとして扱う。
   */
  return "knowledge";
}


/**
 * Boundary判定用に入力を正規化する。
 *
 * @param {string} text
 * @return {string}
 */
function KnowledgeBoundaryEngine_normalizeText(text) {

  return String(text || "")
    .normalize("NFKC")
    .trim();
}