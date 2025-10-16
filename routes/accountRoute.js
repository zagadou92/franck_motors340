const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const accountValidate = require("../utilities/account-validation");
const utilities = require("../utilities/");

// ========================
// ROUTES GET
// ========================

// Page "Mon compte" (protégée)
router.get(
  "/",
  accountController.checkLoginJWT,
  utilities.handleErrors(accountController.buildAccountManagement)
);

// Page login
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
);

// Page register
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

// Page mise à jour compte (protégée)
router.get(
  "/update/:account_id",
  accountController.checkLoginJWT,
  utilities.handleErrors(accountController.buildAccountUpdate)
);

// Logout
router.get("/logout", accountController.logout);

// ========================
// ROUTES POST
// ========================

// Login
router.post(
  "/login",
  accountValidate.loginRules(),
  accountValidate.checkLogData,
  utilities.handleErrors(accountController.accountLogin)
);

// Register
router.post(
  "/register",
  accountValidate.registrationRules(),
  accountValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Mettre à jour infos utilisateur
router.post(
  "/update/info",
  accountController.checkLoginJWT, // protège la route
  accountValidate.updateInfoRules(),
  accountValidate.checkUpdateInfoData,
  utilities.handleErrors(accountController.updateAccountInfo)
);

// Mettre à jour mot de passe
router.post(
  "/update/password",
  accountController.checkLoginJWT, // protège la route
  accountValidate.updatePwdRules(),
  accountValidate.checkUpdatePassword,
  utilities.handleErrors(accountController.updatePassword)
);

module.exports = router;
