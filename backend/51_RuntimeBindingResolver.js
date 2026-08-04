/*
=========================================
SHiCI
51_RuntimeBindingResolver.js

Runtime Binding Resolver
Version 1.1

役割：
・Execution Plan内のRuntime Bindingを解決する
・bindingIdと実値のBinding Mapを生成する
・Execution Result用のBinding Resultを生成する

禁止：
・Execution Plan原本を変更しない
・Operation内のbindingRefを置換しない
・Operationを実行しない
・Spreadsheetの行を追加・更新・削除しない
・Entityを検索しない
・Snapshotを生成しない
・LLMを呼び出さない

設計原則：
・Execution PlanはImmutableである
・bindingRefの実値変換は
  SpreadsheetOperationExecutorが実行直前に行う
=========================================
*/


/*
=========================================
Public API
=========================================
*/

/**
 * Execution Plan内のRuntime Bindingを解決する。
 *
 * Execution Plan原本は変更しない。
 * Operation内のbindingRefも置換しない。
 *
 * @param {Object} executionPlan
 * @return {Object}
 */
function RuntimeBindingResolver_resolve(
  executionPlan
) {

  /*
  =========================================
  Input Validation
  =========================================
  */

  ExecutionPlanContract_validate(
    executionPlan
  );


  /*
   * 原本不変性を明確にするため、
   * Resolver内部でもExecution Planを
   * 変更する処理は一切行わない。
   */
  const originalExecutionPlanJson =
    JSON.stringify(
      executionPlan
    );


  /*
  =========================================
  Binding Resolution
  =========================================
  */

  const bindingMap =
    RuntimeBindingResolver_resolveBindings(
      executionPlan.bindings
    );


  const bindingResults =
    RuntimeBindingResolver_createBindingResults(
      executionPlan.bindings,
      bindingMap
    );


  /*
  =========================================
  Immutability Check
  =========================================
  */

  if (
    JSON.stringify(
      executionPlan
    ) !==
      originalExecutionPlanJson
  ) {

    throw new Error(
      "RuntimeBindingResolverによってExecution Plan原本が変更されました。"
    );

  }


  return {

    bindingMap:
      bindingMap,

    bindingResults:
      bindingResults

  };

}


/*
=========================================
Binding Resolution
=========================================
*/

/**
 * Binding配列を解決し、
 * bindingIdと実値のMapを返す。
 *
 * @param {Array<Object>} bindings
 * @return {Object}
 */
function RuntimeBindingResolver_resolveBindings(
  bindings
) {

  if (
    !Array.isArray(
      bindings
    )
  ) {

    throw new Error(
      "bindingsはArrayである必要があります。"
    );

  }


  const bindingMap =
    {};


  bindings.forEach(
    function(binding, index) {

      RuntimeBindingResolver_assertObject(
        binding,
        "bindings[" +
        index +
        "]"
      );


      const bindingId =
        RuntimeBindingResolver_requireNonEmptyString(
          binding.bindingId,
          "bindings[" +
          index +
          "].bindingId"
        );


      if (
        Object.prototype.hasOwnProperty.call(
          bindingMap,
          bindingId
        )
      ) {

        throw new Error(
          "bindingIdが重複しています。bindingId=" +
          bindingId
        );

      }


      const resolvedValue =
        RuntimeBindingResolver_resolveBinding(
          binding,
          index
        );


      bindingMap[
        bindingId
      ] =
        resolvedValue;

    }
  );


  return bindingMap;

}


/**
 * 1件のBindingを解決する。
 *
 * 既にresolvedValueが存在する場合は、
 * その値を再利用する。
 *
 * @param {Object} binding
 * @param {number} index
 * @return {string}
 */
