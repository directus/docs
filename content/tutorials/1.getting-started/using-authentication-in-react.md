---
slug: using-authentication-in-react
title: Using Authentication in React
authors:
  - name: Kumar Harsh
    title: Guest Author
description: Learn how to setup Directus authentication with React.
---
Authentication is a critical part of any modern web application, ensuring that users can securely access their data and perform authorized actions. In this tutorial, you will learn how to implement authentication in your React application using Directus' built-in authentication system.

## Before You Start

You will need:
- A Directus project with admin access.
- Fundamental understanding of React concepts.
- Optional but recommended: Familiarity with data modeling in Directus.

## Set Up Your Directus Project

Before building our authentication system, let's configure Directus with the necessary collections and permissions.

### Create a Collection

Create a new collection called 'posts' with the `user_created` optional field and the following custom fields:

* `title` (Type: String)
* `content` (Type: Markdown)
* `author` (Type: User)

### Configure Roles, Policies, and Permissions

Next, you need to create a new role called 'Authenticated User'. In this role, you will create a number of policies.

To start, create a 'Can Read and Create Posts' policy with the following permissions for the `posts` collection:
- Read: Allow
- Create: Custom
   - In Field Permissions, uncheck `author` so the user cannot set any value. 
   - In Field Presets, add the following value to set the value automatically:
```
{
    "author": "$CURRENT_USER"
}
```

Next, create a 'Can Edit and Delete Own Posts' policy with the following permissions for the `posts` collection:
- Update: Custom
   - In Item Permissions, set `user_created` to `$CURRENT_USER` to only allow update actions for items created by the currently-authenticated user.
- Delete: Custom (use the same Item Permissions as Update)

Finally, create a 'Can View and Edit Own Profile' policy with the following permissions for the `directus_users` collection:
- Read: Custom
   - In Item Permissions, set `id` to `$CURRENT_USER` to only allow users to view their own profile.
- Update: Custom (use the same Item Permissions as Read)

### Enable Public Registration

Public registration allows any user to create a user in your Directus project directly from the Data Studio or via API. You need to enable it in your Directus instance to allow users to register into your app.

To do that, navigate to **Project Settings** > **User Registration** and enable the setting. 

![Enabling user registration](/img/enabling-user-registration.png)

Set the default role to 'Authenticated User'. This will allow new users to automatically be given this role, which gives them all of the permissions you set up in the previous step. 

### Configure CORS

If you are self-hosting your Directus instance, you might need to configure CORS to enable your React app to interact with it. For the purpose of this tutorial, you can set your Directus instance to receive requests from any origin (through the `CORS_ORIGIN: "true"` environment variable) by setting the following environment variables:

```yaml
environment:
  CORS_ENABLED: "true"
  CORS_ORIGIN: "true"
```

In a production environment, you should only allow your app's trusted domains in the `CORS_ORIGIN` list. 

## Set Up Your React Project

### Initialize Your Project

Run `yarn create vite` to create a new project using vite. Enter a project name, such as `directus-react-auth` and choose **React** as the framework. Next, choose **JavaScript** as the variant. Here's what the output should look like when done:

```bash
➜ npm create vite@latest

> npx
> create-vite

✔ Project name: … directus-react-auth
✔ Select a framework: › React
✔ Select a variant: › JavaScript

Scaffolding project in /Users/kumarharsh/Work/Directus/directus-react-auth...

Done. Now run:

  cd directus-react-auth
  npm install
  npm run dev
```

Next, navigate to your newly created project directory by running the following command: 
```bash
cd directus-react-auth
```

Once you're in the directory, run the following commands to install the React Router DOM package which will help you set up routing in the app and the Directus SDK with which you can interact with the Directus CMS in your React app:

```bash
npm install react-router-dom @directus/sdk
```

You're now ready to start building your application!

### Configure the Directus SDK
Next, you will need to set up your Directus client with the authentication composable. To do that, create a file named **src/lib/directus.js** and save the following code snippet in it:
```js
import { createDirectus, rest } from '@directus/sdk';
const client = createDirectus('directus_project_url').with(rest());
```

You will come back and update this file as you progress with the tutorial.

### Set up the app pages

Next up, let's prepare the app's pages. To keep things streamlined, this app will have the following pages:
1. Home page (at `/`)
2. Profile page (at `/profile`)
3. Login page (at `/login`)
4. Registration page (at `/register`)

