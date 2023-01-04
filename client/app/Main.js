import React, { useEffect, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { useImmerReducer } from "use-immer"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Axios from "axios"
Axios.defaults.baseURL = "http://localhost:8080"

// global state and dispatch
import StateContext from "./StateContext"
import DispatchContext from "./DispatchContext"

import Header from "./components/Header"
import Home from "./components/Home"
import Guest from "./components/Guest"
import ViewSingleNote from "./components/ViewSingleNote"
import EditNote from "./components/EditNote"
import CreateNote from "./components/CreateNote"
import NotFound from "./components/NotFound"

function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("appToken")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("appToken"),
      username: localStorage.getItem("appUsername")
    }
  }
  function reducer(draft, action) {
    switch (action.type) {
      case "login":
        draft.loggedIn = true
        draft.user = action.data
        return
      case "logout":
        draft.loggedIn = false
        return
      case "flashMessage":
        draft.flashMessages.push(action.value)
        return
    }
  }
  const [state, dispatch] = useImmerReducer(reducer, initialState)

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("appToken", state.user.token)
      localStorage.setItem("appUsername", state.user.username)
    } else {
      localStorage.removeItem("appToken")
      localStorage.removeItem("appUsername")
    }
  }, [state.loggedIn])

  // Checking if token is expired
  useEffect(() => {
    // if requestCount > 0
    if (state.loggedIn) {
      const ourRequest = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.post("/checkToken", { token: state.user.token }, { cancelToken: ourRequest.token })
          if (!response.data) {
            dispatch({ type: "logout" })
            dispatch({ type: "flashMessage", value: "Your session has expired. Please log in again." })
          }
        } catch (error) {
          console.log(error.response.data)
        }
      }
      fetchResults()
      return () => ourRequest.cancel()
    }
  }, [])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <Header />

          <Routes>
            <Route path="/" element={state.loggedIn ? <Home /> : <Guest />} />
            <Route path="/note/:id" element={<ViewSingleNote />} />
            <Route path="/note/:id/edit" element={<EditNote />} />
            <Route path="/create-note" element={<CreateNote />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

const root = createRoot(document.querySelector("#app"))
root.render(<Main />)

if (module.hot) {
  module.hot.accept()
}
