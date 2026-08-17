/*
=========================================
SHiCI
121_StandardConditionFieldRegistryTest.js

Standard Condition Field Registry Test
Version 1.0

役割：
・標準成形条件Field Registryの
  定義・検索・一覧・不変性を検証する
=========================================
*/


/*
=========================================
Test Runner
=========================================
*/

/**
 * StandardConditionFieldRegistryの
 * 全テストを実行する。
 */
function test_StandardConditionFieldRegistry_runAll() {

  const tests = [

    {
      name:
        "findsMoldTemperature",
      run:
        test_StandardConditionFieldRegistry_findsMoldTemperature
    },

    {
      name:
        "findsCoolingTime",
      run:
        test_StandardConditionFieldRegistry_findsCoolingTime
    },

    {
      name:
        "findsHoldingPressureP1",
      run:
        test_StandardConditionFieldRegistry_findsHoldingPressureP1
    },

    {
        name:
            "findsDefinitionByPath",
        run:
            test_StandardConditionFieldRegistry_findsDefinitionByPath
    },

    {
        name:
            "requireByPathRejectsUnknownPath",
        run:
            test_StandardConditionFieldRegistry_requireByPathRejectsUnknownPath
    },

    {
      name:
        "normalizesChangeField",
      run:
        test_StandardConditionFieldRegistry_normalizesChangeField
    },

    {
      name:
        "unknownFieldReturnsNull",
      run:
        test_StandardConditionFieldRegistry_unknownFieldReturnsNull
    },

    {
      name:
        "requireRejectsUnknownField",
      run:
        test_StandardConditionFieldRegistry_requireRejectsUnknownField
    },

    {
      name:
        "listsEnabledDefinitions",
      run:
        test_StandardConditionFieldRegistry_listsEnabledDefinitions
    },

    {
      name:
        "listsChangeFields",
      run:
        test_StandardConditionFieldRegistry_listsChangeFields
    },

    {
      name:
        "returnedDefinitionIsDeepCopy",
      run:
        test_StandardConditionFieldRegistry_returnedDefinitionIsDeepCopy
    },

    {
      name:
        "allDefinitionsAreValid",
      run:
        test_StandardConditionFieldRegistry_allDefinitionsAreValid
    }

  ];


  const failures =
    [];


  console.log(
    "========================================="
  );

  console.log(
    "StandardConditionFieldRegistry Test Start"
  );

  console.log(
    "========================================="
  );


  tests.forEach(
    function(test) {

      try {

        test.run();


        console.log(
          "[PASS] " +
          test.name
        );

      } catch (error) {

        failures.push({

          name:
            test.name,

          message:
            error &&
            error.message
              ? error.message
              : String(
                  error
                )

        });


        console.error(
          "[FAIL] " +
          test.name +
          ": " +
          (
            error &&
            error.stack
              ? error.stack
              : error
          )
        );

      }

    }
  );


  if (
    failures.length >
      0
  ) {

    throw new Error(
      "StandardConditionFieldRegistry Test Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  console.log(
    "[Standard Condition Field Registry Ver.1.0 Test Passed]"
  );

}


/*
=========================================
Mold Temperature
=========================================
*/

/**
 * 金型温度の正式なField Definitionを
 * 取得できることを確認する。
 */
function test_StandardConditionFieldRegistry_findsMoldTemperature() {

  const definition =
    StandardConditionFieldRegistry_find(
      "mold_temperature"
    );


  StandardConditionFieldRegistryTest_assertObject(
    definition,
    "definition"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    "1.0",
    definition.registryVersion,
    "definition.registryVersion"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    "mold_temperature",
    definition.changeField,
    "definition.changeField"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    "standard_condition.mold_temperature",
    definition.path,
    "definition.path"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    "金型温度(℃)",
    definition.spreadsheetHeader,
    "definition.spreadsheetHeader"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    "金型温度",
    definition.label,
    "definition.label"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    "number",
    definition.valueType,
    "definition.valueType"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    "celsius",
    definition.canonicalUnit,
    "definition.canonicalUnit"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    "℃",
    definition.displayUnit,
    "definition.displayUnit"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    "create_new_version",
    definition.preservationPolicy,
    "definition.preservationPolicy"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    "standard_condition",
    definition.group,
    "definition.group"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    true,
    definition.enabled,
    "definition.enabled"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    true,
    StandardConditionFieldRegistry_isSupported(
      "mold_temperature"
    ),
    "isSupported(mold_temperature)"
  );

}


/*
=========================================
Cooling Time
=========================================
*/

/**
 * 冷却時間の正式なField Definitionを
 * 取得できることを確認する。
 */
function test_StandardConditionFieldRegistry_findsCoolingTime() {

  const definition =
    StandardConditionFieldRegistry_require(
      "cooling_time"
    );


  StandardConditionFieldRegistryTest_assertObject(
    definition,
    "definition"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    "cooling_time",
    definition.changeField,
    "definition.changeField"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    "standard_condition.cooling_time",
    definition.path,
    "definition.path"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    "冷却時間",
    definition.spreadsheetHeader,
    "definition.spreadsheetHeader"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    "冷却時間",
    definition.label,
    "definition.label"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    "second",
    definition.canonicalUnit,
    "definition.canonicalUnit"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    "秒",
    definition.displayUnit,
    "definition.displayUnit"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    true,
    StandardConditionFieldRegistry_isSupported(
      "cooling_time"
    ),
    "isSupported(cooling_time)"
  );

}



/*
=========================================
Holding Pressure P1
=========================================
*/

/**
 * 保圧力P1の正式なField Definitionを
 * 取得できることを確認する。
 */
function test_StandardConditionFieldRegistry_findsHoldingPressureP1() {

  const definition =
    StandardConditionFieldRegistry_require(
      "holding_pressure_p1"
    );


  StandardConditionFieldRegistryTest_assertObject(
    definition,
    "definition"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    "holding_pressure_p1",
    definition.changeField,
    "definition.changeField"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    "standard_condition.holding_pressure_p1",
    definition.path,
    "definition.path"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    "保圧力:P1",
    definition.spreadsheetHeader,
    "definition.spreadsheetHeader"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    "保圧力 P1",
    definition.label,
    "definition.label"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    "megapascal",
    definition.canonicalUnit,
    "definition.canonicalUnit"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    "MPa",
    definition.displayUnit,
    "definition.displayUnit"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    true,
    StandardConditionFieldRegistry_isSupported(
      "holding_pressure_p1"
    ),
    "isSupported(holding_pressure_p1)"
  );

}









/*
=========================================
Normalization
=========================================
*/

/**
 * 前後空白と大文字を含むchange.fieldでも、
 * 正規化して取得できることを確認する。
 */
function test_StandardConditionFieldRegistry_normalizesChangeField() {

  const definition =
    StandardConditionFieldRegistry_find(
      "  COOLING_TIME  "
    );


  StandardConditionFieldRegistryTest_assertObject(
    definition,
    "definition"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    "cooling_time",
    definition.changeField,
    "definition.changeField"
  );

}




/*
=========================================
Path Lookup
=========================================
*/

/**
 * Canonical PathからField Definitionを
 * 取得できることを確認する。
 */
function test_StandardConditionFieldRegistry_findsDefinitionByPath() {

  const moldTemperature =
    StandardConditionFieldRegistry_findByPath(
      "standard_condition.mold_temperature"
    );


  StandardConditionFieldRegistryTest_assertObject(
    moldTemperature,
    "moldTemperature"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    "mold_temperature",
    moldTemperature.changeField,
    "moldTemperature.changeField"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    "金型温度(℃)",
    moldTemperature.spreadsheetHeader,
    "moldTemperature.spreadsheetHeader"
  );


  const coolingTime =
    StandardConditionFieldRegistry_requireByPath(
      "standard_condition.cooling_time"
    );


  StandardConditionFieldRegistryTest_assertEquals(
    "cooling_time",
    coolingTime.changeField,
    "coolingTime.changeField"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    "冷却時間",
    coolingTime.spreadsheetHeader,
    "coolingTime.spreadsheetHeader"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    null,
    StandardConditionFieldRegistry_findByPath(
      "standard_condition.unknown"
    ),
    "unknown path"
  );

}


/**
 * requireByPath()が未登録Pathを
 * 拒否することを確認する。
 */
function test_StandardConditionFieldRegistry_requireByPathRejectsUnknownPath() {

  StandardConditionFieldRegistryTest_assertThrows(

    function() {

      StandardConditionFieldRegistry_requireByPath(
        "standard_condition.unknown"
      );

    },

    "未登録の標準成形条件Pathです。",

    "require unknown path"

  );

}










/*
=========================================
Unknown Field
=========================================
*/

/**
 * 未登録Fieldはnullになることを確認する。
 */
function test_StandardConditionFieldRegistry_unknownFieldReturnsNull() {

  StandardConditionFieldRegistryTest_assertEquals(
    null,
    StandardConditionFieldRegistry_find(
      "unknown_condition_field"
    ),
    "find(unknown_condition_field)"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    null,
    StandardConditionFieldRegistry_find(
      ""
    ),
    "find(empty)"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    null,
    StandardConditionFieldRegistry_find(
      null
    ),
    "find(null)"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    false,
    StandardConditionFieldRegistry_isSupported(
      "unknown_condition_field"
    ),
    "isSupported(unknown_condition_field)"
  );

}


/**
 * require()が未登録Fieldを拒否することを確認する。
 */
function test_StandardConditionFieldRegistry_requireRejectsUnknownField() {

  StandardConditionFieldRegistryTest_assertThrows(

    function() {

      StandardConditionFieldRegistry_require(
        "unknown_condition_field"
      );

    },

    "未登録の標準成形条件Fieldです。",

    "require unknown field"

  );

}


/*
=========================================
List
=========================================
*/

/**
 * 有効なField Definitionだけが
 * 一覧として返ることを確認する。
 */
function test_StandardConditionFieldRegistry_listsEnabledDefinitions() {

  const definitions =
    StandardConditionFieldRegistry_list();


  StandardConditionFieldRegistryTest_assertTrue(
    Array.isArray(
      definitions
    ),
    "definitions"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    20,
    definitions.length,
    "definitions.length"
  );


  const fields =
    definitions
      .map(
        function(definition) {

          return definition.changeField;

        }
      )
      .sort();


  StandardConditionFieldRegistryTest_assertDeepEquals(
    [
        "cooling_time",

        "holding_pressure_p1",
        "holding_pressure_p2",
        "holding_pressure_p3",
        "holding_pressure_p4",

        "holding_time_t1",
        "holding_time_t2",
        "holding_time_t3",
        "holding_time_t4",

        "injection_speed_v1",
        "injection_speed_v2",
        "injection_speed_v3",
        "injection_speed_v4",
        "injection_speed_v5",

        "injection_stroke_s1",
        "injection_stroke_s2",
        "injection_stroke_s3",
        "injection_stroke_s4",
        "injection_stroke_s5",

        "mold_temperature"
    ],
    fields,
    "definition fields"
  );


  definitions.forEach(
    function(definition) {

      StandardConditionFieldRegistryTest_assertEquals(
        true,
        definition.enabled,
        "definition.enabled"
      );

    }
  );

}


/**
 * change.field一覧が正しく返ることを確認する。
 */
function test_StandardConditionFieldRegistry_listsChangeFields() {

  const fields =
    StandardConditionFieldRegistry_listChangeFields()
      .slice()
      .sort();


  StandardConditionFieldRegistryTest_assertDeepEquals(
    [
        "cooling_time",

        "holding_pressure_p1",
        "holding_pressure_p2",
        "holding_pressure_p3",
        "holding_pressure_p4",

        "holding_time_t1",
        "holding_time_t2",
        "holding_time_t3",
        "holding_time_t4",

        "injection_speed_v1",
        "injection_speed_v2",
        "injection_speed_v3",
        "injection_speed_v4",
        "injection_speed_v5",

        "injection_stroke_s1",
        "injection_stroke_s2",
        "injection_stroke_s3",
        "injection_stroke_s4",
        "injection_stroke_s5",

        "mold_temperature"
    ],
    fields,
    "change fields"
  );

}


/*
=========================================
Immutability
=========================================
*/

/**
 * find()の返却値を書き換えても、
 * Registry原本が変わらないことを確認する。
 */
function test_StandardConditionFieldRegistry_returnedDefinitionIsDeepCopy() {

  const first =
    StandardConditionFieldRegistry_find(
      "mold_temperature"
    );


  first.label =
    "変更済みラベル";


  first.canonicalUnit =
    "modified_unit";


  const second =
    StandardConditionFieldRegistry_find(
      "mold_temperature"
    );


  StandardConditionFieldRegistryTest_assertEquals(
    "金型温度",
    second.label,
    "second.label"
  );


  StandardConditionFieldRegistryTest_assertEquals(
    "celsius",
    second.canonicalUnit,
    "second.canonicalUnit"
  );


  StandardConditionFieldRegistryTest_assertTrue(
    first !==
      second,
    "first !== second"
  );

}


/*
=========================================
Definition Validation
=========================================
*/

/**
 * 登録済みの全Field Definitionが、
 * Registry Ver.1.0の定義を満たすことを確認する。
 */
function test_StandardConditionFieldRegistry_allDefinitionsAreValid() {

  const definitions =
    StandardConditionFieldRegistry_list();


  StandardConditionFieldRegistryTest_assertTrue(
    definitions.length >
      0,
    "definitions.length"
  );


  definitions.forEach(
    function(definition) {

      StandardConditionFieldRegistryTest_assertEquals(
        true,
        StandardConditionFieldRegistry_validateDefinition(
          definition
        ),
        "validateDefinition(" +
        definition.changeField +
        ")"
      );

    }
  );

}


/*
=========================================
Assertions
=========================================
*/

function StandardConditionFieldRegistryTest_assertEquals(
  expected,
  actual,
  label
) {

  if (
    expected !==
      actual
  ) {

    throw new Error(
      "[AssertEquals Failed] " +
      label +
      " expected=" +
      JSON.stringify(
        expected
      ) +
      " actual=" +
      JSON.stringify(
        actual
      )
    );

  }

}


function StandardConditionFieldRegistryTest_assertDeepEquals(
  expected,
  actual,
  label
) {

  const expectedJson =
    JSON.stringify(
      expected
    );


  const actualJson =
    JSON.stringify(
      actual
    );


  if (
    expectedJson !==
      actualJson
  ) {

    throw new Error(
      "[AssertDeepEquals Failed] " +
      label +
      " expected=" +
      expectedJson +
      " actual=" +
      actualJson
    );

  }

}


function StandardConditionFieldRegistryTest_assertTrue(
  actual,
  label
) {

  if (
    actual !==
      true
  ) {

    throw new Error(
      "[AssertTrue Failed] " +
      label +
      " actual=" +
      JSON.stringify(
        actual
      )
    );

  }

}


function StandardConditionFieldRegistryTest_assertObject(
  actual,
  label
) {

  if (
    actual ===
      null ||
    typeof actual !==
      "object" ||
    Array.isArray(
      actual
    )
  ) {

    throw new Error(
      "[AssertObject Failed] " +
      label +
      " actual=" +
      JSON.stringify(
        actual
      )
    );

  }

}


/**
 * 例外が発生することを確認する。
 *
 * @param {Function} callback
 * @param {string|null} expectedMessage
 * @param {string} label
 */
function StandardConditionFieldRegistryTest_assertThrows(
  callback,
  expectedMessage,
  label
) {

  let thrownError =
    null;


  try {

    callback();

  } catch (error) {

    thrownError =
      error;

  }


  if (
    thrownError ===
      null
  ) {

    throw new Error(
      "[AssertThrows Failed] " +
      label +
      " 例外が発生しませんでした。"
    );

  }


  if (
    expectedMessage !==
      null
  ) {

    const actualMessage =
      thrownError &&
      typeof thrownError.message ===
        "string"
        ? thrownError.message
        : String(
            thrownError
          );


    if (
      actualMessage.indexOf(
        expectedMessage
      ) ===
        -1
    ) {

      throw new Error(
        "[AssertThrows Failed] " +
        label +
        " expectedMessage=" +
        JSON.stringify(
          expectedMessage
        ) +
        " actualMessage=" +
        JSON.stringify(
          actualMessage
        )
      );

    }

  }

}