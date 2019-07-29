const express = require('express');
const app = express();
const hue = require('hue-api')();
const cors = require('cors');

require('dotenv').config();

const port = process.env.PORT || 5000;
const clientId = process.env.HUE_CLIENT_ID;
const clientSecret = process.env.HUE_CLIENT_SECRET;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000/';

app.use(cors());

app.get('/', (req, res) => {
	res.redirect(hue.oauth2.getOauthLink(clientId));
});

app.get('/v2/:path', (req, res) => {
	console.log({path: req.params.path, accessToken: req.header('Authorization').split(' ')[1]});
	res.header('Access-Control-Allow-Origin', '*');
	hue.getJson(req.header('Authorization').split(' ')[1], '/v2/' + req.params.path).then(json => res.json(json));
});

app.get('/callback', (req, res) => {
	hue.oauth2.getToken(clientId, clientSecret, req.query.code)
		.then(json => {
			console.log(json);
			res.redirect(frontendUrl + '?access_token=' + json.access_token);
		});
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}!`);
	console.log({clientId, clientSecret, frontendUrl});
});