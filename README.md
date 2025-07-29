# How to Run the Code

To run this project, you need to have npm (Node Package Manager) installed on your machine. Follow the steps below to get started:

## Prerequisites

**Install Node.js and npm**:
   - Download and install Node.js from the [official website](https://nodejs.org/).
   - npm is included with Node.js, so it will be installed automatically.

## Also, my Node.js version is 22.13.1. It's better to use the same Node.js version since it's the latest one.

Install nvm (if not already installed):
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash
```

Load nvm (you may need to restart your terminal or run the following command):
```
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \ . "$NVM_DIR/nvm.sh"
```

Install Node.js version 22.13.1:
```
nvm install 22.13.1
```

Set Node.js version 22.13.1 as the default version:
```
nvm alias default 22.13.1
```

## Since we are in the development stage, I am using an app called Expo Go for testing. It is available on both iPhone and Android.

- **iPhone**: Use the camera to scan the QR code and open it with Expo Go to test the app.
- **Android**: There is a direct option in Expo Go to scan the QR code.

## Now download the zip file and extract it
Go to the code folder:
```
cd code
```

## Now the important task: Open two terminals, one in the code folder and the other in code/backend.
- The **code folder terminal** is for the frontend.
- The **code/backend terminal** is for the backend.

Installing necessary node modules for the frontend:
```
~/code$ npm install
```

Installing necessary node modules for the backend:
```
~/code/backend$ npm install
```

## Debugging
### You have to change a few things in the code.
### I made my code in Ubuntu (Linux), so slight changes may be needed if you're running on Windows.

### In the many files there is this piece of code:
```javascript
const API_URL = Platform.select({
  web: 'http://localhost:5000/api',
  default: 'http://192.168.24.240:5000/api'  
});
```
This actually represents:
```javascript
const API_URL = Platform.select({
  web: 'http://localhost:YOUR_PORT/api',
  default: 'http://YOUR_IP:YOUR_PORT/api'
});
```

### Then there is the `backend/.env` file.
- The `MONGODB_URI` in `.env` is an online database, so you can leave it as is.
- The `JWT_TOKEN` should also remain unchanged.
- Change the port as you wish in the `.env` file and also on line 51 in `/backend/server.js`.

## Running the Code
### Now the important task: Open two terminals, one in the code folder and the other in code/backend.
- **code/backend terminal** is for the backend.
- **code folder terminal** is for the frontend.

Running the backend:
```
~/code/backend$ npm start
```

Running the frontend:
```
~/code$ npx expo start
```

## In the frontend terminal, if there are no errors, a QR code will appear. Just scan it, and the app will open.

## If there are issues installing or running the code, or if you find any bugs, please inform us.

