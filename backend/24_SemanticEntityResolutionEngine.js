/**
 * SHiCI Semantic Entity Resolution Engine
 *
 * Knowledge Resolutionで一致するEntityが見つからなかった場合に、
 * AIを利用して一致可能性のあるCanonical Entity候補を取得する。
 *
 * Semantic ResolutionはEntityを自動確定しない。
 * 返された候補は、必ずユーザー確認へ渡す。
 */


/**
 * Semantic Resolutionを実行する。
 *
 * @param {string} entityQuery
 * @param {Array<Object>} resolutionKnowledge
 * @return {Array<Object>}
 */
function SemanticEntityResolution_findCandidates(
  entityQuery,
  resolutionKnowledge
) {

  const catalog =
    SemanticEntityResolution_buildCatalog(
      resolutionKnowledge
    );

  if (catalog.length === 0) {
    return [];
  }

  const contract =
    SemanticEntityResolution_buildContract(
      entityQuery,
      catalog
    );

  const result =
    LLMInterface_resolveEntityCandidates(
      contract
    );

  return SemanticEntityResolution_mapResult(
    result,
    catalog,
    entityQuery
  );
}


/**
 * AIへ渡すSemantic Resolution Contractを構築する。
 *
 * Knowledge全体は渡さず、
 * Entityの識別に必要な情報だけを渡す。
 */
function SemanticEntityResolution_buildContract(
  entityQuery,
  catalog
) {

  return {
    schemaVersion: "1.0",

    taskType:
      "semantic_entity_resolution",

    objective:
      "ユーザーが指している可能性のあるCanonical Entity候補を挙げる。",

    rules: [
      "候補一覧に存在するEntityだけを返す。",
      "新しいEntityを生成しない。",
      "完全な一致がなくても、表記揺れ、誤入力、言語差、語順差、略称の可能性を評価する。",
      "意味的な関連が弱いEntityは返さない。",
      "最大3件まで、可能性が高い順に返す。",
      "Entityを確定せず、ユーザー確認用の候補だけを返す。"
    ],

    entityQuery:
      String(entityQuery || "").trim(),

    candidates:
      catalog.map(function(item) {
        return {
          entityType:
            item.entityType,

          entityId:
            item.entityId,

          canonicalLabel:
            item.canonicalLabel,

          expressions:
            item.expressions,

          description:
            item.description
        };
      })
  };
}


/**
 * Canonical Entity候補一覧を構築する。
 *
 * ・Knowledge_EntityResolutionのAlias
 * ・製品マスターの製品名
 * ・図番
 * ・製品ID
 * ・注意点
 *
 * を同一Entityへまとめる。
 */
