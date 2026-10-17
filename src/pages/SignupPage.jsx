/*
  SignupPage component

  This page allows a new user to create an account.

  The actual account creation will be added later
  when we connect the website to a backend/database.
*/

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./SignupPage.css"

function SignupPage({ setIsLoggedIn, setCurrentUser }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const navigate = useNavigate()

  return (
    <main className="signup-page">

      <div className="signup-container">

        <p className="eyebrow">X-MEN SHOP</p>

        <h1>JOIN THE MUTANTS.</h1>

        <p className="signup-text">
          Create an account to save your favourites and manage your cart.
        </p>

        <form
            className="signup-form"
            onSubmit={(event) => {
            event.preventDefault()

            if (!name || !email) {
              setError("Please enter your name and email.")
              return
            }

            if (!password || !confirmPassword) {
              setError("Please enter and confirm your password.")
              return
            }

            if (password !== confirmPassword) {
              setError("Passwords do not match.")
              return
            }

            setError("")

            fetch("http://localhost:3000/api/register", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                name: name,
                email: email,
                password: password
              })
            })
              .then(response => response.json())
              .then(data => {
                console.log("Signup response:", data)
                if (data.message === "Registration successful!") {
                  setCurrentUser({
                    name: data.name,
                    email: data.email
                  })

                  setIsLoggedIn(true)
                  navigate("/")
                } else {
                  setError(data.message)
                }
              })
              .catch(() => {
                setError("Unable to connect to the server.")
              })
          }}
        >

          <label htmlFor="name">
            Name
          </label>

          <input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

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
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <label htmlFor="confirm-password">
            Confirm Password
          </label>

          <input
            id="confirm-password"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />

          {error && <p className="signup-error">{error}</p>}


          <button type="submit">
            CREATE ACCOUNT
          </button>

        </form>

        <p className="login-prompt">
          Already have an account?{" "}
          <a href="/login">Log in</a>
        </p>

      </div>

    </main>
  )
}

export default SignupPage
