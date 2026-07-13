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
  const keyword = extractSearchKeyword(question);
  const knowledge = loadEntityResolutionKnowledge();

  const candidates = [];

  knowledge.forEach(function(item) {
    const alias = String(item.alias || "").trim();

    if (!alias) {
      return;
    }

    if (
      keyword.includes(alias) ||
      alias.includes(keyword)
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

  return entityCandidates;
}

