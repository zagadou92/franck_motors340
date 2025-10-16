const pool = require("../database/");

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = `
      INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type)
      VALUES ($1, $2, $3, $4, 'Client') RETURNING *`;
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);
    return result.rows[0];
  } catch (error) {
    throw new Error(error.message);
  }
}

/* *****************************
*   Check for existing email
* ***************************** */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const result = await pool.query(sql, [account_email]);
    return result.rowCount > 0; // true si existe
  } catch (error) {
    throw new Error(error.message);
  }
}

/* *****************************
*   Check for existing email excluding current user
* ***************************** */
async function checkExistingEmailExcludingCurrent(account_email, account_id) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1 AND account_id != $2";
    const result = await pool.query(sql, [account_email, account_id]);
    return result.rowCount > 0; // true si email existe pour un autre compte
  } catch (error) {
    throw new Error(error.message);
  }
}

/* *****************************
*   Get account by email
* ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const sql = `
      SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password
      FROM account WHERE account_email = $1`;
    const result = await pool.query(sql, [account_email]);
    return result.rows[0];
  } catch (error) {
    throw new Error("No matching email found");
  }
}

/* *****************************
*   Get account by Id
* ***************************** */
async function getAccountById(account_id) {
  try {
    const sql = `
      SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password
      FROM account WHERE account_id = $1`;
    const result = await pool.query(sql, [account_id]);
    return result.rows[0];
  } catch (error) {
    throw new Error("No matching account Id found");
  }
}

/* *****************************
*   Update Account Info
* ***************************** */
async function updateAccountInfo(account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql = `
      UPDATE account
      SET account_firstname = $1, account_lastname = $2, account_email = $3
      WHERE account_id = $4
      RETURNING *`;
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id]);
    return result.rows[0];
  } catch (error) {
    throw new Error(error.message);
  }
}

/* *****************************
*   Update Password
* ***************************** */
async function updatePassword(account_id, account_password) {
  try {
    const sql = `
      UPDATE account
      SET account_password = $1
      WHERE account_id = $2
      RETURNING *`;
    const result = await pool.query(sql, [account_password, account_id]);
    return result.rows[0];
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  checkExistingEmailExcludingCurrent,
  getAccountByEmail,
  getAccountById,
  updateAccountInfo,
  updatePassword,
};
