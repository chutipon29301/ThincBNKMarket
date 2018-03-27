import * as express from "express";
import * as passport from "passport";
import * as session from "express-session";
import * as morgan from "morgan";
import { Strategy } from "passport-github2";
import { config } from "dotenv";
import { urlencoded, json } from "body-parser";

config();

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

passport.use(new Strategy({
    clientID: process.env.GITHUB_CLIENT,
    clientSecret: process.env.GITHUB_SECRET,
    callbackURL: process.env.CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => {
        return done(null, profile);
    });
}));

const app = express();

app.use(morgan("dev"));
app.use(urlencoded({
    extended: true
}));
app.use(json());
app.use(session({ secret: 'thinc', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static("./public"));
app.set("view engine", "pug");


app.listen(process.env.PORT, () => {
    console.log('Listening on port ' + process.env.PORT);
});

app.get("/", (req, res) => {
    // return res.status(200).render("test");
    return res.status(200).render("index",{
        products: [{
            imgURL: '',
            name: 'photoset1',
            price: '40'
        },
        {
            imgURL: '',
            name: 'T-shirt',
            price: '50'
        },
        {
            imgURL: '',
            name: 'Wrist-Band',
            price: '30'
        },{
            imgURL: '',
            name: 'PenLight',
            price: '20'
        }]
    });
});

app.get("/auth/github/callback", passport.authenticate("github", { failureRedirect: "/" }), (req, res) => {
    res.redirect("/secret");
});

app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

app.use((req, res, next) => {
    if (req.isAuthenticated()) return next();
    return res.redirect("/");
});

app.get("/secret", (req, res) => {
    return res.status(200).send("Hello World from secret place");
});

app.get("/product-detail", (req, res) => {
    res.status(200).render("product-detail");
});

app.get("/cart", (req, res) => {
    res.status(200).render("cart",{
        products: [{
            imgURL: '',
            name: 'photoset',
            price: '40',
            quantity: '2'
        },
        {
            imgURL: '',
            name: 't-shirt',
            price: '50',
            quantity: '1'
        }]
    });
});