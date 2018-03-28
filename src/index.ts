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
            imgURL: 'https://cdn-images-1.medium.com/max/1125/1*J8PRGgmTqSDHMZEIziLPQA.jpeg',
            name: 'photoset1',
            price: '40'
        },
        {
            imgURL: 'https://i.pinimg.com/originals/48/1e/6e/481e6e7006cc1b5cfc82fc15eef81f22.jpg',
            name: 'T-shirt',
            price: '50'
        },
        {
            imgURL: 'http://img.online-station.net/_content/2018/0119/gallery/1516352435.jpg',
            name: 'Wrist-Band',
            price: '30'
        },{
            imgURL: 'http://img.online-station.net/_content/2018/0307/gallery/1520395852.jpg',
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
        }]
    });
});