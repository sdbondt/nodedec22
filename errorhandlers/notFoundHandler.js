const notFoundHandler = (req, res) => res.status(404).json({ msg: 'Something went wrong.'})

module.exports = notFoundHandler