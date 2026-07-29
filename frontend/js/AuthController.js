/*
=========================================
SHiCI
AuthController.js

役割：
・認証制御
・ログイン画面制御
=========================================
*/

const GOOGLE_CLIENT_ID =
    "533411340650-99mtv8dcj03g2v1nrs54pu9eijmuvuhq.apps.googleusercontent.com";


function initializeAuthentication() {

    waitForGoogleIdentityService(0);

}


function waitForGoogleIdentityService(
    attempt
) {

    const maxAttempts = 50;

    if (
        window.google &&
        google.accounts &&
        google.accounts.id
    ) {

        renderGoogleSignInButton();
        return;

    }

    if (attempt >= maxAttempts) {

        showLoginError(
            "Googleログインの読み込みに失敗しました。ページを再読み込みしてください。"
        );

        return;

    }

    setTimeout(
        function() {

            waitForGoogleIdentityService(
                attempt + 1
            );

        },
        100
    );

}


function renderGoogleSignInButton() {

    google.accounts.id.initialize({

        client_id:
            GOOGLE_CLIENT_ID,

        callback:
            handleGoogleCredential

    });

    const buttonContainer =
        document.getElementById(
            "googleSignInButton"
        );

    if (!buttonContainer) {

        showLoginError(
            "ログイン画面の初期化に失敗しました。"
        );

        return;

    }

    buttonContainer.innerHTML = "";

    google.accounts.id.renderButton(
        buttonContainer,
        {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "signin_with",
            shape: "rectangular",
            logo_alignment: "left",
            locale: "ja"
        }
    );

}


async function handleGoogleCredential(
    response
) {

    if (
        !response ||
        !response.credential
    ) {

        showLoginError(
            "Googleログイン情報を取得できませんでした。"
        );

        return;

    }

    clearLoginError();
    showLoginLoadingView();

    try {

        const result =
            await callApi(
                "login",
                {
                    idToken:
                        response.credential
                }
            );

        if (
            result.status !==
            "success"
        ) {

            throw new Error(
                result.message ||
                "ログインに失敗しました。"
            );

        }

        if (!result.sessionId) {

            throw new Error(
                "セッションIDを取得できませんでした。"
            );

        }

        setSessionId(
            result.sessionId
        );

        setWelcomeGreeting(
            result.user
        );

        showApplicationView();

    }
    catch (error) {

        showLoginView();

        showLoginError(
            error.message ||
            "ログインに失敗しました。"
        );

    }

}


function showLoginLoadingView() {

    const loginView =
        document.getElementById(
            "loginView"
        );

    const loginLoadingView =
        document.getElementById(
            "loginLoadingView"
        );

    const appView =
        document.getElementById(
            "appView"
        );

    if (
        !loginView ||
        !loginLoadingView ||
        !appView
    ) {

        showLoginError(
            "待機画面の表示に失敗しました。"
        );

        return;

    }

    loginView.hidden = true;
    loginLoadingView.hidden = false;
    appView.hidden = true;

}


function showApplicationView() {

    const loginView =
        document.getElementById(
            "loginView"
        );

    const loginLoadingView =
        document.getElementById(
            "loginLoadingView"
        );

    const appView =
        document.getElementById(
            "appView"
        );

    if (
        !loginView ||
        !loginLoadingView ||
        !appView
    ) {

        showLoginView();

        showLoginError(
            "画面の切り替えに失敗しました。"
        );

        return;

    }

    loginView.hidden = true;
    loginLoadingView.hidden = true;
    appView.hidden = false;

}


function showLoginView() {

    const loginView =
        document.getElementById(
            "loginView"
        );

    const loginLoadingView =
        document.getElementById(
            "loginLoadingView"
        );

    const appView =
        document.getElementById(
            "appView"
        );

    if (
        !loginView ||
        !loginLoadingView ||
        !appView
    ) {
        return;
    }

    loginView.hidden = false;
    loginLoadingView.hidden = true;
    appView.hidden = true;

}


function showLoginError(
    message
) {

    const loginError =
        document.getElementById(
            "loginError"
        );

    if (!loginError) {
        return;
    }

    loginError.textContent =
        String(message || "");

}


function clearLoginError() {

    showLoginError("");

}



function setWelcomeGreeting(
    user
) {

    const welcomeGreeting =
        document.getElementById(
            "welcomeGreeting"
        );

    if (!welcomeGreeting) {
        return;
    }

    const nickName =
        String(
            user &&
            user.nickName
                ? user.nickName
                : ""
        ).trim();

    if (!nickName) {

        welcomeGreeting.textContent =
            "こんにちは。";

        return;

    }

    welcomeGreeting.textContent =
        "こんにちは、" +
        nickName +
        "さん。";

}