const transactionModel = require('../models/transaction.model')
const userModel = require('../models/user.model')
const productModel = require('../models/product.model')
const clickCheckToken = require('../utils/click-check')
const { ClickError, ClickAction, TransactionState } = require('../enum/transaction.enum')

class ClickService {
	async prepare(data) {
		const { click_trans_id, service_id, merchant_trans_id, amount, action, sign_time, sign_string } = data

		const order = await transactionModel.findById(merchant_trans_id)

		if (!order) {
			return { error: ClickError.TransactionNotFound, error_note: 'Transaction not found' }
		}

		const userId = order.user
		const productId = order.product
		const orderId = order._id

		const signatureData = { click_trans_id, service_id, orderId, amount, action, sign_time }

		const checkSignature = clickCheckToken(signatureData, sign_string)
		if (!checkSignature) {
			return { error: ClickError.SignFailed, error_note: 'Invalid sign' }
		}

		if (parseInt(action) !== ClickAction.Prepare) {
			return { error: ClickError.ActionNotFound, error_note: 'Action not found' }
		}

		const isAlreadyPaid = await transactionModel.findOne({
			user: userId,
			product: productId,
			status: TransactionState.Paid,
			provider: 'click',
		})

		if (isAlreadyPaid) {
			return { error: ClickError.AlreadyPaid, error_note: 'Already paid' }
		}

		const user = await userModel.findById(userId)
		if (!user) {
			return { error: ClickError.UserNotFound, error_note: 'User not found' }
		}

		const product = await productModel.findById(productId)
		if (!product) {
			return { error: ClickError.BadRequest, error_note: 'Product not found' }
		}

		if (parseInt(amount) !== product.price) {
			return { error: ClickError.InvalidAmount, error_note: 'Incorrect parameter amount' }
		}

		const transaction = await transactionModel.findOne({ id: click_trans_id })
		if (transaction && transaction.status === TransactionState.Canceled) {
			return { error: ClickError.TransactionCanceled, error_note: 'Transaction canceled' }
		}

		const time = new Date().getTime()

		await transactionModel.create({
			id: click_trans_id,
			user: userId,
			product: productId,
			state: TransactionState.Pending,
			create_time: time,
			amount,
			prepare_id: time,
			provider: 'click',
		})

		return {
			click_trans_id,
			merchant_trans_id,
			merchant_prepare_id: time,
			error: ClickError.Success,
			error_note: 'Success',
		}
	}

	async complete(data) {
		const { click_trans_id, service_id, merchant_trans_id, merchant_prepare_id, amount, action, sign_time, sign_string, error } =
			data

		const order = await transactionModel.findById(merchant_trans_id)

		const userId = order.user
		const productId = order.premium
		const orderId = order._id

		const signatureData = { click_trans_id, service_id, orderId, merchant_prepare_id, amount, action, sign_time }

		const checkSignature = clickCheckToken(signatureData, sign_string)

		if (!checkSignature) {
			return { error: ClickError.SignFailed, error_note: 'Invalid sign' }
		}

		if (parseInt(action) !== ClickAction.Complete) {
			return { error: ClickError.ActionNotFound, error_note: 'Action not found' }
		}

		const user = await userModel.findById(userId)
		if (!user) {
			return { error: ClickError.UserNotFound, error_note: 'User not found' }
		}

		const product = await productModel.findById(productId)
		if (!product) {
			return { error: ClickError.BadRequest, error_note: 'Product not found' }
		}

		const isPrepared = await transactionModel.findOne({ prepare_id: merchant_prepare_id, provider: 'click' })
		if (!isPrepared) {
			return { error: ClickError.TransactionNotFound, error_note: 'Transaction not found' }
		}

		const isAlreadyPaid = await transactionModel.findOne({ userId, productId, state: TransactionState.Paid, provider: 'click' })
		if (isAlreadyPaid) {
			return { error: ClickError.AlreadyPaid, error_note: 'Already paid for course' }
		}

		if (parseInt(amount) !== product.price) {
			return { error: ClickError.InvalidAmount, error_note: 'Incorrect parameter amount' }
		}

		const transaction = await transactionModel.findOne({ id: click_trans_id })
		if (transaction && transaction.state === TransactionState.Canceled) {
			return { error: ClickError.TransactionCanceled, error_note: 'Transaction canceled' }
		}

		const time = new Date().getTime()

		if (error < 0) {
			await transactionModel.findOneAndUpdate({ id: click_trans_id }, { state: TransactionState.Canceled, cancel_time: time })
			return { error: ClickError.TransactionNotFound, error_note: 'Transaction not found' }
		}

		await transactionModel.findOneAndUpdate({ id: click_trans_id }, { state: TransactionState.Paid, perform_time: time })

		return {
			click_trans_id,
			merchant_trans_id,
			merchant_confirm_id: time,
			error: ClickError.Success,
			error_note: 'Success',
		}
	}
}

module.exports = new ClickService()
