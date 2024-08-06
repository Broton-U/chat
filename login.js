firebase.initializeApp({
  apiKey: "AIzaSyDB2sNW2w-kvwOaqYJ-6Pojd79j1rRzgDw",
  authDomain: "chat-71251.firebaseapp.com",
  databaseURL: "https://chat-71251-default-rtdb.firebaseio.com",
  projectId: "chat-71251",
  storageBucket: "chat-71251.appspot.com",
  messagingSenderId: "290327153997"
});

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

function showSignup() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'flex';
}

function showLogin() {
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'flex';
}

function promptForUserName(isSignup) {
  var userName = document.getElementById(isSignup ? 'signupName' : 'loginName').value.trim();
  if (userName) {
    var lowerCaseName = userName.toLowerCase();
    checkUserName(lowerCaseName, isSignup, function(exists) {
      if (exists && isSignup) {
        alert("Name taken, please choose another.");
      } else if (exists && !isSignup) {
        var password = document.getElementById('password').value;
        authenticateUser(lowerCaseName, password, function(success) {
          if (success) {
            document.cookie = "userUUID=" + getUserUUID() + ";path=/";
            window.location.href = 'chat.html';
          } else {
            alert("Wrong password, try again.");
          }
        });
      } else {
        var password = document.getElementById('signupPassword').value;
        var userUUID = generateUUID();
        document.cookie = "userUUID=" + userUUID + ";path=/";
        usersRef.child(userUUID).set({ name: userName, nameLower: lowerCaseName, role: "default", password: password }, function(error) {
          if (error) {
            alert("Error creating user.");
          } else {
            window.location.href = 'chat.html';
          }
        });
      }
    });
  }
}

function checkUserName(userName, isSignup, callback) {
  var query = usersRef.orderByChild('nameLower').equalTo(userName);
  query.once('value', function(snapshot) {
    callback(snapshot.exists());
  });
}

function authenticateUser(userName, password, callback) {
  var query = usersRef.orderByChild('nameLower').equalTo(userName);
  query.once('value', function(snapshot) {
    if (snapshot.exists()) {
      snapshot.forEach(function(childSnapshot) {
        var userData = childSnapshot.val();
        if (userData.password === password) {
          document.cookie = "userUUID=" + childSnapshot.key + ";path=/";
          callback(true);
        } else {
          callback(false);
        }
      });
    } else {
      callback(false);
    }
  });
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function login() {
  promptForUserName(false);
}

function signup() {
  promptForUserName(true);
}