function RuntimeBindingResolver_resolveBinding(
  binding,
  index
) {

  const label =
    "bindings[" +
    index +
    "]";


  /*
  =========================================
  Existing Resolved Value
  =========================================
  */

  if (
    binding.resolvedValue !==
      null
  ) {

    return RuntimeBindingResolver_requireNonEmptyString(
      binding.resolvedValue,
      label +
      ".resolvedValue"
    );

  }


  /*
  =========================================
  Binding Type
  =========================================
  */

  if (
    binding.bindingType !==
      "generated_id"
  ) {

    throw new Error(
      "未対応のbindingTypeです。" +
      " bindingType=" +
      binding.bindingType
    );

  }


  /*
  =========================================
  Generator
  =========================================
  */

  RuntimeBindingResolver_assertObject(
    binding.generator,
    label +
    ".generator"
  );


  if (
    binding.generator.type !==
      "sequence_id"
  ) {

    throw new Error(
      "未対応のgenerator.typeです。" +
      " generator.type=" +
      binding.generator.type
    );

  }


  const prefix =
    RuntimeBindingResolver_requireNonEmptyString(
      binding.generator.prefix,
      label +
      ".generator.prefix"
    );


  return RuntimeBindingResolver_generateSequenceId(
    prefix
  );

}





/*
=========================================
Generator Override
=========================================
*/

/**
 * テスト時だけ使用するID Generator。
 *
 * 通常運用ではnullのまま使用する。
 */
let RuntimeBindingResolver_idGeneratorOverride =
  null;


/**
 * テスト用ID Generatorを設定する。
 *
 * @param {Function|null} generator
 */
function RuntimeBindingResolver_setIdGeneratorOverride(
  generator
) {

  if (
    generator !==
      null &&
    typeof generator !==
      "function"
  ) {

    throw new Error(
      "ID Generator OverrideはFunctionまたはnullである必要があります。"
    );

  }


  RuntimeBindingResolver_idGeneratorOverride =
    generator;

}


/**
 * テスト用ID Generatorを解除する。
 */
function RuntimeBindingResolver_clearIdGeneratorOverride() {

  RuntimeBindingResolver_idGeneratorOverride =
    null;

}












/*
=========================================
ID Generation
=========================================
*/

/**
 * ID Generatorを使用して
 * 新しいIDを生成する。
 *
 * テスト用Overrideが設定されている場合は、
 * 本番のgenerateId()を呼ばない。
 *
 * @param {string} prefix
 * @return {string}
 */
function RuntimeBindingResolver_generateSequenceId(
  prefix
) {

  const normalizedPrefix =
    RuntimeBindingResolver_requireNonEmptyString(
      prefix,
      "prefix"
    );


  /*
  =========================================
  Test Override
  =========================================
  */

  if (
    RuntimeBindingResolver_idGeneratorOverride !==
      null
  ) {

    const overriddenId =
      RuntimeBindingResolver_idGeneratorOverride(
        normalizedPrefix
      );


    return RuntimeBindingResolver_requireNonEmptyString(
      overriddenId,
      "overriddenId"
    );

  }


  /*
  =========================================
  Production Generator
  =========================================
  */

  if (
    typeof generateId !==
      "function"
  ) {

    throw new Error(
      "generateId関数が定義されていません。"
    );

  }


  const generatedId =
    generateId(
      normalizedPrefix
    );


  return RuntimeBindingResolver_requireNonEmptyString(
    generatedId,
    "generatedId"
  );

}


/*
=========================================
Binding Results
=========================================
*/

/**
 * Execution Resultへ格納する
 * Binding Result配列を生成する。
 *
 * Execution PlanのBinding Objectは変更しない。
 *
 * @param {Array<Object>} bindings
 * @param {Object} bindingMap
 * @return {Array<Object>}
 */
function RuntimeBindingResolver_createBindingResults(
  bindings,
  bindingMap
) {

  if (
    !Array.isArray(
      bindings
    )
  ) {

    throw new Error(
      "bindingsはArrayである必要があります。"
    );

  }


  RuntimeBindingResolver_assertObject(
    bindingMap,
    "bindingMap"
  );


  return bindings.map(
    function(binding, index) {

      RuntimeBindingResolver_assertObject(
        binding,
        "bindings[" +
        index +
        "]"
      );


      const bindingId =
        RuntimeBindingResolver_requireNonEmptyString(
          binding.bindingId,
          "bindings[" +
          index +
          "].bindingId"
        );


      if (
        !Object.prototype.hasOwnProperty.call(
          bindingMap,
          bindingId
        )
      ) {

        throw new Error(
          "Binding Resultを生成できません。" +
          " bindingId=" +
          bindingId +
          " の解決値が存在しません。"
        );

      }


      const result =
        ExecutionResultContract_createEmptyBindingResult();


      result.bindingId =
        bindingId;


      result.resolvedValue =
        RuntimeBindingResolver_requireNonEmptyString(
          bindingMap[
            bindingId
          ],
          "bindingMap." +
          bindingId
        );


      result.resolved =
        true;


      return result;

    }
  );

}


