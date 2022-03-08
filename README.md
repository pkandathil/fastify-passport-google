# Introduction
This is a simple Google OAuth login example using Fastify and Passport.

# Setup
[Fastify-secure-session](https://www.npmjs.com/package/fastify-secure-session) is being used for session management. You will need a secret-key to run this code.

`npx fastify-secure-session > secret-key`

Place the secret key in the base folder.

You will need to create a **.env** file in the base folder with these two variables that you will get from your Google Console
```
AUTH0_CLIENT_ID=clientID from Google
AUTH0_CLIENT_SECRET=Secret from Google
```
Make sure you add the gmail address you plan to login with to the allowed users list

# Run

To run the code 
`npm run start`
and visit http://localhost:8080/
