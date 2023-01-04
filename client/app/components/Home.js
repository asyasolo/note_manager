import React, { useEffect, useContext } from "react"
import { useImmer } from "use-immer"
import Axios from "axios"
import { Link } from "react-router-dom"

import Page from "./Page"
import StateContext from "../StateContext"
import Note from "./Note"

function Home() {
  const appState = useContext(StateContext)
  const [state, setState] = useImmer({
    isLoading: true,
    feed: []
  })

  useEffect(() => {
    const axiosRequest = Axios.CancelToken.source()

    async function fetchData() {
      try {
        const response = await Axios.post("/getHomeFeed", { token: appState.user.token }, { cancelToken: axiosRequest.token })
        setState(draft => {
          ;(draft.isLoading = false), (draft.feed = response.data)
        })
      } catch (e) {
        console.log(e.response.data)
        setState(draft => {
          draft.isLoading = false
        })
      }
    }
    fetchData()
    return () => {
      axiosRequest.cancel()
    }
  }, [])

  if (state.isLoading) {
    return <h1>Loading...</h1>
  }

  return (
    <Page title="Ваши Заметки">
      <div className="home-container">
        {state.feed.length > 0 && (
          <div className="home-feed">
            <h3>Что нового, {appState.user.username}?</h3>
            <hr />
            <div className="list-group">
              {state.feed.map(note => {
                return <Note note={note} key={note._id} />
              })}
            </div>
          </div>
        )}
        {state.feed.length == 0 && (
          <div className="home-empty">
            <h3>Добро пожаловать в NoteBound, {appState.user.username}!</h3>
            <p>
              Похоже, что у вас еще нет ни одной заметки! <br />
              Создайте
              <Link to="/create-note">
                <span className="green"> что-нибудь новое</span>
              </Link>
              :)
            </p>
          </div>
        )}
      </div>
    </Page>
  )
}

export default Home
