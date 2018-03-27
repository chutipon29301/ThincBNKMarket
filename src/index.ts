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
    return res.status(200).render("test");
});
app.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }), (req, res) => {

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