To create these pages, create the following files:
* `src/routes/Home.jsx`
* `src/routes/Login.jsx`
* `src/routes/Profile.jsx`
* `src/routes/Register.jsx`

The home route will render the text `Home Component` and based on whether the user has authenticated or not, it will show view profile, login, and logout links:

```js
// src/routes/Home.jsx

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { LogOut } from '../components/Logout';

const Home = ({ isAuthenticated }) => {
    return (
        <div>
            Home Component
            {(isAuthenticated ? <Link to="/profile">View Profile</Link> : <div/>)}
            {(isAuthenticated ? <LogOut /> : <div/>)}
            {(!isAuthenticated ? <Link to="/login">Login</Link> : <div/>)}
        </div>
    );
};
Home.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
};

export default Home;
```

To implement the logout button, create a file `src/components/Logout.jsx` and save the following in it:

```js
// src/components/Logout.jsx

import { useNavigate } from 'react-router-dom';

export const LogOut = () => {

    const onLogoutClick = async () => {
        // You will implement logout logic later here
    }

    return <>
        <button onClick={onLogoutClick}>Logout</button>
    </>

};
```

You will implement the logic for logging out a user later.

Next, the profile route will just render the text `Profile Component` and a link to go to the home page for now:

```js
// src/routes/Profile.jsx

import {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';

const Profile = () => {

    return (
        <div>
            Profile Component
            <Link to="/">Go to Home</Link>
        </div>
    );
};

export default Profile;
```

This route will be protected, meaning this will only be accessible to users who have authenticated themselves through the login page. To implement this functionality, create a file named `src/components/ProtectedRoute.jsx` and save the following in it:

```js
// src/components/ProtectedRoute.jsx

import { Navigate, Outlet } from 'react-router-dom'
import PropTypes from 'prop-types'

const ProtectedRoute = ({ isAuthenticated }) => {
    
    return (
        isAuthenticated ? 
        <Outlet /> : <Navigate to="/login" />
    )
}
ProtectedRoute.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
}

export default ProtectedRoute;
```

Based on the value of `isAuthenticated`, this component will allow or disallow the user to access its children components.

Now, you can update the `src/App.jsx` file to set up routing using React Router DOM:

```js
// src/App.jsx

import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './routes/Home';
import Login from './routes/Login';
import Register from './routes/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './routes/Profile';

const App = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home isAuthenticated={isAuthenticated}/>} />
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />} >
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated}/>} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
};

export default App;
```

Finally, you need to configure the `BrowserRouter` component in the `src/main.jsx` file to enable the React Router across your application:

```js
// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
 
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
   <React.StrictMode>
      <BrowserRouter>
         <App />
      </BrowserRouter>
   </React.StrictMode>
);
```

You still need to create the login and the registration components. You will do that in the next sections.

> Make sure you delete any CSS present in the `src/index.css` and `src/App.css` files to keep the output streamlined and similar to that shown in the screenshots in the sections below.

## Implement User Registration

To implement registration (and login as well), you will need a form that asks the user for their email and password and allows them to submit using a button. Let's create a common component for this in a file named `src/components/AuthForm.jsx`:

```js
// src/components/AuthForm.jsx

import { useState } from "react"
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";

const AuthForm = ({ title,
    submitButtonTitle,
    onSubmit,
    linkText,
    linkHref }) => {

    const [data, setData] = useState({
        email: "",
        password: "",
    });

    const handleSubmit = async (event) => {
        event.preventDefault();
        onSubmit(data);
    };

    const handleInputChange = (event) => {
        setData({
            ...data,
            [event.target.name]: event.target.value,
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>{title}</h1>
            <input
                type="email"
                placeholder="Email Address"
                name="email"
                value={data.email}
                onChange={handleInputChange}
                required
            />
            <input
                type="password"
                placeholder="Enter your Password"
                name="password"
                value={data.password}
                required
                onChange={handleInputChange}
            />
            <button>
                {submitButtonTitle}
            </button>
            <p>
                <Link
                    to={linkHref}>
                    {linkText}
                </Link>
            </p>
        </form>
    );
}
AuthForm.propTypes = {
    title: PropTypes.string.isRequired,
    submitButtonTitle: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
    linkText: PropTypes.string.isRequired,
    linkHref: PropTypes.string.isRequired,
};

export default AuthForm;
```

