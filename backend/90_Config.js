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

  return "openai";

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



/*
=========================================
Google Authentication
=========================================
*/

function Config_getGoogleClientId() {

  const clientId =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        "GOOGLE_CLIENT_ID"
      );

  if (
    !clientId ||
    !String(clientId).trim()
  ) {

    throw new Error(
      "GOOGLE_CLIENT_IDが設定されていません。"
    );

  }

  return String(clientId).trim();

}


/*
=========================================
Executive Message
=========================================
*/

function Config_getExecutiveMessageSpreadsheetId() {

  const spreadsheetId =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        "EXECUTIVE_MESSAGE_SPREADSHEET_ID"
      );

  if (
    !spreadsheetId ||
    !String(spreadsheetId).trim()
  ) {

    throw new Error(
      "EXECUTIVE_MESSAGE_SPREADSHEET_IDが設定されていません。"
    );

  }

  return String(spreadsheetId).trim();

}

function Config_getExecutiveMessageTrigger() {

  return Config_getRequiredScriptProperty(
    "EXECUTIVE_MESSAGE_TRIGGER"
  );

}

function Config_getExecutiveMessageChallenge() {

  return Config_getRequiredScriptProperty(
    "EXECUTIVE_MESSAGE_CHALLENGE"
  );

}

function Config_getExecutiveMessageResponse() {

  return Config_getRequiredScriptProperty(
    "EXECUTIVE_MESSAGE_RESPONSE"
  );

}

function Config_getRequiredScriptProperty(
  propertyName
) {

  const value =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        propertyName
      );

  if (
    !value ||
    !String(value).trim()
  ) {

    throw new Error(
      propertyName +
      "が設定されていません。"
    );

  }

  return String(value).trim();

}




/**
 * Executive Push Worker URLを取得する。
 *
 * @return {string}
 */
function Config_getExecutivePushWorkerUrl() {

  const value =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        "EXECUTIVE_PUSH_WORKER_URL"
      );

  if (
    !value ||
    !String(value).trim()
  ) {

    throw new Error(
      "EXECUTIVE_PUSH_WORKER_URL is not configured."
    );

  }

  return String(value).trim();

}


/**
 * Executive Push共有Secretを取得する。
 *
 * @return {string}
 */
function Config_getExecutivePushSharedSecret() {

  const value =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        "EXECUTIVE_PUSH_SHARED_SECRET"
      );

  if (
    !value ||
    !String(value).trim()
  ) {

    throw new Error(
      "EXECUTIVE_PUSH_SHARED_SECRET is not configured."
    );

  }

  return String(value).trim();

}


/**
 * Executive Push VAPID公開鍵を取得する。
 *
 * @return {string}
 */
function Config_getExecutivePushVapidPublicKey() {

  const value =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        "EXECUTIVE_PUSH_VAPID_PUBLIC_KEY"
      );

  if (
    !value ||
    !String(value).trim()
  ) {

    throw new Error(
      "EXECUTIVE_PUSH_VAPID_PUBLIC_KEY is not configured."
    );

  }

  return String(value).trim();

}