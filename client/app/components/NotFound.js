import React, { useEffect } from "react"
import { Link } from "react-router-dom"
import Page from "./Page"

function NotFound() {
  return (
    <Page title="Ой!">
      <div className="home-container">
        <div className="home-empty">
          <h3>
            Страница исчезла <br /> или никогда не существовала!
          </h3>
          <p>
            Если хотите, можете вернуться{" "}
            <Link to="/">
              <span className="green">на главную страницу</span>
            </Link>
          </p>
        </div>
      </div>
    </Page>
  )
}

export default NotFound
