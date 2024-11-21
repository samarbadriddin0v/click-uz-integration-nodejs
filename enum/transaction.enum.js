exports.ClickError = {
	Success: 0,
	SignFailed: -1,
	InvalidAmount: -2,
	ActionNotFound: -3,
	AlreadyPaid: -4,
	UserNotFound: -5,
	TransactionNotFound: -6,
	BadRequest: -8,
	TransactionCanceled: -9,
}

exports.ClickAction = {
	Prepare: 0,
	Complete: 1,
}

exports.TransactionState = {
	Paid: 2,
	Pending: 1,
	PendingCanceled: -1,
	PaidCanceled: -2,
}