/*
=========================================
Binding Reference Resolution
=========================================
*/

/**
 * 任意のJSON互換値に含まれるbindingRefを、
 * Binding Mapの実値へ置換した複製を返す。
 *
 * この関数はExecution Plan原本を変更しない。
 *
 * SpreadsheetOperationExecutorが、
 * Operation実行直前に使用する。
 *
 * @param {*} value
 * @param {Object} bindingMap
 * @param {string} path
 * @return {*}
 */
function RuntimeBindingResolver_resolveValue(
  value,
  bindingMap,
  path
) {

  RuntimeBindingResolver_assertObject(
    bindingMap,
    "bindingMap"
  );


  const normalizedPath =
    typeof path ===
      "string" &&
    path.trim() !==
      ""
      ? path.trim()
      : "value";


  return RuntimeBindingResolver_resolveValueInternal(
    value,
    bindingMap,
    normalizedPath
  );

}


/**
 * bindingRefを再帰的に解決する内部関数。
 *
 * @param {*} value
 * @param {Object} bindingMap
 * @param {string} path
 * @return {*}
 */
function RuntimeBindingResolver_resolveValueInternal(
  value,
  bindingMap,
  path
) {

  if (
    value ===
      null ||
    value ===
      undefined
  ) {

    return value;

  }


  if (
    Array.isArray(
      value
    )
  ) {

    return value.map(
      function(item, index) {

        return RuntimeBindingResolver_resolveValueInternal(
          item,
          bindingMap,
          path +
          "[" +
          index +
          "]"
        );

      }
    );

  }


  if (
    typeof value !==
      "object"
  ) {

    return value;

  }


  /*
  =========================================
  Binding Reference
  =========================================
  */

  if (
    Object.prototype.hasOwnProperty.call(
      value,
      "bindingRef"
    )
  ) {

    const keys =
      Object.keys(
        value
      );


    if (
      keys.length !==
        1
    ) {

      throw new Error(
        path +
        "のbindingRef ObjectにはbindingRef以外の項目を含められません。"
      );

    }


    const bindingId =
      RuntimeBindingResolver_requireNonEmptyString(
        value.bindingRef,
        path +
        ".bindingRef"
      );


    if (
      !Object.prototype.hasOwnProperty.call(
        bindingMap,
        bindingId
      )
    ) {

      throw new Error(
        "未解決のbindingRefです。" +
        " path=" +
        path +
        " bindingRef=" +
        bindingId
      );

    }


    return RuntimeBindingResolver_requireNonEmptyString(
      bindingMap[
        bindingId
      ],
      "bindingMap." +
      bindingId
    );

  }


  /*
  =========================================
  Normal Object
  =========================================
  */

  const resolvedObject =
    {};


  Object.keys(
    value
  ).forEach(
    function(key) {

      resolvedObject[
        key
      ] =
        RuntimeBindingResolver_resolveValueInternal(
          value[
            key
          ],
          bindingMap,
          path +
          "." +
          key
        );

    }
  );


  return resolvedObject;

}


/*
=========================================
Utility
=========================================
*/

/**
 * Objectであることを確認する。
 *
 * @param {*} value
 * @param {string} label
 */
function RuntimeBindingResolver_assertObject(
  value,
  label
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

    throw new Error(
      label +
      "はObjectである必要があります。"
    );

  }

}


/**
 * 空でないstringを返す。
 *
 * @param {*} value
 * @param {string} label
 * @return {string}
 */
function RuntimeBindingResolver_requireNonEmptyString(
  value,
  label
) {

  if (
    typeof value !==
      "string" ||
    value.trim() ===
      ""
  ) {

    throw new Error(
      label +
      "は空でないstringである必要があります。"
    );

  }


  return value.trim();

}