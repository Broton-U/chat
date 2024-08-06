document.addEventListener('DOMContentLoaded', function() {
  try {
    var firebaseConfig = {
  apiKey: "AIzaSyDB2sNW2w-kvwOaqYJ-6Pojd79j1rRzgDw",
  authDomain: "chat-71251.firebaseapp.com",
  databaseURL: "https://chat-71251-default-rtdb.firebaseio.com",
  projectId: "chat-71251",
  storageBucket: "chat-71251.appspot.com",
  messagingSenderId: "290327153997"
});
    firebase.initializeApp(firebaseConfig);
    var database = firebase.database();
    var messagesRef = database.ref('messages');
    var usersRef = database.ref('users');
    var clearChatRef = database.ref('clearChatFlag');
    var redirectChatRef = database.ref('redirectChatFlag');

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

    function redirectIfNoUUID() {
      var uuid = getUserUUID();
      if (!uuid) {
        window.location.href = 'index.html';
      } else {
        document.getElementById('chatContainer').style.display = 'flex';
        displayMessages();
      }
    }

    function sendMessage() {
      var messageInput = document.getElementById('messageInput');
      var message = messageInput.value.trim();
      var userUUID = getUserUUID();
      if (message !== '' && userUUID) {
        messagesRef.push().set({
          message: message,
          uuid: userUUID,
          timestamp: Date.now()
        });
        messageInput.value = '';
      }
    }

    function displayMessages() {
      var messagesDiv = document.getElementById('messages');
      messagesDiv.innerHTML = ''; // Clear previous messages
      messagesRef.orderByChild('timestamp').on('child_added', function(snapshot) {
        var messageData = snapshot.val();
        usersRef.child(messageData.uuid).once('value', function(userSnapshot) {
          var userData = userSnapshot.val();
          var userName = userData ? userData.name : 'Unknown';
          var userRole = userData ? userData.role : 'default';
          var messageElement = document.createElement('div');
          messageElement.textContent = userName + ": " + messageData.message;
          messageElement.className = 'message ' + userRole + (messageData.uuid === getUserUUID() ? ' self' : '');
          messagesDiv.appendChild(messageElement);
          messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to bottom
        });
      });

      // Listen for clearChatFlag changes
      clearChatRef.on('value', function(snapshot) {
        if (snapshot.val() === true) {
          clearChatRef.set(false); // Reset the flag
          location.reload(); // Refresh the page for all users
        }
      });

      // Listen for redirectChatFlag changes
      redirectChatRef.on('value', function(snapshot) {
        if (snapshot.val() === true) {
          redirectChatRef.set(false); // Reset the flag
          window.location.href = 'rr.mp4';
        }
      });
    }

    function clearChat() {
      messagesRef.remove().then(function() {
        messagesRef.push().set({
          message: "Chat cleared",
          uuid: "3ba4223a-e921-474f-b8ec-1b34d081ba9f", // Admin UUID
          timestamp: Date.now()
        }).then(function() {
          clearChatRef.set(true); // Set the flag to true to notify all users
        });
      });
    }

    function setRole(role) {
      var userUUID = getUserUUID();
      if (userUUID) {
        usersRef.child(userUUID).update({ role: role }, function(error) {
          if (error) {
            alert("Error updating role.");
          } else {
            alert("Role updated to: " + role);
          }
        });
      } else {
        alert("User not found.");
      }
    }

    function lockChat() {
      // Implementation for locking the chat
    }

    function unlockChat() {
      // Implementation for unlocking the chat
    }

    function redirectChat() {
      redirectChatRef.set(true); // Set the flag to true to notify all users
    }

    function showBeastmode() {
      var popup = document.getElementById('beastmodePopup');
      popup.style.display = 'block';
    }

    function closeBeastMode() {
      var popup = document.getElementById('beastmodePopup');
      popup.style.display = 'none';
    }

    // Initialize chat
    redirectIfNoUUID();

    // Add event listener for Enter key to send messages
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
      }
    });

    // Expose functions to global scope
    window.sendMessage = sendMessage;
    window.clearChat = clearChat;
    window.setRole = setRole;
    window.lockChat = lockChat;
    window.unlockChat = unlockChat;
    window.redirectChat = redirectChat;
    window.showBeastmode = showBeastmode;
    window.closeBeastMode = closeBeastMode;
  } catch (error) {
    console.error("Error initializing chat:", error);
    document.body.innerHTML = `<p style="color: red;">An error occurred: ${error.message}</p>`;
  }
});
