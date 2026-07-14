/**
 * SHiCI Configuration
 *
 * SHiCI全体で利用する設定値を管理する。
 */

const API_KEY = "sft-db-seikei";

const SPREADSHEET_ID =
  "11IIpg3p27QKJFkdeUFviI1R6RJ6OSjbOpcgMczEy9sE";


/**
 * 使用するLLM Provider
 */
function Config_getLLMProvider() {

  return "mock";

}


/**
 * OpenAI API Key
 *
 * Apps Script
 * Script Properties
 * OPENAI_API_KEY
 */
function Config_getOpenAIApiKey() {

  const apiKey =
    PropertiesService
      .getScriptProperties()
      .getProperty("OPENAI_API_KEY");

  if (!apiKey) {

    throw new Error(
      "Script PropertiesにOPENAI_API_KEYが設定されていません。"
    );

  }

  return apiKey;

}


/**
 * 使用モデル
 */
function Config_getOpenAIModel() {

  const model =
    PropertiesService
      .getScriptProperties()
      .getProperty("OPENAI_MODEL");

  if (
    model &&
    String(model).trim()
  ) {

    return String(model).trim();

  }

  return "gpt-5.5";

}


/**
 * 最大出力トークン
 */
function Config_getOpenAIMaxOutputTokens() {

  const value =
    PropertiesService
      .getScriptProperties()
      .getProperty("OPENAI_MAX_OUTPUT_TOKENS");

  if (!value) {

    return 1000;

  }

  const number =
    Number(value);

  if (
    Number.isNaN(number) ||
    number <= 0
  ) {

    return 1000;

  }

  return number;

}