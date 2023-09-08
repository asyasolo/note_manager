import React, { useState, useContext } from "react"
import { Link } from "react-router-dom"

import HeaderLoggedOut from "./HeaderLoggedOut"
import HeaderLoggedIn from "./HeaderLoggedIn"
import StateContext from "../StateContext"

function Header(props) {
  const appState = useContext(StateContext)

  return (
    <header className="header">
      <Link to="/" className="logo">
        NoteBound
      </Link>
      {appState.loggedIn ? <HeaderLoggedIn /> : <HeaderLoggedOut />}
    </header>
  )
}

export default Header
