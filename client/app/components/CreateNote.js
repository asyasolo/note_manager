import React, { useEffect, useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import Axios from "axios"
import { Link } from "react-router-dom"

import Page from "./Page"
import DispatchContext from "../DispatchContext"
import StateContext from "../StateContext"

function CreatePost(props) {
  const [title, setTitle] = useState()
  const [body, setBody] = useState()
  const navigate = useNavigate()
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const response = await Axios.post("/create-note", { title, body, token: appState.user.token })
      // Redirecting to the note
      appDispatch({ type: "flashMessage", value: "New Post Was Created." })
      navigate(`/note/${response.data}`)
      console.log("note successfully created")
    } catch (e) {
      console.log(e.response.data)
    }
  }

  return (
    <Page title="Создайте Заметку">
      <div className="one-note-container">
        <Link className="back-btn" to={`/`}>
          &laquo;
        </Link>

        <form className="form-create-note" onSubmit={handleSubmit}>
          <input placeholder="Название..." onChange={e => setTitle(e.target.value)} autoFocus name="title" id="note-title" className="form-control form-control-title" type="text" autoComplete="off" />

          <textarea placeholder="Заметка..." onChange={e => setBody(e.target.value)} name="body" id="note-body" className="form-control form-control-body" type="text"></textarea>

          <button className="btn save-btn save-btn-special">Сохранить заметку</button>
        </form>
      </div>
    </Page>
  )
}

export default CreatePost
