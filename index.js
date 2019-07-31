const express = require('express');
const app = express();
const hue = require('hue-api')();
const cors = require('cors');

require('dotenv').config();

const port = process.env.PORT || 5000;
const clientId = process.env.HUE_CLIENT_ID;
const clientSecret = process.env.HUE_CLIENT_SECRET;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000/';

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
	res.redirect(hue.oauth2.getOauthLink(clientId));
});

/**
 * Proxy requests to real Hue API
 */
app.all('/v2/:path(*)', (req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	const opts = {
		method: req.method,
		headers: {
			'Authorization': req.header('Authorization'),
			'Content-Type': 'application/json'
		}
	};
	if (req.method != 'GET') {
		opts.body = JSON.stringify(req.body);
	}
	hue.call('/v2/' + req.params.path, opts).then(json => res.json(json)).catch(next);
});

app.get('/callback', (req, res) => {
	hue.oauth2.getToken(clientId, clientSecret, req.query.code)
		.then(json => {
			res.redirect(frontendUrl + '?access_token=' + json.access_token);
		});
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}!`);
	console.log({clientId, clientSecret, frontendUrl});
});