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
    if (!(req.body.stockID && req.user.id)) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request"
        });
    }
    OrderManager.getInstance().delete(req.body.id, req.user.id).subscribe(_ => {
        return res.status(200).send({
            msg: "OK"
        });
    });
});

router.get("/delete", (req, res) => {
    if (!(req.query.id && req.user.id)) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request"
        });
    }
    OrderManager.getInstance().delete(req.query.id, req.user.id).subscribe(_ => {
        return res.redirect("/cart");
    });
});

router.post("/update", (req, res) => {
    console.log(req.body);
    if (!(req.user && req.body.stocks && req.body.quantities)) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request"
        });
    }
    let updateValue: [string, number][] = _.zip(req.body.stocks, req.body.quantities);
    console.log(updateValue);
    Observable.forkJoin(updateValue.map(value => {
        console.log(value);
        return OrderManager.getInstance().updateQuantity(req.user.id, value[0], value[1]);
    })).subscribe(_ => {
    }, err => {
        return res.status(500).send(err);
    }, () => {
        return res.status(200).send({
            msg: "OK"
        });
    });
});

router.get("/addToCart", (req, res) => {
    if (!(req.user && req.query.id)) {
        return res.redirect("/");
    }
    OrderManager.getInstance().checkExistOrder(req.user.id, req.query.id).flatMap(isExist => {
        if (isExist) {
            return OrderManager.getInstance().incrementQuantity(req.user.id, req.query.id);
        } else {
            let order = new Order({
                userID: req.user.id,
                stockID: req.query.id,
                quantity: 1
            });
            return OrderManager.getInstance().add(order);
        }
    }).subscribe(_ => {
        return res.redirect("/");
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