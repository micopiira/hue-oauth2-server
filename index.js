const express = require('express');
const app = express();
const hue = require('hue-api');


const port = process.env.PORT || 3000;
const clientId = process.env.HUE_CLIENT_ID;
const clientSecret = process.env.HUE_CLIENT_SECRET;
const frontendUrl = process.env.FRONTEND_URL;

app.get('/', (req, res) => {
	res.send(hue.oauth2.getOauthLink(clientId));
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