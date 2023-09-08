import React from "react"
import { Link } from "react-router-dom"

function Note(props) {
  const date = new Date(props.note.createdDate)
  const dateFormatted = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
  const truncatedBody =
    props.note.body.length > 255 ? `${props.note.body.substring(0, 255)}...` : props.note.body

  return (
    <Link onClick={props.onClick} to={`/note/${props.note._id}`}>
      <h2>{props.note.title}</h2> <p>{dateFormatted}</p>
      <h3>{truncatedBody}</h3>
    </Link>
  )
}

export default Note
