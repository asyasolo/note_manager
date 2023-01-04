import React, { useEffect } from "react"
import { Link } from "react-router-dom"

function Note(props) {
  const date = new Date(props.note.createdDate)
  const dateFormatted = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
  return (
    <Link onClick={props.onClick} to={`/note/${props.note._id}`} className="list-group-item">
      <p>{props.note.title}</p> <p>{dateFormatted}</p>
    </Link>
  )
}

export default Note