function SemanticEntityResolution_buildCatalog(
  resolutionKnowledge
) {

  const grouped = {};

  (resolutionKnowledge || []).forEach(
    function(item) {

      if (
        !item ||
        !item.entityType ||
        !item.entityId
      ) {
        return;
      }

      const key =
        item.entityType +
        ":" +
        item.entityId;

      if (!grouped[key]) {
        grouped[key] = {
          entityType:
            String(item.entityType),

          entityId:
            String(item.entityId),

          canonicalLabel:
            String(
              item.keyword ||
              item.alias ||
              item.entityId
            ),

          expressions: [],

          description: "",

          priority:
            Number(item.priority || 999),

          originalCandidate: {
            keyword:
              item.keyword,

            alias:
              item.alias,

            entityType:
              item.entityType,

            entityId:
              item.entityId,

            priority:
              Number(item.priority || 999),

            notes:
              item.notes
          }
        };
      }

      SemanticEntityResolution_addExpression(
        grouped[key].expressions,
        item.keyword
      );

      SemanticEntityResolution_addExpression(
        grouped[key].expressions,
        item.alias
      );

      SemanticEntityResolution_addExpression(
        grouped[key].expressions,
        item.entityId
      );

      if (item.notes) {
        grouped[key].description =
          String(item.notes);
      }

      if (
        Number(item.priority || 999) <
        grouped[key].priority
      ) {
        grouped[key].priority =
          Number(item.priority || 999);

        grouped[key].originalCandidate = {
          keyword:
            item.keyword,

          alias:
            item.alias,

          entityType:
            item.entityType,

          entityId:
            item.entityId,

          priority:
            Number(item.priority || 999),

          notes:
            item.notes
        };
      }
    }
  );

  /*
   * 製品マスターに存在するすべての製品を
   * Canonical Entity候補へ追加する。
   *
   * Knowledge_EntityResolutionへAlias登録がなくても、
   * 正式製品名・図番・製品IDは候補として利用できる。
   */
  const products =
    SemanticEntityResolution_loadProducts();

  products.forEach(function(product) {

    const productId =
      String(product["製品ID"] || "").trim();

    if (!productId) {
      return;
    }

    const key =
      "product:" + productId;

    if (!grouped[key]) {
      grouped[key] = {
        entityType: "product",
        entityId: productId,
        canonicalLabel:
          String(
            product["製品名"] ||
            product["図番"] ||
            productId
          ),
        expressions: [],
        description: "",
        priority: 999,
        originalCandidate: {
          keyword:
            product["製品名"] ||
            product["図番"] ||
            productId,

          alias:
            product["製品名"] ||
            product["図番"] ||
            productId,

          entityType: "product",
          entityId: productId,
          priority: 999,
          notes:
            product["注意点"] || ""
        }
      };
    }

    const target =
      grouped[key];

    if (product["製品名"]) {
      target.canonicalLabel =
        String(product["製品名"]);
    }

    SemanticEntityResolution_addExpression(
      target.expressions,
      productId
    );

    SemanticEntityResolution_addExpression(
      target.expressions,
      product["図番"]
    );

    SemanticEntityResolution_addExpression(
      target.expressions,
      product["製品名"]
    );

    SemanticEntityResolution_addExpression(
      target.expressions,
      product["注意点"]
    );

    const descriptions = [];

    if (product["図番"]) {
      descriptions.push(
        "図番: " + product["図番"]
      );
    }

    if (product["注意点"]) {
      descriptions.push(
        "注意点・通称: " +
        product["注意点"]
      );
    }

    if (descriptions.length > 0) {
      target.description =
        descriptions.join(" / ");
    }
  });

  return Object.keys(grouped)
    .map(function(key) {
      return grouped[key];
    })
    .sort(function(a, b) {
      return a.priority - b.priority;
    });
}


/**
 * 製品マスターから、
 * Entity識別に必要な情報だけを取得する。
 */
function SemanticEntityResolution_loadProducts() {

  const sheet =
    SpreadsheetApp
      .openById(SPREADSHEET_ID)
      .getSheetByName("製品マスター");

  if (!sheet) {
    throw new Error(
      "製品マスターが見つかりません。"
    );
  }

  const values =
    sheet.getDataRange().getValues();

  if (values.length < 2) {
    return [];
  }

  const headers =
    values[0];

  return values
    .slice(1)
    .filter(function(row) {
      return row.some(function(value) {
        return value !== "";
      });
    })
    .map(function(row) {

      const product = {};

      headers.forEach(
        function(header, index) {
          product[header] = row[index];
        }
      );

      return product;
    });
}


/**
 * 重複しない表現をEntity候補へ追加する。
 */
function SemanticEntityResolution_addExpression(
  expressions,
  value
) {

  const text =
    String(value || "").trim();

  if (!text) {
    return;
  }

  if (!expressions.includes(text)) {
    expressions.push(text);
  }
}


/**
 * LLMの結果を、既存の候補Entity形式へ戻す。
 *
 * LLMが存在しないEntity IDを返しても採用しない。
 */
function SemanticEntityResolution_mapResult(
  result,
  catalog,
  originalText
) {

  if (
    !result ||
    !Array.isArray(result.candidates)
  ) {
    return [];
  }

  const catalogMap = {};

  catalog.forEach(function(item) {
    const key =
      item.entityType +
      ":" +
      item.entityId;

    catalogMap[key] = item;
  });

  const mapped = [];
  const used = {};

  result.candidates.forEach(
    function(candidate) {

      if (!candidate) {
        return;
      }

      const key =
        String(candidate.entityType || "") +
        ":" +
        String(candidate.entityId || "");

      const catalogItem =
        catalogMap[key];

      if (
        !catalogItem ||
        used[key]
      ) {
        return;
      }

      used[key] = true;

      const original =
        catalogItem.originalCandidate;

      mapped.push({
        originalText:
          originalText,

        keyword:
          original.keyword,

        alias:
          original.alias,

        entityType:
          catalogItem.entityType,

        entityId:
          catalogItem.entityId,

        priority:
          original.priority,

        notes:
          original.notes,

        resolutionMethod:
          "semantic",

        semanticConfidence:
          Number(
            candidate.confidence || 0
          ),

        semanticReason:
          String(
            candidate.reason || ""
          )
      });
    }
  );

  return mapped.slice(0, 3);
}