const Note = require("../models/Note")

exports.apiCreate = function (req, res) {
  let note = new Note(req.body, req.apiUser._id)
  note
    .create()
    .then(function (newId) {
      res.json(newId)
    })
    .catch(function (errors) {
      res.json(errors)
    })
}

exports.apiUpdate = function (req, res) {
  let note = new Note(req.body, req.apiUser._id, req.params.id)
  note
    .update()
    .then(status => {
      // the note was successfully updated in the database
      // or user did have permission, but there were validation errors
      if (status == "success") {
        res.json("success")
      } else {
        res.json("failure")
      }
    })
    .catch(e => {
      // a note with the requested id doesn't exist
      // or if the current visitor is not the owner of the requested note
      res.json("no permissions")
    })
}

exports.apiDelete = function (req, res) {
  Note.delete(req.params.id, req.apiUser._id)
    .then(() => {
      res.json("Success")
    })
    .catch(e => {
      res.json("You do not have permission to perform that action.")
    })
}

exports.search = function (req, res) {
  Note.search(req.body.searchTerm)
    .then(notes => {
      res.json(notes)
    })
    .catch(e => {
      res.json([])
    })
}

exports.reactApiViewSingle = async function (req, res) {
  try {
    let note = await Note.findSingleById(req.params.id)
    res.json(note)
  } catch (e) {
    res.json(false)
  }
}
