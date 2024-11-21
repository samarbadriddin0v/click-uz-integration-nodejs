require('express-group-routes')

const clickController = require('../controllers/click.controller')
const router = require('express').Router()

router.group('/click', route => {
	route.post('/prepare', clickController.prepare)
	route.post('/complete', clickController.complete)
})

module.exports = router
