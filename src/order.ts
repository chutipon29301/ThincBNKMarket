import * as _ from "lodash";
import { Router } from "express";
import { Order, OrderManager } from "./Manager/OrderManager";
import { Observable } from "rx";

export const router = Router();

router.post("/add", (req, res) => {

    if (!(req.body.id && req.body.stockID && req.body.quantity)) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request"
        });
    }

    let newOrder = new Order({
        userID: req.body.id,
        stockID: req.body.stockID,
        quantity: req.body.quantity
    });

    OrderManager.getInstance().add(newOrder).subscribe(isSuccess => {
        return res.status(200).send({
            msg: "Ok"
        });
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
    OrderManager.getInstance().find(req.body.id).subscribe(order => {
        return res.status(200).send({
            order: order
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
    OrderManager.getInstance().delete(req.body.id).subscribe(_ => {
        return res.status(200).send({
            msg: "OK"
        });
    });
});

router.get("/delete", (req, res) => {
    if (!req.query.id) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request"
        });
    }
    OrderManager.getInstance().delete(req.query.id).subscribe(_ => {
        return res.redirect("/cart");
    });
});

router.post("/update", (req, res) => {
    if (!(req.user && req.body.stocks && req.body.quantities)) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request"
        });
    }
    let updateValue: [string, number][] = _.zip(req.body.stocks, req.body.quantities);
    Observable.forkJoin(updateValue.map(value => {
        return OrderManager.getInstance().updateQuantity(req.user.id, value[0], value[1]);
    })).subscribe(_ => {
        return res.status(200).send({
            msg: "OK"
        });
    }, err => {
        return res.status(500).send(err);
    });
});

router.post("/all", (req, res) => {
    OrderManager.getInstance().findAll().subscribe(orders => {
        return res.status(200).send({
            orders: orders
        });
    });
});