import React, { useEffect, useState, useContext } from "react"
import Axios from "axios"
import { useParams, Link, useNavigate } from "react-router-dom"
import ReactMarkdown from "react-markdown"

import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

import Page from "./Page"
import NotFound from "./NotFound"

function ViewSingleNote() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [note, setNote] = useState()
  const { id } = useParams()
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  useEffect(() => {
    const axiosRequest = Axios.CancelToken.source()

    async function fetchNote() {
      try {
        const response = await Axios.get(`/note/${id}`, { cancelToken: axiosRequest.token })
        setNote(response.data)
        setIsLoading(false)
      } catch (e) {
        console.log("Problem")
      }
    }
    fetchNote()
    return () => {
      axiosRequest.cancel()
    }
  }, [id])

  if (!isLoading && !note) {
    return <NotFound />
  }

  if (isLoading)
    return (
      <Page title="...">
        <p>Loading....</p>
      </Page>
    )

  const date = new Date(note.createdDate)
  const dateFormatted = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`

  function isOwner() {
    if (appState.loggedIn) {
      return appState.user.username == note.author.username
    }
    return false
  }
  async function deleteHandler() {
    const areYouSure = window.confirm("Вы уверены?")
    if (areYouSure) {
      try {
        const response = await Axios.delete(`/note/${id}`, { data: { token: appState.user.token } })
        if (response.data == "Success") {
          // 1. displaying a flash message
          appDispatch({ type: "flashMessage", value: "Note was deleted" })
          // 2. redirecting to profilepage
          navigate(`/`)
        }
      } catch (error) {
        console.log(error.response.data)
      }
    }
  }

  // Things inside
  /* 
  <span className="pt-2">
            <Link to={`/note/${note._id}/edit`} className="text-primary mr-2">
              <i className="fas fa-edit"></i>
            </Link>
            <a onClick={deleteHandler} className="delete-note-button text-danger">
              <i className="fas fa-trash"></i>
            </a>
          </span>
          */

  return (
    <Page title={note.title}>
      <div className="one-note-container">
        <Link className="back-btn" to={`/`}>
          &laquo;
        </Link>

        <div className="one-note-container-inner">
          <div className="one-note-content">
            <h2>{note.title}</h2>
            <p>{dateFormatted}</p>
            <hr />

            <div className="body-content">
              <ReactMarkdown children={note.body} allowedElements={["p", "br", "em", "h1", "h2", "h3", "h4", "ul", "ol", "li", "strong"]} />
            </div>
          </div>

          {isOwner() && (
            <div className="btn-container">
              <Link to={`/note/${note._id}/edit`}>
                <button className="btn edit-btn edit-btn-special">Изменить заметку</button>
              </Link>
              <a onClick={deleteHandler}>
                <button className="btn delete-btn">Удалить заметку</button>
              </a>
            </div>
          )}
        </div>
      </div>
    </Page>
  )
}

export default ViewSingleNote
