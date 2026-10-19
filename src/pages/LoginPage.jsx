/*
  LoginPage component

  This page allows an existing user to enter their
  email address and password to log in.

*/

import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import "./LoginPage.css"

function LoginPage({ setIsLoggedIn, setCurrentUser }) {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const location = useLocation()

  const requestedDestination = location.state?.from
  const destination = typeof requestedDestination === "string"
    ? requestedDestination
    : requestedDestination
      ? `${requestedDestination.pathname || "/"}${requestedDestination.search || ""}${requestedDestination.hash || ""}`
      : "/"
  const safeDestination = destination.startsWith("/") && !destination.startsWith("//")
    ? destination
    : "/"

  return (
    <main className="login-page">

      <div className="login-container">

        <p className="eyebrow">X-MEN SHOP</p>

        <h1>WELCOME BACK.</h1>

        <p className="login-text">
          Log in to access your account, favourites and cart.
        </p>

        <form
            className="login-form"
            onSubmit={(event) => {
              event.preventDefault()

              if (!email || !password) {
                setError("Please enter your email and password.")
                return
              }

              setError("")
              console.log("SENDING LOGIN REQUEST")

              fetch("http://localhost:3000/api/login", {
                credentials: "include",
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  email: email,
                  password: password
                })
              })
                .then(response => response.json())
                .then(data => {
                  if (data.message === "Login successful!") {
                    setCurrentUser(data.user)
                    setIsLoggedIn(true)
                    navigate(safeDestination, { replace: true })
                  } else {
                    setError(data.message)
                  }
                })
                .catch(() => {
                  setError("Unable to connect to the server.")
                })
            }}
        >

          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error && <p className="login-error">{error}</p>}

            <button type="submit">
              LOG IN
            </button>

        </form>

        <p className="signup-prompt">
          Don't have an account?{" "}
          <a href="/signup">Create one</a>
        </p>

      </div>

    </main>
  )
}

export default LoginPage
