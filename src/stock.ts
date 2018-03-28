// import { Router } from "express";
// import { Stock, StockManager } from "./Manager/StockManager";

// export const router = Router();

// router.post("/add", (req, res) => {
//     if (!(req.body.name && req.body.email)) {
//         return res.status(400).send({
//             err: 0,
//             msg: "Bad Request"
//         });
//     }
//     let newStock = new Stock({
//         _id: req.body.email,
//         name: req.body.name
//     });
//     StockManager.getInstance().add(newStock).subscribe(isSuccess => {
//         if (isSuccess) {
//             return res.status(200).send({
//                 msg: "Ok"
//             });
//         } else {
//             return res.status(202).send({
//                 msg: "No user added"
//             });
//         }
//     }, err => {
//         return res.status(500).send(err);
//     });
// });

// router.post("/get", (req, res) => {
//     if (!req.body.email) {
//         return res.status(400).send({
//             err: 0,
//             msg: "Bad Request"
//         });
//     }
//     StockManager.getInstance().find(req.body.email).subscribe(user => {
//         return res.status(200).send(user);
//     });
// });

// router.post("/delete", (req, res) => {
//     if (!req.body.email) {
//         return res.status(400).send({
//             err: 0,
//             msg: "Bad Request"
//         });
//     }
//     StockManager.getInstance().delete(req.body.email).subscribe(_ => {
//         return res.status(200).send({
//             msg: "OK"
//         });
//     });
// });

// router.post("/all", (req, res) => {
//     StockManager.getInstance().findAll().subscribe(users => {
//         return res.status(200).send({
//             users: users
//         });
//     });
// });