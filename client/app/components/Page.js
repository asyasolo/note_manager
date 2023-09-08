import React, { useEffect } from "react"

function Page(props) {
  useEffect(() => {
    document.title = `${props.title} | NoteBound`
    window.scrollTo(0, 0)
  }, [props.title])

  return (
    <div className="main-content-container">
      <div className="color-splash-blue"></div>
      <div className="color-splash-blue-second"></div>
      <div className="color-splash-pink"></div>

      {props.children}
    </div>
  )
}

export default Page
