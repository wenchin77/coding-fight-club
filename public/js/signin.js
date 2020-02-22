const switchToSignup = () => {
  let signup = document.getElementById('signup');
  let signin = document.getElementById('signin');
  let button = document.getElementById('toggleButton');
  signin.style.left = '-400px';
  signup.style.left = '50px';
  button.style.left = '110px';
}

const switchToSignin = () => {
  let signup = document.getElementById('signup');
  let signin = document.getElementById('signin');
  let button = document.getElementById('toggleButton');
  signin.style.left = '50px';
  signup.style.left = '450px';
  button.style.left = '0px';
}

const useTestUser = () => {
  let checkbox = document.getElementById('testCheckbox');
  let email = document.getElementById('signinEmail');
  let password = document.getElementById('signinPassword');
  if (checkbox.checked) {
    email.value = 'test@codingfightclub.com';
    password.value = '123456';
    return;
  }
  email.value = '';
  password.value = '';
}

// native signin
document.forms['signin'].addEventListener('submit', (event) => {
  event.preventDefault();
  axios(event.target.action, {
    method: 'POST',
    data: new URLSearchParams(new FormData(event.target)) // event.target is the form
  }).then((res) => {
    // add userinfo to localStorage
    localStorage.setItem('id', res.data.id);
    localStorage.setItem('username', res.data.username)
    localStorage.setItem('email', res.data.email);
    localStorage.setItem('provider', res.data.provider);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('points', res.data.points);
    localStorage.setItem('level', res.data.level);
    localStorage.setItem('access_expired', res.data.access_expired);
    
    showAlert('Welcome back!', () => {
      // if user was invited in a match before signing in, redirect to match page
      if (localStorage.getItem('invited_url')) {
        window.location.pathname = localStorage.getItem('invited_url');
        return;
      }
      // redirect to dashboard page
      window.location.pathname = 'dashboard';
    })
  }).catch((error) => {
    // server error
    if (!error.response) {
      showAlert('Server error. Please try again later.');
      return;
    };
    // client error
    showAlert(error.response.data.error);
  });
});

// native signup
document.forms['signup'].addEventListener('submit', (event) => {
  event.preventDefault();
  
  // validate username, email and password
  let username = document.getElementById('signupUsername').value;
  if (!validateRegEx(username, /^[0-9a-zA-Z_]{4,10}$/)) {
    showAlert('Please enter 4-10 letters, numbers or the underscore as your username.');
    return;
  };
  let email = document.getElementById('signupEmail').value;
  if (!validateRegEx(email, /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/)) {
    showAlert('Wrong email format. Please double check.');
    return;
  };
  let password = document.getElementById('signupPassword').value;
  if (!validateRegEx(password, /^.{4,16}$/)) {
    showAlert('Please enter 4-16 characters as your password.');
    return;
  };

  axios(event.target.action, {
    method: 'POST',
    data: new URLSearchParams(new FormData(event.target)) // event.target is the form
  }).then((res) => {
    // add userinfo to localStorage
    localStorage.setItem('id', res.data.id);
    localStorage.setItem('username', res.data.username)
    localStorage.setItem('email', res.data.email);
    localStorage.setItem('provider', res.data.provider);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('points', res.data.points);
    localStorage.setItem('level', res.data.level);
    localStorage.setItem('access_expired', res.data.access_expired);

    showAlert('Welcome to the Coding Fight Club!', () => {
      // if user was invited in a match before signing in, redirect to match page
      if (localStorage.getItem('invited_url')) {
        window.location.pathname = localStorage.getItem('invited_url');
        return;
      }
      // redirect to dashboard page
      window.location.pathname = 'dashboard';
    })
  }).catch((error) => {
    // server error
    if (!error.response) {
      showAlert('Server error. Please try again later.');
      return;
    };
    // client error
    showAlert(error.response.data.error);
  });
});

async function googleSignin() {
  let auth2 = gapi.auth2.getAuthInstance();
  console.log('auth2', auth2)
	auth2.signIn().then(async (GoogleUser) => {
		console.log("Google sign in"); 
		console.log('ID: ' + GoogleUser.getId()); // Do not send to your backend! Use an ID token instead
    let id_token = GoogleUser.getAuthResponse().id_token;
    console.log('GoogleUser.getAuthResponse()', GoogleUser.getAuthResponse())
		console.log("ID Token: " + id_token);
		const data = {
			provider: "google",
			access_token: id_token
		};
    console.log(data);
    
    try {
      let res = await axios.post("api/v1/user/signin", data);
      console.log(res);
      // add userinfo to localStorage
      localStorage.setItem('id', res.data.id);
      localStorage.setItem('username', res.data.username)
      localStorage.setItem('email', res.data.email);
      localStorage.setItem('picture', res.data.picture);
      localStorage.setItem('provider', res.data.provider);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('points', res.data.points);
      localStorage.setItem('level', res.data.level);
      localStorage.setItem('access_expired', res.data.access_expired);
  
      showAlert('Welcome to the Coding Fight Club!', () => {
        // if user was invited in a match before signing in, redirect to match page
        if (localStorage.getItem('invited_url')) {
          window.location.pathname = localStorage.getItem('invited_url');
          return;
        }
        // redirect to dashboard page
        window.location.pathname = 'dashboard';
      })
    } catch (error) {
      // server error
      if (!error.response) {
        showAlert('Server error. Please try again later.');
        return;
      };
      // client error
      showAlert(error.response.data.error);    
    }
	})
}

if (window.location.search.substring(1).includes('access_token')) {
  console.log(`window.location.search.substring(1).includes('access_token')`);
  const query = window.location.search.substring(1)
  const token = query.split('access_token=')[1]
  try {
    let profile = await getGithubProfile(token);
    // Once we get the response, send ajax to signin
    console.log(profile);
    // const data = {
		// 	provider: "github",
		// 	profile: token
    // };
    // let res = await axios.post("api/v1/user/signin", data);
    // console.log(res);
    // // add userinfo to localStorage
    // localStorage.setItem('id', res.data.id);
    // localStorage.setItem('username', res.data.username)
    // localStorage.setItem('email', res.data.email);
    // localStorage.setItem('picture', res.data.picture);
    // localStorage.setItem('provider', res.data.provider);
    // localStorage.setItem('token', res.data.token);
    // localStorage.setItem('points', res.data.points);
    // localStorage.setItem('level', res.data.level);
    // localStorage.setItem('access_expired', res.data.access_expired);

    // showAlert('Welcome to the Coding Fight Club!', () => {
    //   // if user was invited in a match before signing in, redirect to match page
    //   if (localStorage.getItem('invited_url')) {
    //     window.location.pathname = localStorage.getItem('invited_url');
    //     return;
    //   }
    //   // redirect to dashboard page
    //   window.location.pathname = 'dashboard';
    // })
    
  } catch (error) {
    // server error
    if (!error.response) {
      showAlert('Server error. Please try again later.');
    } else {
    // client error
    showAlert(error.response.data.error); 
    }
  }
}

async function getGithubProfile(token) {
  try{
    // Call the user info API using the fetch browser library
    let profile = await axios.get('https://api.github.com/user', {
      headers: {
        // Include the token in the Authorization header
        Authorization: 'token ' + token
      }
    });
    return(profile);
  } catch (error) {
    return(error);
  }
}

function validateRegEx(input, pattern) {
  return pattern.test(input);
};

function showTestUserHelp() {
  showAlert(`Check this box to sign in as a test user to try out Coding Fight Club without using your own email. Feel free to also use 'test1@codingfightclub.com' and '123456' to sign in as another user if you want to experience the matches!`)
}


