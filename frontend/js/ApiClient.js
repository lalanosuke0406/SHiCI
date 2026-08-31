/*
=========================================
SHiCI
ApiClient.js

役割：
・GASとの通信
=========================================
*/

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbxdT6Zhk2evdrRJVHNNhpuVvp0CSTV28zNoau8DjymkWx4GDYn6bgs__Pg-tY-ptD_Igg/exec";

 


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
 * 正式なUnderstanding Resultから
 * Entity Change Proposalを生成する。
 *
 * この時点では、
 * マスターデータの更新は行わない。
 *
 * @param {Object} understandingResult
 * @param {string|null|undefined} requestId
 * @returns {Promise<Object>}
 */
async function createChangeProposal(
    understandingResult,
    requestId
) {

    if (
        !understandingResult ||
        typeof understandingResult !==
            "object" ||
        Array.isArray(
            understandingResult
        )
    ) {

        throw new Error(
            "変更案生成に必要なUnderstanding Resultがありません。"
        );

    }


    return await callApi(
        "createChangeProposal",
        {

            understandingResult:
                JSON.parse(
                    JSON.stringify(
                        understandingResult
                    )
                ),

            requestId:
                String(
                    requestId || ""
                ).trim() ||
                null

        }
    );

}


/**
 * 保存済みのEntity Change Proposalを
 * 確定して実行する。
 *
 * @param {string} proposalId
 * @param {string} changePlanId
 * @param {string|null|undefined} requestId
 * @returns {Promise<Object>}
 */
async function confirmExecutionProposal(
    proposalId,
    changePlanId,
    requestId
) {

    const normalizedProposalId =
        String(
            proposalId || ""
        ).trim();


    const normalizedChangePlanId =
        String(
            changePlanId || ""
        ).trim();


    if (
        !normalizedProposalId ||
        !normalizedChangePlanId
    ) {

        throw new Error(
            "変更案の確定に必要なIDがありません。"
        );

    }


    return await callApi(
        "confirmExecutionProposal",
        {

            proposalId:
                normalizedProposalId,

            changePlanId:
                normalizedChangePlanId,

            requestId:
                String(
                    requestId || ""
                ).trim() ||
                null

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




async function listExecutiveMessagePeers(
    executiveSessionToken
) {

    return await callApi(
        "executiveMessageListPeers",
        {
            executiveSessionToken
        }
    );

}

async function listExecutiveMessages(
    executiveSessionToken,
    peerUserId
) {

    return await callApi(
        "executiveMessageList",
        {
            executiveSessionToken,
            peerUserId
        }
    );

}

async function sendExecutiveMessage(
    executiveSessionToken,
    recipientUserId,
    body
) {

    return await callApi(
        "executiveMessageSend",
        {
            executiveSessionToken,
            recipientUserId,
            body
        }
    );

}

async function lockExecutiveMessage(
    executiveSessionToken
) {

    return await callApi(
        "executiveMessageLock",
        {
            executiveSessionToken
        }
    );

}



async function getExecutivePushConfiguration(
    executiveSessionToken
) {

    return await callApi(
        "executivePushConfig",
        {
            executiveSessionToken
        }
    );

}


async function registerExecutivePushSubscription(
    executiveSessionToken,
    subscription
) {

    return await callApi(
        "executivePushSubscribe",
        {
            executiveSessionToken,
            subscription
        }
    );

}


async function unregisterExecutivePushSubscription(
    executiveSessionToken,
    endpoint
) {

    return await callApi(
        "executivePushUnsubscribe",
        {
            executiveSessionToken,
            endpoint
        }
    );

}



function lockExecutiveMessageBestEffort(
    executiveSessionToken
) {

    const normalizedToken =
        String(
            executiveSessionToken || ""
        ).trim();

    if (!normalizedToken) {
        return;
    }

    try {

        fetch(
            GAS_API_URL,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },
                body: JSON.stringify({
                    action:
                        "executiveMessageLock",
                    sessionId:
                        getSessionId(),
                    executiveSessionToken:
                        normalizedToken
                }),
                keepalive: true
            }
        ).catch(
            function() {}
        );

    } catch (error) {
    }

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

