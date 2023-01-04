const notesCollection = require("../db").db().collection("notes")
const ObjectId = require("mongodb").ObjectId
const sanitizeHTML = require("sanitize-html")

notesCollection.createIndex({ title: "text", body: "text" })

let Note = function (data, userid, requestedNoteId) {
  this.data = data
  this.errors = []
  this.userid = userid
  this.requestedNoteId = requestedNoteId
}

Note.prototype.cleanUp = function () {
  if (typeof this.data.title != "string") {
    this.data.title = ""
  }
  if (typeof this.data.body != "string") {
    this.data.body = ""
  }

  // get rid of any bogus properties
  this.data = {
    title: sanitizeHTML(this.data.title.trim(), { allowedTags: [], allowedAttributes: {} }),
    body: sanitizeHTML(this.data.body.trim(), { allowedTags: [], allowedAttributes: {} }),
    createdDate: new Date(),
    author: ObjectId(this.userid)
  }
}

Note.prototype.validate = function () {
  if (this.data.title == "") {
    this.errors.push("You must provide a title.")
  }
  if (this.data.body == "") {
    this.errors.push("You must provide note content.")
  }
}

Note.prototype.create = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp()
    this.validate()
    if (!this.errors.length) {
      // save note into database
      notesCollection
        .insertOne(this.data)
        .then(info => {
          resolve(info.insertedId)
        })
        .catch(e => {
          this.errors.push("Please try again later.")
          reject(this.errors)
        })
    } else {
      reject(this.errors)
    }
  })
}

Note.prototype.update = function () {
  return new Promise(async (resolve, reject) => {
    try {
      let note = await Note.findSingleById(this.requestedNoteId, this.userid)
      if (note.isVisitorOwner) {
        // actually update the db
        let status = await this.actuallyUpdate()
        resolve(status)
      } else {
        reject()
      }
    } catch (e) {
      reject()
    }
  })
}

Note.prototype.actuallyUpdate = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp()
    this.validate()
    if (!this.errors.length) {
      await notesCollection.findOneAndUpdate({ _id: new ObjectId(this.requestedNoteId) }, { $set: { title: this.data.title, body: this.data.body } })
      resolve("success")
    } else {
      resolve("failure")
    }
  })
}

Note.reusableNoteQuery = function (uniqueOperations, visitorId, finalOperations = []) {
  return new Promise(async function (resolve, reject) {
    let aggOperations = uniqueOperations
      .concat([
        { $lookup: { from: "users", localField: "author", foreignField: "_id", as: "authorDocument" } },
        {
          $project: {
            title: 1,
            body: 1,
            createdDate: 1,
            authorId: "$author",
            author: { $arrayElemAt: ["$authorDocument", 0] }
          }
        }
      ])
      .concat(finalOperations)

    let notes = await notesCollection.aggregate(aggOperations).toArray()

    // clean up author property in each note object
    notes = notes.map(function (note) {
      note.isVisitorOwner = note.authorId.equals(visitorId)
      note.authorId = undefined

      note.author = {
        username: note.author.username
      }

      return note
    })

    resolve(notes)
  })
}

Note.findSingleById = function (id, visitorId) {
  return new Promise(async function (resolve, reject) {
    if (typeof id != "string" || !ObjectId.isValid(id)) {
      reject()
      return
    }

    let notes = await Note.reusableNoteQuery([{ $match: { _id: new ObjectId(id) } }], visitorId)

    if (notes.length) {
      resolve(notes[0])
    } else {
      reject()
    }
  })
}

Note.findByAuthorId = function (authorId) {
  return new Promise(async function (resolve, reject) {
    if (typeof authorId != "string" || !ObjectId.isValid(authorId)) {
      reject()
      return
    }

    let notes = await notesCollection
      .find({ author: new ObjectId(authorId) })
      .sort({ _id:-1 })
      .toArray()

    if (notes.length) {
      console.log(notes)
      resolve(notes)
    } else {
      reject()
    }
  })
}

Note.delete = function (noteIdToDelete, currentUserId) {
  return new Promise(async (resolve, reject) => {
    try {
      let note = await Note.findSingleById(noteIdToDelete, currentUserId)
      if (note.isVisitorOwner) {
        await notesCollection.deleteOne({ _id: new ObjectId(noteIdToDelete) })
        resolve()
      } else {
        reject()
      }
    } catch (e) {
      reject()
    }
  })
}

Note.search = function (searchTerm) {
  return new Promise(async (resolve, reject) => {
    if (typeof searchTerm == "string") {
      let notes = await Note.reusableNoteQuery([{ $match: { $text: { $search: searchTerm } } }], undefined, [{ $sort: { score: { $meta: "textScore" } } }])
      resolve(notes)
    } else {
      reject()
    }
  })
}

Note.countNotesByAuthor = function (id) {
  return new Promise(async (resolve, reject) => {
    let noteCount = await notesCollection.countDocuments({ author: id })
    resolve(noteCount)
  })
}

Note.getFeed = async function (id) {
  // create an array of the notes ids that the current user wrote
  let userNotes = await notesCollection.find({ authorId: new ObjectId(id) }).toArray()
  userNotes = userNotes.map(function (notesDoc) {
    return notesDoc.notesId
  })

  // look for notes where the author is in the above array of followed users
  return Note.reusableNoteQuery([{ $match: { author: { $in: userNotes } } }, { $sort: { createdDate: -1 } }])
}

module.exports = Note
