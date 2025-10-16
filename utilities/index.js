const invModel = require("../models/inventory-model");
const Util = {};
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the single item view HTML
* ************************************ */
Util.buildItemGrid = async function(data){
  let grid
  if (data) {
      grid = '<div id="detail-display">';
      grid +=  '<a href="../../inv/detail/'+ data.inv_id 
      + '" title="View ' + data.inv_make + ' '+ data.inv_model 
      + 'details"><img src="' + data.inv_image 
      +'" alt="Image of '+ data.inv_make + ' ' + data.inv_model 
        + ' on CSE Motors"></a>'
      grid += '<section class="contentCar">';
      grid += '<div class="saleInfo">'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + data.inv_id +'" title="View ' 
      + data.inv_make + ' ' + data.inv_model + ' details">' 
      + data.inv_make + ' ' + data.inv_model + '</a>'
      grid += '</h2>'
      grid +=
        '<p id="carPrice">$' +
        new Intl.NumberFormat("en-US").format(data.inv_price) +
        "</p>";
      grid += '<p id="carYear">' + data.inv_year + "</p>";
      grid += "</div>";
      grid += '<div class="carInfo">';
      grid += "<p>Model: " + data.inv_model + "</p>";
      grid += "<p>Made by: " + data.inv_make + "</p>";
      grid +=
        "<p>Price: $" +
        new Intl.NumberFormat("en-US").format(data.inv_price) +
        "</p>";
      grid += "<p>Year: " + data.inv_year + "</p>";
      grid +=
        "<p>Mileage: " +
        new Intl.NumberFormat("en-US").format(data.inv_miles) +
        "</p>";
      grid += "<p>Color: " + data.inv_color + "</p>";
      grid += "<p>Description: " + data.inv_description + "</p>";
    grid += "</div>";
    grid += '</section>';
    grid += "</div>";
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build Classification List for SELECT  
* ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList =
    '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected ";
    }
    classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.logged = 1;
    next()
   })
 } else {
  next()
 }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.logged) {
    next();
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}
 
/* ****************************************
 *  Check Account Type no Client
 * ************************************ */
Util.checkAccountType = (req, res, next) => {
  const accountType = res.locals.accountData.account_type;
  if (accountType !== "Client") {
    next();
  } else {
    req.flash("notice", "Please log in with Authorized account.");
    return res.redirect("/account/login");
  }
};

/* ****************************************
 *  Check Account Type is Admin
 * ************************************ */
Util.checkAdminAccountType = (req, res, next) => {
  const accountType = res.locals.accountData.account_type;
  if (accountType !== "Admin") {
    req.flash("notice", "Please log in with Authorized account.");
    return res.redirect("/account/login");
  } else {
    next();
  }
};

module.exports = Util