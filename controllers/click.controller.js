const clickService = require('../services/click.service')

class ClickController {
	async prepare(req, res, next) {
		try {
			const data = req.body
			const result = await clickService.prepare(data)
			res.set({ headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } }).send(result)
		} catch (error) {
			next(error)
		}
	}
	async complete(req, res, next) {
		try {
			const data = req.body
			const result = await clickService.complete(data)
			res.set({ headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } }).send(result)
		} catch (error) {
			next(error)
		}
	}
}

module.exports = new ClickController()
