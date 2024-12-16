import React, { useEffect, useState } from "react";
import "../../styles/Login.css";
import { Link, useNavigate } from "react-router-dom";

import { auth } from "../../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getError } from "../../logic/utils";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [socket, setSocket] = useState(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/ws");

    socket.onopen = () => {
      console.log("WebSocket connection established");
    };

    socket.onmessage = (event) => {
      console.log("Message received from server:", event.data);
      // Handle the received message
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    setSocket(socket);

    return () => {
      socket.close();
    };
  }, []);

  const signIn = (event) => {
    setProcessing(true);
    event.preventDefault();

    // Firebase Sign In Functionality
    signInWithEmailAndPassword(auth, email, password)
      .then(async (auth) => {
        // User Login Successful
        if (auth) navigate("/");
      })
      .catch((err) => {
        // User Login Unsuccessful
        console.log("Error")
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "login_failed", email }));
        }
        setError(getError(err));
        setProcessing(false);
      });
  };

  return (
    <div className="login">
      <div className={mounted ? "login__wrapper active" : "login__wrapper"}>
        <Link to="/">
          <img src={'/assets/icons/logo-dark.png'} alt="amazon" className="login__logo" width={136} height={52} />
        </Link>

        <div className="login__container">
          <h2>Sign In</h2>

          <form>
            {!!error && <p className="login__error">{error}</p>}

            <label htmlFor="login__email">Email address</label>
            <input
              type="email"
              name="email"
              id="login__email"
              value={email}
              onChange={(e) => {
                setError(null);
                setEmail(e.target.value);
              }}
            />

            <label htmlFor="login__password">Password</label>
            <input
              type="password"
              name="password"
              id="login__password"
              value={password}
              onChange={(e) => {
                setError(null);
                setPassword(e.target.value);
              }}
            />

            <button
              type="submit"
              className="login__signInButton"
              onClick={signIn}
              disabled={processing}
            >
              Sign In
            </button>
          </form>

          <p>
            By continuing, you agree to Charles' Amazon Clone Conditions of Use
            and Privacy Notice.
          </p>
        </div>

        <p>
          New to Amazon Clone? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
