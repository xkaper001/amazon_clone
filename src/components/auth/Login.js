import React, { useEffect, useState } from "react";
import "../../styles/Login.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { auth } from "../../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getError } from "../../logic/utils";
import { logSecurityEvent } from "../../data/securityLogger";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [ipAddress, setIpAddress] = useState("")

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const fetchIpAddress = async () => {
      try {
        const response = await axios.get("https://api.ipify.org?format=json");
        setIpAddress(response.data.ip); // Set the IP address
      } catch (error) {
        console.error("Error fetching IP address:", error);
      }
    };
    fetchIpAddress();
  }, []);

  const signIn = (event) => {
    setProcessing(true);
    event.preventDefault();

    // Firebase Sign In Functionality
    signInWithEmailAndPassword(auth, email, password)
      .then((auth) => {
        // User Login Successful
        if (auth) {
          navigate("/");
          setFailedAttempts(0);
          navigate("/");
          logSecurityEvent("user_login",email,`Login attemp from ${ipAddress}`,ipAddress)
        };
      })
      .catch((err) => {
        // User Login Unsuccessful
        setProcessing(false);
        setFailedAttempts((prev) => prev + 1);
        if (failedAttempts >= 2) {
          logSecurityEvent("auth_failure_multiple", email, "Multiple failed login attempts", ipAddress);
          failedAttempts =0

        } else {
          logSecurityEvent("auth_failure", email, "Failed Security Event", ipAddress);
        }
        setError(getError(err.message));
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
