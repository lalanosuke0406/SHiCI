/*
=========================================
SHiCI
ApiClient.js

役割：
・GASとの通信
=========================================
*/

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbw34Qs-g5IqPLwluES704A03yyoW9P6liiv6z3JOkJiVFMP-Fifg6i6IH4EM98EM-Ubjg/exec";




async function selectCandidate(
    entityId,
    entityType
) {

    return await callApi(
        "selectCandidate",
        {

            entityId:
                entityId,

            entityType:
                entityType

        }
    );

}



/**
 * 金型温度の更新案を作成する
 *
 * この時点では、
 * マスターデータの更新は行わない。
 *
 * @param {string} productId
 * @param {string} expectedCurrentConditionId
 * @param {number|string} newMoldTemperature
 * @returns {Promise<Object>}
 */
async function createMoldTemperatureUpdateProposal(
    productId,
    expectedCurrentConditionId,
    newMoldTemperature
) {

    return await callApi(
        "createMoldTemperatureUpdateProposal",
        {

            productId:
                String(
                    productId || ""
                ).trim(),

            expectedCurrentConditionId:
                String(
                    expectedCurrentConditionId || ""
                ).trim(),

            newMoldTemperature:
                newMoldTemperature

        }
    );

}


/**
 * 保存済みの更新案を確定する
 *
 * @param {string} requestId
 * @returns {Promise<Object>}
 */
async function confirmUpdateRequest(
    requestId
) {

    return await callApi(
        "confirmUpdateRequest",
        {

            requestId:
                String(
                    requestId || ""
                ).trim()

        }
    );

}


/**
 * 保存済みの更新案をキャンセルする
 *
 * @param {string} requestId
 * @returns {Promise<Object>}
 */
async function cancelUpdateRequest(
    requestId
) {

    return await callApi(
        "cancelUpdateRequest",
        {

            requestId:
                String(
                    requestId || ""
                ).trim()

        }
    );

}




async function callApi(
    action,
    body = {}
) {

    const response =
        await fetch(
            GAS_API_URL,
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },

                body: JSON.stringify({

                    action,

                    sessionId:
                        getSessionId(),

                    ...body

                })

            }

        );

    if (!response.ok) {

        throw new Error(
            "通信に失敗しました。"
        );

    }

    return await response.json();

}



/**
 * SHiCIへ質問を送信する
 *
 * @param {string} text
 * @returns {Promise<Object>}
 */
async function askShici(text) {

    return await callApi(
        "ask",
        {
            text: text
        }
    );

}

