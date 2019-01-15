const { setRandomStatus } = require('./index.js')

setRandomStatus({ user: process.env.USER_ID, token: process.env.TOKEN });
