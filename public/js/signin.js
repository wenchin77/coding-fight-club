const switchToSignup = () => {
  let signup = document.getElementById('signup');
  let signin = document.getElementById('signin');
  let button = document.getElementById('toggleButton');
  signin.style.left = '-400px';
  signup.style.left = '50px';
  button.style.left = '110px'
}

const switchToSignin = () => {
  let signup = document.getElementById('signup');
  let signin = document.getElementById('signin');
  let button = document.getElementById('toggleButton');
  signin.style.left = '50px';
  signup.style.left = '450px';
  button.style.left = '0px'
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

const showAlert = (text, callback) => {
  const modal = document.getElementById("myModal");
  const close = document.getElementsByClassName("close")[0];
  
  modal.style.display = "flex";
  document.getElementById('modalText').innerHTML = text;

  close.onclick = () => {
    modal.style.display = "none";
    callback();
  };

  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
      callback();
    }
  }
};

// signin via axios
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
    showAlert('Welcome back!', () => {
      // redirect to profile page
      window.location.pathname = 'profile';
    })
  }).catch((error) => {
    // server error
    if (!error.response) {
      showAlert('Sorry, some error occurred on our server. Please try again later.');
      return;
    };
    // client error
    showAlert(error.response.data.error);
  });
});

// signup via axios
document.forms['signup'].addEventListener('submit', (event) => {
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

    showAlert('Welcome to the Coding Fight Club!', () => {
      // redirect to profile page
      window.location.pathname = 'profile';
    })
  }).catch((error) => {
    // server error
    if (!error.response) {
      showAlert('Sorry, some error occurred on our server. Please try again later.');
      return;
    };
    // client error
    showAlert(error.response.data.error);
  });
});

function googleSigninInit() {
	gapi.load('auth2', () => {
		gapi.auth2.init({
			client_id: "1072670621009-nt50lbggpj5n2ma6d9jn01ocsneom6oh" //必填，記得開發時期要開啟 Chrome開發人員工具 查看有沒有403錯誤(Javascript來源被禁止)
		});
	}); //end gapi.load
}

function googleSignin() {
  let auth2 = gapi.auth2.getAuthInstance(); // 取得GoogleAuth物件
  console.log('auth2', auth2)
	auth2.signIn().then(async (GoogleUser) => {
		console.log("Google登入成功"); 
		console.log('ID: ' + GoogleUser.getId()); // Do not send to your backend! Use an ID token instead
		let id_token = GoogleUser.getAuthResponse().id_token;
		console.log("ID Token: " + id_token);
		const data = {
			provider: "google",
			access_token: id_token
		};
		console.log(data);

		// 把登入資料拿去打後端 signin api 再轉址顯示用戶資料
    let res = await axios.post("api/v1/user/signin", data);
    console.log(res);
    document.cookie = `token=${JSON.parse(res.response).data.token}`;
    window.location = "/profile";
    showAlert(error.response.data.error);
	})
}


const showTestUserHelp = () => {
  showAlert(`Check this box to sign in as a test user to try out Coding Fight Club without using your own email. Feel free to also use 'test1@codingfightclub.com' and '123456' to sign in as another user if you want to experience the matches!`)
}


