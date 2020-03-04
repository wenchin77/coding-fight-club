const AppError = require('./appError.js');

const undefinedRouteError = new AppError(404, 'undefined route')

const serverError = new AppError(500, 'Server error.')

const usernameTakenError = new AppError(403, 'Username already taken. Please pick another username.');

const userEmailTakenError = new AppError(403, 'Looks like this email is signed up! Go ahead and sign in.');

const userEmailNotSignedUp = new AppError(403, 'This email has not been registered. Wanna sign up instead?');

const userWrongPassword = new AppError(403, 'Wrong password. Signin failed.');

const googleNameOrEmailNotFound = new AppError(400, 'Permissions Error: name and email are required when you sign in with a Google account.')

const githubNameOrEmailNotFound = new AppError(400, 'Permissions Error: name and email are required when you sign in with a Github account.')

module.exports = {
  serverError,
  undefinedRouteError,
  usernameTakenError, 
  userEmailTakenError,
  userEmailNotSignedUp,
  userWrongPassword,
  googleNameOrEmailNotFound,
  githubNameOrEmailNotFound
}
