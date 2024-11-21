const md5 = require('md5')

const clickCheckToken = (data, signString) => {
	const { click_trans_id, service_id, orderId, merchant_prepare_id, amount, action, sign_time } = data
	const CLICK_SECRET_KEY = process.env.CLICK_SECRET_KEY
	const prepareId = merchant_prepare_id || ''
	const signature = `${click_trans_id}${service_id}${CLICK_SECRET_KEY}${orderId}${prepareId}${amount}${action}${sign_time}`
	const signatureHash = md5(signature)
	return signatureHash === signString
}

module.exports = clickCheckToken
