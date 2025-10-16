const { body, validationResult } = require("express-validator");
const accountModel = require("../models/account-model");

/* *******************************
 * Validation pour le login
 * ******************************* */
function loginRules() {
  return [
    body("account_email")
      .trim()
      .notEmpty()
      .withMessage("L'adresse e-mail est requise.")
      .isEmail()
      .withMessage("Adresse e-mail invalide."),

    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Le mot de passe est requis."),
  ];
}

function checkLogData(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/account/login");
  }
  next();
}

/* *******************************
 * Validation pour l'inscription
 * ******************************* */
function registrationRules() {
  return [
    body("account_firstname")
      .trim()
      .notEmpty()
      .withMessage("Le prénom est requis.")
      .isLength({ max: 50 })
      .withMessage("Le prénom ne peut pas dépasser 50 caractères."),

    body("account_lastname")
      .trim()
      .notEmpty()
      .withMessage("Le nom est requis.")
      .isLength({ max: 50 })
      .withMessage("Le nom ne peut pas dépasser 50 caractères."),

    body("account_email")
      .trim()
      .notEmpty()
      .withMessage("L'adresse e-mail est requise.")
      .isEmail()
      .withMessage("Adresse e-mail invalide.")
      .custom(async (value) => {
        const exists = await accountModel.checkExistingEmail(value);
        if (exists) {
          throw new Error("Cette adresse e-mail est déjà utilisée.");
        }
        return true;
      }),

    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Le mot de passe est requis.")
      .isLength({ min: 8 })
      .withMessage("Le mot de passe doit comporter au moins 8 caractères.")
      .matches(/[A-Z]/)
      .withMessage("Le mot de passe doit contenir au moins une lettre majuscule.")
      .matches(/[a-z]/)
      .withMessage("Le mot de passe doit contenir au moins une lettre minuscule.")
      .matches(/[0-9]/)
      .withMessage("Le mot de passe doit contenir au moins un chiffre.")
      .matches(/[\W_]/)
      .withMessage("Le mot de passe doit contenir au moins un caractère spécial."),
  ];
}

function checkRegData(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/account/register");
  }
  next();
}

/* *******************************
 * Validation pour la mise à jour des infos
 * ******************************* */
function updateInfoRules() {
  return [
    body("account_firstname")
      .trim()
      .notEmpty()
      .withMessage("Le prénom est requis.")
      .isLength({ max: 50 })
      .withMessage("Le prénom ne peut pas dépasser 50 caractères."),

    body("account_lastname")
      .trim()
      .notEmpty()
      .withMessage("Le nom est requis.")
      .isLength({ max: 50 })
      .withMessage("Le nom ne peut pas dépasser 50 caractères."),

    body("account_email")
      .trim()
      .notEmpty()
      .withMessage("L'adresse e-mail est requise.")
      .isEmail()
      .withMessage("Adresse e-mail invalide.")
      .custom(async (value, { req }) => {
        const account_id = req.body.account_id;
        const exists = await accountModel.checkExistingEmailExcludingCurrent(value, account_id);
        if (exists) {
          throw new Error("Cette adresse e-mail est déjà utilisée par un autre compte.");
        }
        return true;
      }),
  ];
}

function checkUpdateInfoData(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect(`/account/update/${req.body.account_id}`);
  }
  next();
}

/* *******************************
 * Validation pour le mot de passe
 * ******************************* */
function updatePwdRules() {
  return [
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Le mot de passe est requis.")
      .isLength({ min: 8 })
      .withMessage("Le mot de passe doit comporter au moins 8 caractères.")
      .matches(/[A-Z]/)
      .withMessage("Le mot de passe doit contenir au moins une lettre majuscule.")
      .matches(/[a-z]/)
      .withMessage("Le mot de passe doit contenir au moins une lettre minuscule.")
      .matches(/[0-9]/)
      .withMessage("Le mot de passe doit contenir au moins un chiffre.")
      .matches(/[\W_]/)
      .withMessage("Le mot de passe doit contenir au moins un caractère spécial."),
  ];
}

function checkUpdatePassword(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect(`/account/update/${req.body.account_id}`);
  }
  next();
}

module.exports = {
  loginRules,
  checkLogData,
  registrationRules,
  checkRegData,
  updateInfoRules,
  checkUpdateInfoData,
  updatePwdRules,
  checkUpdatePassword,
};
