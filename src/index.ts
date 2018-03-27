import * as express from "express";
import * as morgan from "morgan";
import { urlencoded, json } from "body-parser";
import { config } from "dotenv";

config();

const app = express();

app.use(morgan("common"));
app.use(express.static("./public"));

app.use(urlencoded({
    extended: true
}));
app.use(json());

app.set("view engine", "pug");

app.listen(process.env.PORT, () => {
    console.log('Listening on port ' + process.env.PORT);
});

app.get("/", (req, res) => {
    res.status(200).render("index",{
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