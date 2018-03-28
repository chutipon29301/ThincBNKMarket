import { Router } from "express";
import { User, UserManager } from "./Manager/UserManager";

export const router = Router();

router.post("/add", (req, res) => {
    if (!(req.body.name && req.body.email)) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request"
        });
    }
    let newUser = new User({
        _id: req.body.email,
        name: req.body.name
    });
    UserManager.getInstance().add(newUser).subscribe(isSuccess => {
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
    if (!req.body.email) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request"
        });
    }
    UserManager.getInstance().find(req.body.email).subscribe(user => {
        return res.status(200).send(user);
    });
});

router.post("/delete", (req, res) => {
    if (!req.body.email) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request"
        });
    }
    UserManager.getInstance().delete(req.body.email).subscribe(_ => {
        return res.status(200).send({
            msg: "OK"
        });
    });
});

router.post("/all", (req, res) => {
    UserManager.getInstance().findAll().subscribe(users => {
        return res.status(200).send({
            users: users
        });
    });
});