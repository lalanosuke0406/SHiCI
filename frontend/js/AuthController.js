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

    if (
        !window.google ||
        !google.accounts ||
        !google.accounts.id
    ) {

        showLoginError(
            "Googleログインの読み込みに失敗しました。"
        );

        return;

    }

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