// Captcha manager

const session = require('express-session');
const bodyParser = require('body-parser');
const pathJs = require('path');
const chalk = require('chalk');
const captchaExpress = require('svg-captcha-express');
const cookieParser = require("cookie-parser");
const memcachedStore = require("connect-memcached")(session);

const {authConfig} = require('../conf_reader.js');

const captchaUrl = '/captcha.png';
const captchaSessionId = 'captcha';
const captchaFieldName = 'captcha';

const { Random } = require("random-js");
const random = new Random(); // uses the nativeMath engine

const CAPTCHA_CACHE_PREFIX = 'a3gw_captcha_';

function Captcha() {
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(random.realZeroToOneExclusive() * (max - min)) + min; // The maximum is exclusive and the minimum is inclusive
}

let captcha;

const captchaOptions = {
    cookie: captchaSessionId,
    background: 'rgb(255,255,255)',
    charPreset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    fontSize: 45,
    width: 150,
    height: 55,
    noise: 1,
    color: true
};

Captcha.prototype.captchaFieldName = captchaFieldName;

Captcha.prototype.bindCaptchaListeners = function (app) {
    console.log(chalk.bold.red('\nCaptcha listener is binding...'));

    app.use(cookieParser());

    var sessionOptions = {
        secret: "99d02cfbe6a43158e070a2b1611164dd94e773150cfe496168cc8103a656a8f0",
        resave: false,
        saveUninitialized: true
    };

    if (authConfig.memcachedServers && authConfig.memcachedServers.length > 0) {
        sessionOptions.store = new memcachedStore({
            hosts: authConfig.memcachedServers,
            prefix: CAPTCHA_CACHE_PREFIX,
            ttl: 180
        });
    }

    app.use(session(sessionOptions));

    app.use(bodyParser.urlencoded({extended: false}));

    app.get(captchaUrl, (req, res) => {
        captchaOptions.size = getRandomInt(1, 1); // Finds a number between 1 and 1
        //captchaOptions.size = getRandomInt(5, 6); // Finds a number between 5 and 6

        captcha = captchaExpress.create(captchaOptions);

        // This is in order to hack the main captcha library to show font sizes different for each letters.
        // const charPath = chToPath(text[i], x, y,  Math.floor(Math.random() * (options.fontSize - 20)) + 20, font);
        let preparedFontName = 'font' + getRandomInt(1, 3) + '.ttf'; // Finds a number between 1 and 3
        //let preparedFontName = 'font' + getRandomInt(1, 1) + '.ttf';

        // Load custom font (optional)
        captcha.loadFont(pathJs.join(__dirname, './fonts/' + preparedFontName));

        return captcha.image()(req, res);
    });
};

Captcha.prototype.checkCaptcha = function (req, captchaText) {
    if (captcha) {
        return captcha.check(req, captchaText);
    } else {
        return false;
    }
};

module.exports = new Captcha();

/*
app.post('/login', (req, res) => {
    res.type('html');
    res.end(`
        <p>CAPTCHA VALID: ${captcha.check(req, req.body[captchaFieldName])}</p>
    `);
});
*/
