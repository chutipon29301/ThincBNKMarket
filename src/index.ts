import * as express from "express";
import * as passport from "passport";
import * as session from "express-session";
import * as morgan from "morgan";
import { Strategy } from "passport-github2";
import { config } from "dotenv";
import { urlencoded, json } from "body-parser";
import { join } from "path";
import { router as user } from "./user";
import { router as stock } from "./stock";
import { StockManager } from "./Manager/StockManager";

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

app.use("/user", user);
app.use("/stock", stock);

app.get("/", (req, res) => {
    StockManager.getInstance().findAll().subscribe(stocks => {
        stocks.map(function(stock){
            return stock.getInterface();
        });
        return res.status(200).render("index", {
            products: stocks.map(stock => stock.getInterface()),
            status: req.isAuthenticated()
        });
    })
    // return res.status(200).render("index", {
    //     products: [{
    //         imgURL: 'https://cdn-images-1.medium.com/max/1125/1*J8PRGgmTqSDHMZEIziLPQA.jpeg',
    //         name: 'photoset1',
    //         price: '40'
    //     },
    //     {
    //         imgURL: 'https://i.pinimg.com/originals/48/1e/6e/481e6e7006cc1b5cfc82fc15eef81f22.jpg',
    //         name: 'T-shirt',
    //         price: '50'
    //     },
    //     {
    //         imgURL: 'http://img.online-station.net/_content/2018/0119/gallery/1516352435.jpg',
    //         name: 'Wrist-Band',
    //         price: '30'
    //     }, {
    //         imgURL: 'http://img.online-station.net/_content/2018/0307/gallery/1520395852.jpg',
    //         name: 'PenLight',
    //         price: '20'
    //     }],
    //     status: req.isAuthenticated()
    // });
});

app.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }), (req, res) => {

});

app.get("/auth/github/callback", passport.authenticate("github", { failureRedirect: "/" }), (req, res) => {
    res.redirect("/");
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
    res.status(200).render("cart", {
        products: [{
            imgURL: 'https://cdn-images-1.medium.com/max/1125/1*J8PRGgmTqSDHMZEIziLPQA.jpeg',
            name: 'photoset1',
            price: '40',
            quantity: '2'
        },
        {
            imgURL: 'https://i.pinimg.com/originals/48/1e/6e/481e6e7006cc1b5cfc82fc15eef81f22.jpg',
            name: 'T-shirt',
            price: '50',
            quantity: '1'
        }],
        status: req.isAuthenticated()
    });
});