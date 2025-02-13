export const errorMessages = {
    Configuration: {
        title: "Configuration Error",
        message: "There is a problem with the server configuration. Please contact support if this error persists.",
    },
    AccessDenied: {
        title: "Access Denied",
        message: "You don't have permission to access this resource. Please sign in with an authorized account. (use diu email)",
    },
    Verification: {
        title: "Verification Error",
        message: "The verification token has expired or has already been used. Please request a new verification email.",
    },
    OAuthSignin: {
        title: "OAuth Sign In Error",
        message: "Could not authenticate with the selected provider. Please try again or use a different method.",
    },
    OAuthCallback: {
        title: "OAuth Callback Error",
        message: "Could not complete the authentication process. Please try again.",
    },
    OAuthCreateAccount: {
        title: "Account Creation Error",
        message: "Could not create a new account with the OAuth provider. Please try a different method.",
    },
    EmailCreateAccount: {
        title: "Account Creation Error",
        message: "Could not create a new account with the provided email. Please try a different method.",
    },
    Callback: {
        title: "Callback Error",
        message: "Authentication callback failed. Please try again.",
    },
    OAuthAccountNotLinked: {
        title: "Account Linking Error",
        message: "This email is already associated with another account. Please sign in with your original account.",
    },
    EmailSignin: {
        title: "Email Sign In Error",
        message: "The email sign-in link is invalid or has expired. Please request a new one.",
    },
    CredentialsSignin: {
        title: "Sign In Error",
        message: "Invalid credentials. Please check your username and password.",
    },
    Default: {
        title: "Authentication Error",
        message: "An unexpected error occurred. Please try again later.",
    }
} as const

