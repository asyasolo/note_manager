const apiRouter = require("express").Router()
const cors = require("cors")

const userController = require("./controllers/userController")
const noteController = require("./controllers/noteController")

apiRouter.use(cors())

apiRouter.get("/", (req, res) => res.json("surprisingly, it works"))

// check token to log out front-end if expired
apiRouter.post("/checkToken", userController.checkToken)

apiRouter.post("/getHomeFeed", userController.apiMustBeLoggedIn, userController.getNotes)
apiRouter.post("/register", userController.apiRegister)
apiRouter.post("/login", userController.apiLogin)
apiRouter.get("/note/:id", noteController.reactApiViewSingle)
apiRouter.post("/note/:id/edit", userController.apiMustBeLoggedIn, noteController.apiUpdate)
apiRouter.delete("/note/:id", userController.apiMustBeLoggedIn, noteController.apiDelete)
apiRouter.post("/create-note", userController.apiMustBeLoggedIn, noteController.apiCreate)
// implementing search maybe?

apiRouter.post("/doesUsernameExist", userController.doesUsernameExist)
apiRouter.post("/doesEmailExist", userController.doesEmailExist)

module.exports = apiRouter