Now, create a file named `src/routes/Register.jsx` and save the following in it:

```js
// src/routes/Register.jsx

import React from 'react';
import AuthForm from '../components/AuthForm';
import client from "../lib/directus"
import { registerUser } from "@directus/sdk"

const Register = () => {
    const onRegister = async (data) => {
        const result = await client.request(registerUser(data.email, data.password))
        console.log(result)
    }
    return (
        <div>
            <AuthForm title="Register" submitButtonTitle="Register" linkHref='/login' linkText="Have an account? Login here" onSubmit={onRegister} />
        </div>
    );
};

export default Register;
```

This route displays the auth form component and when the user clicks on the submit button, it uses the `registerUser` function from the Directus SDK to register a new user.

## Implement User Login

Next, create a new file named `src/routes/Login.jsx` and save the following contents in it:

```js
// src/routes/Login.jsx

import AuthForm from '../components/AuthForm';
import client from '../lib/directus';
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';


const Login = ({ setIsAuthenticated }) => {
    const navigate = useNavigate();

    const onLogin = async (data) => {
        const result = await client.login(data.email, data.password)
        localStorage.setItem('directus_auth', JSON.stringify(result))
        navigate("/");
        setIsAuthenticated(true);
    }

    return (
        <div>
            <AuthForm title="Login" submitButtonTitle="Login" linkHref='/register' linkText="Don't have an account? Register here" onSubmit={onLogin} />
        </div>
    );
};
Login.propTypes = {
    setIsAuthenticated: PropTypes.func.isRequired,
};

export default Login;
```

This route shows the auth form component, and when the user clicks the submit button, it uses the `client.login` function from the Directus SDK to log in the user with their email and password. 

At this point, you can start the app by running the command `npm run dev`. But before you can test out the registration and login flows, you will need to choose one of the two authentication modes: session cookies and JSON.

### Session Cookie Authentication Mode
In the session cookie authentication mode, the Directus client retrieves the tokens (access token and refresh token) and stores them as cookies in your browser session. To implement this, you will need to add the authentication composable to your Directus client with the "cookie" option in your `src/lib/directus.js` file:

```js
// src/lib/directus.js

import { createDirectus, rest, authentication } from '@directus/sdk';

const BACKEND_URL = "http://localhost:8055/"

const client = createDirectus(BACKEND_URL)
// add this line
.with(authentication("cookie"))
.with(rest())

export default client;
```

Now, you can use the `onLogin` function in the `Login` component to log in a user and print their tokens to the console:

```js
// src/routes/Login.jsx

const onLogin = async (data) => {
   const result = await client.login(data.email, data.password)
   localStorage.setItem('directus_auth', JSON.stringify(result))
   navigate("/");
   setIsAuthenticated(true);
}
```

