import React, { useState, useContext } from "react"
import Axios from "axios"

import DispatchContext from "../DispatchContext"

function HeaderLoggedOut() {
  const [username, setUsername] = useState()
  const [password, setPassword] = useState()
  const appDispatch = useContext(DispatchContext)

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

  return (
    <form onSubmit={handleSubmit}>
      <div className="login-form">
        <div>
          <input className="small login-input" onChange={e => setUsername(e.target.value)} name="username" type="text" placeholder="Логин" autoComplete="off" />
        </div>
        <div>
          <input className="small login-input" onChange={e => setPassword(e.target.value)} name="password" type="password" placeholder="Пароль" autoComplete="off" />
        </div>
        <div>
          <button className="btn login-btn">Войти</button>
        </div>
      </div>
    </form>
  )
}

export default HeaderLoggedOut
