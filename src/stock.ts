import { Router } from "express";
import { Stock, StockManager } from "./Manager/StockManager";

export const router = Router();

router.post("/add", (req, res) => {

    if (!(req.body.imgURL && req.body.name && req.body.price)) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request"
        });
    }

    let newStock = new Stock({
        imgURL: req.body.imgURL,
        name: req.body.name,
        price: parseInt(req.body.price)
    });

    StockManager.getInstance().add(newStock).subscribe(isSuccess => {
        if (isSuccess) {
            return res.status(200).send({
                msg: "Ok"
            });
        } else {
            return res.status(202).send({
                msg: "No user added"
            });
        }
    }, err => {
        return res.status(500).send(err);
    });
});

router.post("/get", (req, res) => {
    if (!req.body.id) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request"
        });
    }
    StockManager.getInstance().find(req.body.id).subscribe(stock => {
        return res.status(200).send({
            stock: stock
        });
    });
});

router.post("/delete", (req, res) => {
    if (!req.body.id) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request"
        });
    }
    StockManager.getInstance().delete(req.body.id).subscribe(_ => {
        return res.status(200).send({
            msg: "OK"
        });
    });
});

router.post("/all", (req, res) => {
    StockManager.getInstance().findAll().subscribe(stocks => {
        return res.status(200).send({
            stocks: stocks
        });
    });
});