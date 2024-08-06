document.addEventListener('DOMContentLoaded', function() {
  var firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
  firebase.initializeApp(firebaseConfig);
  var database = firebase.database();
  var usersRef = database.ref('users');

  function getUserUUID() {
    var uuid = "";
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      if (cookie.startsWith("userUUID=")) {
        uuid = cookie.substring("userUUID=".length);
        break;
      }
    }
    return uuid;
  }

  function redirectToChatIfUUIDExists() {
    var uuid = getUserUUID();
    if (uuid) {
      window.location.href = 'chat.html';
    }
  }

  function login() {
    var loginName = document.getElementById('loginName').value.trim();
    var password = document.getElementById('password').value.trim();
    if (loginName && password) {
      var lowerCaseName = loginName.toLowerCase();
      authenticateUser(lowerCaseName, password, function(success, userUUID) {
        if (success) {
          document.cookie = "userUUID=" + userUUID + ";path=/";
          window.location.href = 'chat.html';
        } else {
          alert("Invalid credentials.");
        }
      });
    } else {
      alert("Please enter both name and password.");
    }
  }

  function signup() {
    var signupName = document.getElementById('signupName').value.trim();
    var signupPassword = document.getElementById('signupPassword').value.trim();
    if (signupName && signupPassword) {
      var lowerCaseName = signupName.toLowerCase();
      createUser(lowerCaseName, signupPassword, function(success, userUUID) {
        if (success) {
          document.cookie = "userUUID=" + userUUID + ";path=/";
          window.location.href = 'chat.html';
        } else {
          alert("Signup failed. Try a different name.");
        }
      });
    } else {
      alert("Please enter both name and password.");
    }
  }

  function showSignup() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
  }

  function showLogin() {
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
  }

  function authenticateUser(lowerCaseName, password, callback) {
    usersRef.orderByChild('nameLower').equalTo(lowerCaseName).once('value', function(snapshot) {
      if (snapshot.exists()) {
        snapshot.forEach(function(childSnapshot) {
          var userData = childSnapshot.val();
          if (userData.password === password) {
            callback(true, childSnapshot.key);
            return;
          }
        });
      }
      callback(false, null);
    });
  }

  function createUser(lowerCaseName, password, callback) {
    usersRef.orderByChild('nameLower').equalTo(lowerCaseName).once('value', function(snapshot) {
      if (snapshot.exists()) {
        callback(false, null);
      } else {
        var newUserRef = usersRef.push();
        newUserRef.set({
          name: signupName,
          nameLower: lowerCaseName,
          password: signupPassword,
          role: 'default'
        }, function(error) {
          if (error) {
            callback(false, null);
          } else {
            callback(true, newUserRef.key);
          }
        });
      }
    });
  }

  redirectToChatIfUUIDExists();

  window.login = login;
  window.signup = signup;
  window.showSignup = showSignup;
  window.showLogin = showLogin;
});
