const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
require("dotenv").config();

/* =========================================
   Middleware pour vérifier JWT et session
========================================= */
async function checkLoginJWT(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    return res.redirect("/account/login");
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.accountData = decoded;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.redirect("/account/login");
  }
}

/* ****************************************
 *  Deliver Account Management View
 * *************************************** */
async function buildAccountManagement(req, res) {
  const nav = await utilities.getNav();
  res.render("./account/index", {
    title: "Gestion de compte",
    nav,
    errors: null,
    accountData: req.accountData,
  });
}

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res) {
  const nav = await utilities.getNav();
  res.render("./account/login", {
    title: "Connexion",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Deliver register view
 * *************************************** */
async function buildRegister(req, res) {
  const nav = await utilities.getNav();
  res.render("./account/register", {
    title: "Inscription",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Deliver Update Account view
 * *************************************** */
async function buildAccountUpdate(req, res) {
  const account_id = parseInt(req.params.account_id);
  const nav = await utilities.getNav();
  try {
    const account = await accountModel.getAccountById(account_id);
    if (!account) {
      req.flash("notice", "Compte introuvable.");
      return res.redirect("/account/");
    }

    res.render("./account/update", {
      title: "Mettre à jour le compte",
      nav,
      errors: null,
      account_id: account.account_id,
      account_firstname: account.account_firstname,
      account_lastname: account.account_lastname,
      account_email: account.account_email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  const nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const regResult = await accountModel.registerAccount(account_firstname, account_lastname, account_email, hashedPassword);

    if (regResult) {
      req.flash("notice", `Vous êtes inscrit, ${account_firstname}. Veuillez vous connecter.`);
      return res.status(201).render("./account/login", { title: "Connexion", nav, errors: null });
    } else {
      req.flash("notice", "L'inscription a échoué.");
      return res.status(500).render("./account/register", { title: "Inscription", nav, errors: null });
    }
  } catch (err) {
    console.error(err);
    req.flash("notice", "Erreur lors de l'inscription.");
    return res.status(500).render("./account/register", { title: "Inscription", nav, errors: null });
  }
}

/* ****************************************
 *  Process Log in
 * *************************************** */
async function accountLogin(req, res) {
  const nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  try {
    const accountData = await accountModel.getAccountByEmail(account_email);
    if (!accountData) {
      req.flash("notice", "Email ou mot de passe incorrect.");
      return res.status(400).render("./account/login", { title: "Connexion", nav, errors: null, account_email });
    }

    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password);
    if (!passwordMatch) {
      req.flash("notice", "Email ou mot de passe incorrect.");
      return res.status(400).render("./account/login", { title: "Connexion", nav, errors: null, account_email });
    }

    delete accountData.account_password;
    const token = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 });

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600 * 1000,
    });

    return res.redirect("/account/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
}

/* ****************************************
 *  Process Update Account Info
 * *************************************** */
async function updateAccountInfo(req, res) {
  const nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_id } = req.body;

  try {
    // Vérifie si l’email existe déjà pour un autre compte
    const emailExists = await accountModel.getAccountByEmail(account_email);
    if (emailExists && emailExists.account_id !== parseInt(account_id)) {
      req.flash("notice", "Cet email est déjà utilisé par un autre compte.");
      return res.redirect(`/account/update/${account_id}`);
    }

    const updateResult = await accountModel.updateAccountInfo(account_id, account_firstname, account_lastname, account_email);

    if (updateResult) {
      req.flash("notice", "Vos informations ont été mises à jour.");
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Échec de la mise à jour.");
      return res.status(500).render("./account/update", {
        title: "Mettre à jour le compte",
        nav,
        errors: null,
        account_firstname,
        account_lastname,
        account_email,
        account_id
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
}

/* ****************************************
 *  Process Update Password
 * *************************************** */
async function updatePassword(req, res) {
  const nav = await utilities.getNav();
  const { account_password, account_id } = req.body;

  try {
    // Validation côté serveur : mot de passe minimum 8 caractères
    if (!account_password || account_password.length < 8) {
      req.flash("notice", "Le mot de passe doit contenir au moins 8 caractères.");
      return res.redirect(`/account/update/${account_id}`);
    }

    const hashedPassword = await bcrypt.hash(account_password, 10);
    const updatePwdResult = await accountModel.updatePassword(account_id, hashedPassword);

    if (updatePwdResult) {
      req.flash("notice", "Mot de passe mis à jour avec succès.");
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Échec de la mise à jour du mot de passe.");
      return res.status(500).render("./account/update", { title: "Mettre à jour le compte", nav, errors: null });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
}

/* ****************************************
 *  Process Logout
 * *************************************** */
function logout(req, res) {
  res.clearCookie("jwt");
  res.redirect("/account/login");
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  logout,
  buildAccountUpdate,
  updateAccountInfo,
  updatePassword,
  checkLoginJWT,
};
