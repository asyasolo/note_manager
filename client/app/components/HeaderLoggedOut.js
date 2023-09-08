import React, { useState, useContext } from "react"
import Axios from "axios"

import DispatchContext from "../DispatchContext"

function HeaderLoggedOut() {
  const [username, setUsername] = useState()
  const [password, setPassword] = useState()
  const [isFormVisible, setIsFormVisible] = useState(false)
  const appDispatch = useContext(DispatchContext)
  const isMobile = window.innerWidth <= 768

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const response = await Axios.post("/login", { username, password })
      if (response.data) {
        appDispatch({ type: "login", data: response.data })
        appDispatch({ type: "flashMessage", value: "You're logged in." })
      } else {
        console.log("incorrect data")
        appDispatch({ type: "flashMessage", value: "Invalid password / username." })
      }
    } catch (e) {
      console.log(e.message)
    }
  }

  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible)
  }

  return (
    <>
      {isMobile ? (
        <>
          <button className="menu-button" onClick={toggleFormVisibility}>
            <img
              className="menu-button-img"
              src="../../hamburger.png"
              alt="menu"
              width="17"
              height="17"
            />
          </button>

          {isFormVisible && (
            <form onSubmit={handleSubmit} className="login-form login-form-hidden">
              <input
                className="small login-input-field"
                onChange={(e) => setUsername(e.target.value)}
                name="username"
                type="text"
                placeholder="login"
                autoComplete="off"
              />
              <input
                className="small login-input-field"
                onChange={(e) => setPassword(e.target.value)}
                name="password"
                type="password"
                placeholder="password"
                autoComplete="off"
              />
              <button className="btn login-btn">login</button>
            </form>
          )}
        </>
      ) : (
        <form onSubmit={handleSubmit} className="login-form ">
          <input
            className="small login-input-field"
            onChange={(e) => setUsername(e.target.value)}
            name="username"
            type="text"
            placeholder="login"
            autoComplete="off"
          />
          <input
            className="small login-input-field"
            onChange={(e) => setPassword(e.target.value)}
            name="password"
            type="password"
            placeholder="password"
            autoComplete="off"
          />
          <button className="btn login-btn">login</button>
        </form>
      )}
    </>
  )
}

export default HeaderLoggedOut