You can now try running the app and logging in with a user (you can use the `/register` route to register a user if you don't have one, or you can log in with the server admin user credentials as well)

![Results when using the cookie mode for login](/img/using-cookies-for-login.png)


### JSON Authentication Mode

The JSON authentication mode returns an access token, a refresh token, the validity duration of the token, and the timestamp at which the token will expire in the response of the login call. To select this, you will need to add the authentication composable to your Directus client with the "json" option:

```js
// src/lib/directus.js

import { createDirectus, rest, authentication } from '@directus/sdk';

const BACKEND_URL = "http://localhost:8055/"

const client = createDirectus(BACKEND_URL)
// change "cookie" to "json"
.with(authentication("json"))
.with(rest())

export default client;
```


Now, if you try running the app and logging in again, you will notice that the a refresh token is provided in the results as well:


![Results when using the JSON mode for login](/img/using-json-mode-for-login.png)


This is because for session cookies, the access and refresh tokens are combined into a single cookie. However, in the JSON mode, the two tokens are provided separately so that you can renew your access token as and when needed. You will see how to do that later in the tutorial.

The rest of this tutorial will use the "json" mode.


## Check if the User is Authenticated

Once you have set up registration and login functionalities, you can now set up the app to retrieve the authenticated user's details to use in the app pages.

To do that, add the following function to the `src/lib/directus.js` file:

```js
// src/lib/directus.js

import { withToken, readMe } from '@directus/sdk';

export const getCurrentUserId = async () => {
    const accessToken = (JSON.parse(localStorage.getItem('directus_auth')) || {}).access_token;

    let result

    if (accessToken)
        result = await client.request(withToken(accessToken, readMe()));

    return result?.id
}
```

This will allow you to use the currently authenticated user's access token to retrieve their details from the Directus instance.

Head over to `src/App.jsx` and add the following `useEffect` call to the `App` component to use this newly created function to check if a user is logged in or not:

```js
// src/App.jsx

// Add this import
import { getCurrentUserId } from './lib/directus';

// Add the following useEffect call
useEffect(() => {
    async function fetchData() {
      setIsAuthenticated(await getCurrentUserId() !== undefined);
    }
    fetchData();
}, [])
```

This call will use the `getCurrentUserId` function to check if a user is logged in or not. Based on that, it will set the value of the `isAuthenticated` state container. This state is used by the `Home` component to display profile/logout links and by the `ProtectedRoute` component to allow access to the `Profile` route for authenticated users.

Next, replace the contents of the `src/routes/Profile.jsx` file with the following:

```js
// src/routes/Profile.jsx

import {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import {getCurrentUserId} from '../lib/directus';

const Profile = () => {
    const [userId, setUserId] = useState("");

    useEffect(() => {
        async function fetchData() {
            const id = await getCurrentUserId();
            setUserId(id);
        }
        fetchData();
    }, [])

    return (
        <div>
            Profile Component
            <p>Your user id: {userId}</p>
            <Link to="/">Go to Home</Link>
        </div>
    );
};

export default Profile;
```

This will use the `getCurrentUserId` to get the currently logged in user's ID to display it on their profile page.

You can now try logging into the app and navigating to the `/profile` page. You should be able to see your ID:

![Viewing authenticated user details on profile page](/img/viewing-user-details.png)

If you try navigating to the home page, you should be able to see the links to the profile page and a logout button:

![Viewing the homepage of the app as an authenticated user](/img/viewing-homepage.png)


## Logging Out
To implement the log out functionality, you need to add another function to your `src/lib/directus.js` file:

```js
// src/lib/directus.js

import { logout } from '@directus/sdk';

export const logoutUser = async () => {
    const refreshToken = (JSON.parse(localStorage.getItem('directus_auth')) || {}).refresh_token;
    await client.request(logout(refreshToken, "json"));
    localStorage.removeItem('directus_auth');
}
```

This function uses the `logout` function from the Directus SDK to log out the currently authenticated user. You need to pass in the refresh token to the logout call and the authentication mode you're using (which is "json" in our case).

Now, you just need to update your `src/components/Logout.jsx` file to call this method from the `Logout` component:

```js
// src/components/Logout.jsx

import { useNavigate } from 'react-router-dom';
import {logoutUser} from '../lib/directus';

export const LogOut = () => {
    const navigate = useNavigate();

    const onLogoutClick = async () => {
        try {
            await logoutUser();
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
            navigate("/");
        }
    }

    return <>
        <button onClick={onLogoutClick}>Logout</button>
    </>

};
```

The `onLogoutClick` calls the `logoutUser` function you created in the `src/lib/directus.js` file and upon successful logout, it navigates the user to the login page. Upon a failure, it just takes the user to the homepage.

## Refreshing Tokens

The access tokens that you are using to authenticate your users are temporary and will expire after some time. To refresh these tokens, you will need to use the `refresh` function from the Directus SDK with the corresponding authentication mode. Here's what the different refresh calls would look like:

```js
// src/lib/directus.js

export const refreshAuthToken = async () => {
    // refresh using the authentication composable
    await client.refresh();

    // refresh http request using a cookie
    await client.request(refresh('cookie'));

    // refresh http request using json
    await client.request(refresh('json', refresh_token));
}
```

## Handling Errors

An important thing to keep in mind when working with the Directus API for authentication in your React app is that the Directus API returns the 403 status code if something doesn't exist, and not only when there's no access. So this means that you need to design your catch statements and error fallbacks to also check for missing object (potentially indicating incorrect user input) along with checking for authentication.

## Summary

In this tutorial, you learned how to implement authentication via Directus in a React application. You saw how to set up the login and registration pages, how to authenticate users through JSON and session cookies methods, how to access the data of the currently authenticated user, and finally how to log users out.

You can find the complete code for the React app built in this tutorial in [this GitHub repo](https://github.com/directus-labs/directus-auth-react).
