import React, { useEffect, useState } from "react";
import "../../styles/Login.css";
import { Link, useNavigate } from "react-router-dom";

import { auth } from "../../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getError } from "../../logic/utils";

function Login() {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Initialize WebSocket connection
    const ws = new WebSocket("ws://172.25.213.113:8000/ws"); // Replace with your WebSocket server URL
    console.log("Connecting to WebSocket...");

    ws.onopen = () => {
      console.log("WebSocket connection established");
      setSocket(ws);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      setSocket(null); // Clear socket reference on close
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
        console.log("WebSocket connection closed during cleanup");
      }
    };
  }, []);

  const signIn = (event) => {
    event.preventDefault();
    setProcessing(true);

    signInWithEmailAndPassword(auth, email, password)
      .then((auth) => {
        // User login successful
        if (auth) {
          navigate("/");
        } else if (socket && socket.readyState === WebSocket.OPEN) {
          // If login fails and socket is open, send a message
          console.log("Socket is connected")
          const dataToSend = { type: "login_error", content: message };
          socket.send(JSON.stringify(dataToSend));
          setMessage(""); // Clear the message
        }
      })
      .catch((err) => {
        // Login failed
        console.error("Login error:", err);
        setError(getError(err.message));
      })
      .finally(() => {
        setProcessing(false); // Always reset processing state
      });
  };

  return (
    <div className="login">
      <div className={mounted ? "login__wrapper active" : "login__wrapper"}>
        <Link to="/">
          <img
            src={"/assets/icons/logo-dark.png"}
            alt="amazon"
            className="login__logo"
            width={136}
            height={52}
          />
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
              {processing ? "Signing In..." : "Sign In"}
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
