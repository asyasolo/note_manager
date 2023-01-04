import React, { useEffect, useContext } from "react"
import Axios from "axios"
import { useImmerReducer } from "use-immer"
import { CSSTransition } from "react-transition-group"

import Page from "./Page"
import DispatchContext from "../DispatchContext"

function Guest() {
  const appDispatch = useContext(DispatchContext)

  const initialState = {
    username: {
      value: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0
    },
    email: {
      value: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0
    },
    password: {
      value: "",
      hasErrors: false,
      message: ""
    },
    submitCount: 0
  }

  function reducer(draft, action) {
    switch (action.type) {
      case "usernameImmediately":
        draft.username.hasErrors = false
        draft.username.value = action.value
        if (draft.username.value.length > 30) {
          draft.username.hasErrors = true
          draft.username.message = "Username must not exceed 30 charecters."
        }
        if (draft.username.value && !/^([a-zA-Z0-9]+)$/.test(draft.username.value)) {
          draft.username.hasErrors = true
          draft.username.message = "Используйте только цифры и латинские буквы."
        }
        return
      case "usernameAfterDelay":
        if (draft.username.value.length < 3) {
          draft.username.hasErrors = true
          draft.username.message = "Логин должен быть не менее 3 символов."
        }
        if (!draft.username.hasErrors && !action.noRequest) {
          draft.username.checkCount++
        }
        return
      case "usernameUniqueResults":
        if (action.value) {
          draft.username.hasErrors = true
          draft.username.isUnique = false
          draft.username.message = "Это имя пользователя уже занято."
        } else {
          draft.username.isUnique = true
        }
        return
      case "emailImmediately":
        draft.email.hasErrors = false
        draft.email.value = action.value
        return
      case "emailAfterDelay":
        if (!/^\S+@\S+$/.test(draft.email.value)) {
          draft.email.hasErrors = true
          draft.email.message = "Укажите действующий адрес почты."
        }
        if (!draft.email.hasErrors && !action.noRequest) {
          draft.email.checkCount++
        }
        return
      case "emailUniqueResults":
        if (action.value) {
          draft.email.hasErrors = true
          draft.email.isUnique = false
          draft.email.message = "Эта почта уже используется."
        } else {
          draft.email.isUnique = true
        }
        return
      case "passwordImmediately":
        draft.password.hasErrors = false
        draft.password.value = action.value
        if (draft.password.value.length > 50) {
          draft.password.hasErrors = true
          draft.password.message = "Пароль не должен превышать 50 символов."
        }
        return
      case "passwordAfterDelay":
        if (draft.password.value.length < 12) {
          draft.password.hasErrors = true
          draft.password.message = "Пароль должен быть не менее 12 символов."
        }
        return
      case "submitForm":
        if (!draft.username.hasErrors && draft.username.isUnique && !draft.email.hasErrors && draft.email.isUnique && !draft.password.hasErrors) {
          draft.submitCount++
        }
        return
    }
  }
  const [state, dispatch] = useImmerReducer(reducer, initialState)

  // seting timeouts on change for username, email, and password
  useEffect(() => {
    if (state.username.value) {
      const delay = setTimeout(() => dispatch({ type: "usernameAfterDelay" }), 800)
      return () => clearTimeout(delay)
    }
  }, [state.username.value])

  useEffect(() => {
    if (state.email.value) {
      const delay = setTimeout(() => dispatch({ type: "emailAfterDelay" }), 800)
      return () => clearTimeout(delay)
    }
  }, [state.email.value])

  useEffect(() => {
    if (state.password.value) {
      const delay = setTimeout(() => dispatch({ type: "passwordAfterDelay" }), 800)
      return () => clearTimeout(delay)
    }
  }, [state.password.value])

  // checkCount?
  useEffect(() => {
    if (state.username.checkCount) {
      const request = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.post("/doesUsernameExist", { username: state.username.value }, { cancelToken: request.token })
          dispatch({ type: "usernameUniqueResults", value: response.data })
        } catch (error) {
          console.log(error.response.data)
        }
      }
      fetchResults()
      return () => request.cancel()
    }
  }, [state.username.checkCount])

  useEffect(() => {
    if (state.email.checkCount) {
      const request = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.post("/doesEmailExist", { email: state.email.value }, { cancelToken: request.token })
          dispatch({ type: "emailUniqueResults", value: response.data })
        } catch (error) {
          console.log(error.response.data)
        }
      }
      fetchResults()
      return () => request.cancel()
    }
  }, [state.email.checkCount])

  // submitting form for creating account
  useEffect(() => {
    if (state.submitCount) {
      const request = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.post("/register", { email: state.email.value, username: state.username.value, password: state.password.value }, { cancelToken: request.token })
          appDispatch({ type: "login", data: response.data })
          appDispatch({ type: "flashMessage", value: "Your account was created!" })
        } catch (error) {
          console.log(error.response.data)
        }
      }
      fetchResults()
      return () => request.cancel()
    }
  }, [state.submitCount])

  function handleSubmit(e) {
    e.preventDefault()
    dispatch({ type: "usernameImmediately", value: state.username.value })
    dispatch({ type: "usernameAfterDelay", value: state.username.value, noRequest: true })
    dispatch({ type: "emailImmediately", value: state.email.value })
    dispatch({ type: "emailAfterDelay", value: state.email.value, noRequest: true })
    dispatch({ type: "passwordImmediately", value: state.password.value })
    dispatch({ type: "passwordAfterDelay", value: state.password.value })
    dispatch({ type: "submitForm" })
  }

  return (
    <Page title="Привет!">
      <div className="guest-container">
        <div className="guest-container-inner">
          <h1 className="guest-text">
            NoteBound это удобный список дел, <br />
            хранилище текстов и изображений
          </h1>
          <div className="form-guest">
            <h4>Регистрация</h4>
            <form className="form-guest-container" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username-register">
                  <small>Логин</small>
                </label>
                <input onChange={e => dispatch({ type: "usernameImmediately", value: e.target.value })} id="username-register" name="username" type="text" placeholder="введите имя" autoComplete="off" />
                <CSSTransition in={state.username.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                  <div className="alert alert-danger small liveValidateMessage">{state.username.message}</div>
                </CSSTransition>
              </div>
              <div className="form-group">
                <label htmlFor="email-register">
                  <small>Почта</small>
                </label>
                <input onChange={e => dispatch({ type: "emailImmediately", value: e.target.value })} id="email-register" name="email" type="text" placeholder="you@example.com" autoComplete="off" />
                <CSSTransition in={state.email.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                  <div className="alert alert-danger small liveValidateMessage">{state.email.message}</div>
                </CSSTransition>
              </div>
              <div className="form-group">
                <label htmlFor="password-register">
                  <small>Пароль</small>
                </label>
                <input onChange={e => dispatch({ type: "passwordImmediately", value: e.target.value })} id="password-register" name="password" type="password" placeholder="введите пароль" />
                <CSSTransition in={state.password.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                  <div className="alert alert-danger small liveValidateMessage">{state.password.message}</div>
                </CSSTransition>
              </div>
              <button className="btn register-btn" type="submit">
                Зарегистрироваться
              </button>
            </form>
          </div>
        </div>
      </div>
    </Page>
  )
}

export default Guest
