import React, { useContext } from "react"
import { Link } from "react-router-dom"

import DispatchContext from "../DispatchContext"

function HeaderLoggedIn(props) {
  const appDispatch = useContext(DispatchContext)

  function handleLogout() {
    appDispatch({ type: "logout" })
    appDispatch({ type: "flashMessage", value: "You have logged out." })
  }

  return (
    <div className="header-button-cluster">
      <Link to="/create-note" className="btn create-btn">
        create
      </Link>
      <Link to="/" className="btn logout-btn" onClick={handleLogout}>
        log out
      </Link>
    </div>
  )
}

export default HeaderLoggedIn
