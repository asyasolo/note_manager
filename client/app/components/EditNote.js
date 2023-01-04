import React, { useEffect, useState, useContext } from "react"
import { useImmerReducer } from "use-immer"
import Axios from "axios"
import { useParams, Link, useNavigate } from "react-router-dom"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

import Page from "./Page"
import NotFound from "./NotFound"

function EditPost() {
  const navigate = useNavigate()
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  const initialstate = {
    title: {
      value: "",
      hasErrors: false,
      message: ""
    },
    body: {
      value: "",
      hasErrors: false,
      message: ""
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0,
    notFound: false
  }
  function ourReducer(draft, action) {
    switch (action.type) {
      case "fetchComplete":
        draft.title.value = action.value.title
        draft.body.value = action.value.body
        draft.isFetching = false
        return
      case "titleChange":
        draft.title.hasErrors = false
        draft.title.value = action.value
        return
      case "bodyChange":
        draft.body.hasErrors = false
        draft.body.value = action.value
        return
      case "submitRequest":
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.sendCount++
        }
        return
      case "saveRequestStarted":
        draft.isSaving = true
        return
      case "saveRequestFinished":
        draft.isSaving = false
        return
      case "titleRules":
        if (!action.value.trim()) {
          draft.title.hasErrors = true
          draft.title.message = "Provide a title, please"
        }
        return
      case "bodyRules":
        if (!action.value.trim()) {
          draft.body.hasErrors = true
          draft.body.message = "Provide some content, please"
        }
        return
      case "notFound":
        draft.notFound = true
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialstate)

  function submitHandler(e) {
    e.preventDefault()
    dispatch({ type: "titleRules", value: state.title.value })
    dispatch({ type: "bodyRules", value: state.body.value })
    dispatch({ type: "submitRequest" })
  }

  useEffect(() => {
    const axiosRequest = Axios.CancelToken.source()

    async function fetchPost() {
      try {
        const response = await Axios.get(`/note/${state.id}`, { cancelToken: axiosRequest.token })
        if (response.data) {
          dispatch({ type: "fetchComplete", value: response.data })
          if (appState.user.username != response.data.author.username) {
            appDispatch({ type: "flashMessage", value: "You don't have permission to edit this note." })
            navigate("/")
          }
        } else {
          dispatch({ type: "notFound" })
        }
      } catch (e) {
        console.log("Problem")
      }
    }
    fetchPost()
    return () => {
      axiosRequest.cancel()
    }
  }, [])

  useEffect(() => {
    if (state.sendCount) {
      dispatch({ type: "saveRequestStarted" })
      const axiosRequest = Axios.CancelToken.source()

      async function fetchPost() {
        try {
          const response = await Axios.post(`/note/${state.id}/edit`, { title: state.title.value, body: state.body.value, token: appState.user.token }, { cancelToken: axiosRequest.token })
          dispatch({ type: "saveRequestFinished" })
          appDispatch({ type: "flashMessage", value: "Post Was Updated" })
          navigate(`/note/${state.id}`)
        } catch (e) {
          console.log("Problem")
        }
      }
      fetchPost()
      return () => {
        axiosRequest.cancel()
      }
    }
  }, [state.sendCount])

  if (state.notFound) {
    return <NotFound />
  }

  if (state.isFetching)
    return (
      <Page title="...">
        <h1>Loading...</h1>
      </Page>
    )

  return (
    <Page title="Редактировать Заметку">
      <div className="one-note-container">
        <Link className="back-btn" to={`/`}>
          &laquo;
        </Link>

        <form className="form-create-note" onSubmit={submitHandler}>
          <input onBlur={e => dispatch({ type: "titleRules", value: e.target.value })} onChange={e => dispatch({ type: "titleChange", value: e.target.value })} value={state.title.value} autoFocus name="title" id="note-title" className="form-control form-control-title" type="text" placeholder="" autoComplete="off" />
          {state.title.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.title.message}</div>}

          <textarea onBlur={e => dispatch({ type: "bodyRules", value: e.target.value })} onChange={e => dispatch({ type: "bodyChange", value: e.target.value })} value={state.body.value} name="body" id="note-body" className="form-control form-control-body" type="text" />
          {state.body.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.body.message}</div>}

          <button disabled={state.isSaving} className="btn save-btn save-btn-special">
            Сохранить заметку
          </button>
        </form>
      </div>
    </Page>
  )
}

export default EditPost
