const https = require('https');
const express = require('express');
const fs = require('fs');
const readline = require('readline');

const DEFAULT_EMOJI_FILE = 'emojis/emojis';
const FORTUNE_FILE = 'fortunes';

async function getRandomLine(fileName) {
    const fileStream = fs.createReadStream(fileName);
    let lineCount = null;
    let line = '';
    const rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity,
    });
    for await (line of rl) {
	if (lineCount === null) {
	    lineCount = Math.floor(Math.random() * Math.floor(parseInt(line, 10))) + 1;
	} else {
	    lineCount -= 1;
	    if (!lineCount) {
		rl.close();
		fileStream.close();
		break;
	    }
	}
    }
    return line;
}

async function setRandomStatus({
    user,
    token,
    onSuccess = () => {},
    onError = () => {},
    fortuneFile = FORTUNE_FILE,
    emojiFile = DEFAULT_EMOJI_FILE,
}) {
    const options = {
	hostname: 'slack.com',
	port: 443,
	path: '/api/users.profile.set',
	method: 'POST',
	headers: {
	    'Content-Type': 'application/json; charset=utf-8',
	    'X-Slack-User': user,
	    'Authorization': `Bearer ${token}`,
	},
    };

    let fortune = await getRandomLine(FORTUNE_FILE);
    let emoji = await getRandomLine(DEFAULT_EMOJI_FILE);    
    const postReq = https.request(options, (postRes) => {
	postRes.on('end', onSuccess);
    });
    postReq.on('error', onError);
    postReq.end(JSON.stringify({
	profile: { status_text: fortune, status_emoji: emoji, status_expiration: 0 },
    }));
}

if (require.main === module) {
    const app = express();

    app.post('/', async (req, res) => {
	res.sendStatus(200)

	await setRandomStatus({
	    user: process.env.USER_ID,
	    token: process.env.TOKEN,
	    onSuccess: () => res.sendStatus(200),
	    onError: (e) => res.status(500).send(e.message),
	});
    });

    app.listen(process.env.npm_package_config_port);
}

exports.setRandomStatus = setRandomStatus;
