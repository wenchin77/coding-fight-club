const AppError = require('./appError.js');
const undefinedRouteError = new AppError(404, 'undefined route')
const serverError = new AppError(500, 'Server error.')
const usernameTakenError = new AppError(403, 'Username already taken. Please pick another username.');
const userEmailTakenError = new AppError(403, 'Looks like this email is signed up! Go ahead and sign in.');
const userEmailNotSignedUp = new AppError(403, 'This email has not been registered. Wanna sign up instead?');
const userWrongPassword = new AppError(403, 'Wrong password. Signin failed.');
const googleNameOrEmailNotFound = new AppError(400, 'Permissions Error: name and email are required when you sign in with a Google account.')
const githubNameOrEmailNotFound = new AppError(400, 'Permissions Error: name and email are required when you sign in with a Github account.')
const wrongMatch = new AppError(403, 'Wrong match.')
const matchEnded = new AppError(403, 'This match has ended. Start a new one now!')
const overTwoPeopleInAMatch = new AppError(403, 'Oops, there are already two people in this match!')
const alreadySubmitted = new AppError(403, "You already submitted your code or exited this match. Let's wait a bit for your opponent to submit!")
const noStrangerFound = new AppError(403, 'Ugh everyone seems to be busy playing in matches right now. Try again later or invite a friend instead?')

module.exports = {
  serverError,
  undefinedRouteError,
  usernameTakenError, 
  userEmailTakenError,
  userEmailNotSignedUp,
  userWrongPassword,
  googleNameOrEmailNotFound,
  githubNameOrEmailNotFound,
  wrongMatch,
  matchEnded,
  overTwoPeopleInAMatch,
  alreadySubmitted,
  noStrangerFound
}
