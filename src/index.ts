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
import { router as order } from "./order";
import { StockManager } from "./Manager/StockManager";
import { UserManager, User } from "./Manager/UserManager";
import { OrderManager, CartInterface } from "./Manager/OrderManager";
import { Observable } from "rx";

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
        let user = new User({
            _id: profile.id,
            name: profile.displayName
        });
        UserManager.getInstance().add(user).subscribe(_ => {
            return done(null, profile);
        });
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
app.use("/order", order);

app.get("/", (req, res) => {
    StockManager.getInstance().findAll().subscribe(stocks => {
        stocks.map(function (stock) {
            return stock.getInterface();
        })
        return res.status(200).render("index", {
            products: stocks.map(stock => stock.getInterface()),
            status: req.isAuthenticated()
        });
    })
});

app.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));

app.get("/auth/github/callback", passport.authenticate("github", { failureRedirect: "/" }), (req, res) => {
    return res.redirect("/");
});

app.get("/logout", (req, res) => {
    req.logout();
    return res.redirect("/");
});

app.use((req, res, next) => {
    if (req.isAuthenticated()) next();
    else return res.redirect("/");
});

app.get("/cart", (req, res) => {
    let injectedValue: CartInterface[] = [];
    OrderManager.getInstance().findUserOrder(req.user.id).flatMap(orders => {
        return Observable.forkJoin(orders.map(order => order.getCartInterface()));
    }).subscribe(orders => {
        injectedValue = orders
    }, err => {
        return res.status(500).send(err);
    }, () => {
        return res.status(200).render("cart", {
            products: injectedValue,
            status: req.isAuthenticated()
        });
    });
});