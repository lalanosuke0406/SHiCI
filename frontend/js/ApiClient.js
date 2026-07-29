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
    entityId
) {

    return await callApi(
        "selectCandidate",
        {
            entityId:
                entityId
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

