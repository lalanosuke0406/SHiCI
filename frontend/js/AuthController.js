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


function handleGoogleCredential(
    response
) {

    console.log(
        "Google credential received.",
        response
    );

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