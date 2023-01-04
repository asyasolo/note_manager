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
    <div>
      <Link to="/create-note">
        <button className="btn create-btn create-btn-special">Создать</button>
      </Link>
      <Link to="/">
        <button className="btn logout-btn" onClick={handleLogout}>
          Выйти
        </button>
      </Link>
    </div>
  )
}

export default HeaderLoggedIn
