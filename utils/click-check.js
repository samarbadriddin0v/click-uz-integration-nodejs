const md5 = require('md5')

const clickCheckToken = (data, signString) => {
	const { transId, serviceId, orderId, merchantPrepareId, amount, action, signTime } = data
	const CLICK_SECRET_KEY = process.env.CLICK_SECRET_KEY
	const prepareId = merchantPrepareId || ''
	const signature = `${transId}${serviceId}${CLICK_SECRET_KEY}${orderId}${prepareId}${amount}${action}${signTime}`
	const signatureHash = md5(signature)
	return signatureHash === signString
}

module.exports = clickCheckToken
