const { setRandomStatus } = require('./index.js')

setRandomStatus(process.env.USER_ID, process.env.TOKEN, () => {}, () => {});
