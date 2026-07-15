/**
 * Entity Resolution用の文字列正規化
 *
 * ・全角／半角を統一
 * ・大文字／小文字を統一
 * ・記号を空白へ変換
 * ・連続する空白を統一
 */
function EntityResolution_normalizeText(value) {

  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(
      /[、。，．,・\/／_\-‐-–—―:：;；()（）[\]［］{}｛｝「」『』【】]/g,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();

}


/**
 * 正規化済みの入力とAliasが一致するか判定する。
 *
 * 1. 完全一致
 * 2. 一方が他方を含む
 * 3. 入力が複数単語の場合、すべての入力単語がAlias内に存在する
 *
 * 例:
 * 入力  : cover tail
 * Alias : COVER,24MM TAIL
 * 結果  : true
 */
function EntityResolution_isMatch(
  normalizedKeyword,
  normalizedAlias
) {

  if (
    !normalizedKeyword ||
    !normalizedAlias
  ) {
    return false;
  }

  // 完全一致
  if (
    normalizedKeyword ===
    normalizedAlias
  ) {
    return true;
  }

  // 従来の部分一致
  if (
    normalizedKeyword.includes(
      normalizedAlias
    ) ||
    normalizedAlias.includes(
      normalizedKeyword
    )
  ) {
    return true;
  }

  /*
   * 複数単語による照合
   *
   * cover tail
   * ↓
   * ["cover", "tail"]
   *
   * Alias側に両方存在すれば一致とする。
   */
  const keywordTokens =
    normalizedKeyword
      .split(" ")
      .filter(Boolean);

  if (keywordTokens.length < 2) {
    return false;
  }

  const aliasTokens =
    normalizedAlias
      .split(" ")
      .filter(Boolean);

  return keywordTokens.every(
    function(token) {
      return aliasTokens.includes(token);
    }
  );
}



function loadEntityResolutionKnowledge() {

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("Knowledge_EntityResolution");

  if (!sheet) {
    throw new Error("Knowledge_EntityResolution シートが見つかりません。");
  }

  const values = sheet.getDataRange().getValues();
  const headers = values.shift();

  Logger.log("=== Headers ===");
  Logger.log(headers);

  const list = values
    .filter(row => row[0])
    .map(row => {
      const item = {};
      headers.forEach((header, index) => {
        item[header] = row[index];
      });
      return item;
    });

  Logger.log("=== Count ===");
  Logger.log(list.length);

  Logger.log("=== First ===");
  Logger.log(JSON.stringify(list[0]));

  return list;
}



function resolveEntityCandidates(question) {
  const keyword =
    EntityResolution_normalizeText(
      extractSearchKeyword(question)
    );
  const knowledge = loadEntityResolutionKnowledge();

  const candidates = [];

  knowledge.forEach(function(item) {
    const alias =
      EntityResolution_normalizeText(
        item.alias
      );

    if (!alias) {
      return;
    }

    if (
      EntityResolution_isMatch(
        keyword,
        alias
      )
    ) {
      candidates.push({
        originalText: question,
        keyword: item.keyword,
        alias: item.alias,
        entityType: item.entityType,
        entityId: item.entityId,
        priority: Number(item.priority || 999),
        notes: item.notes
      });
    }
  });

  const merged = {};

  candidates.forEach(function(candidate) {
    const key =
      candidate.entityType + ":" + candidate.entityId;

    if (!merged[key]) {
      merged[key] = {
        originalText: candidate.originalText,
        keyword: candidate.keyword,
        alias: candidate.alias,
        entityType: candidate.entityType,
        entityId: candidate.entityId,
        priority: candidate.priority,
        notes: candidate.notes,
        sources: []
      };
    }

    merged[key].sources.push({
      alias: candidate.alias,
      keyword: candidate.keyword,
      notes: candidate.notes,
      priority: candidate.priority
    });

    if (candidate.priority < merged[key].priority) {
      merged[key].priority = candidate.priority;
      merged[key].keyword = candidate.keyword;
      merged[key].alias = candidate.alias;
      merged[key].notes = candidate.notes;
    }
  });

  const entityCandidates = Object.values(merged);

  entityCandidates.sort(function(a, b) {
    return a.priority - b.priority;
  });

  /*
  * Knowledge Resolutionで候補が見つかった場合は、
  * その結果をそのまま返す。
  */
  if (entityCandidates.length > 0) {
    return entityCandidates;
  }

  /*
  * Knowledge Resolutionで解決できなかったため、
  * Semantic Resolutionを実行する。
  */
  const semanticCandidates =
    SemanticEntityResolution_findCandidates(
      question,
      knowledge
    );

  if (semanticCandidates.length > 0) {

    semanticCandidates.sort(function(a, b) {

      return (
        b.semanticConfidence -
        a.semanticConfidence
      );

    });

    return semanticCandidates;

  }

  return [];
}

