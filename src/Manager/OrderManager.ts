import * as DataStore from "nedb";
import { join } from "path";
import { Observable } from "rx";
import { StockManager } from "./StockManager";

export class OrderManager {

    private static instance: OrderManager;

    private db: DataStore;

    private constructor() {
        this.db = new DataStore({ filename: join(__dirname, "../database/orders.db"), autoload: true });
    }

    static getInstance() {
        if (!OrderManager.instance) {
            OrderManager.instance = new OrderManager();
        }
        return OrderManager.instance;
    }

    add(order: Order): Observable<boolean> {
        return Observable.create(observer => {
            this.db.insert(order.getInterface(), (err, document) => {
                if (err) observer.onError(err);
                observer.onNext(true);
                observer.onCompleted();
            });
        });
    }

    checkExistOrder(userID: string, stockID: string): Observable<boolean> {
        return Observable.create(observer => {
            this.db.findOne({
                userID: userID,
                stockID: stockID
            }, {}, (err, document) => {
                if (err) observer.onError(err);
                if (document !== null) observer.onNext(true);
                else observer.onNext(false);
                observer.onCompleted();
            });
        });
    }

    findUserOrder(id: string): Observable<Order[]> {
        return Observable.create(observer => {
            this.db.find({
                userID: id
            }).exec((err, document) => {
                if (err) observer.onError(err);
                observer.onNext(document.map(doc => new Order(doc as OrderInterface)));
                observer.onCompleted();
            });
        });
    }

    find(id: string): Observable<Order> {
        return Observable.create(observer => {
            this.db.findOne({
                _id: id
            }, (err, document) => {
                if (err) observer.onError(err);
                observer.onNext(new Order(document as OrderInterface));
                observer.onCompleted()
            });
        });
    }

    findByUserID(userID: string, stockID: string): Observable<Order> {
        return Observable.create(observer => {
            this.db.findOne({
                userID: userID,
                stockID: stockID
            }, (err, document) => {
                if (err) observer.onError(err);
                observer.onNext(new Order(document as OrderInterface));
                observer.onCompleted();
            });
        });
    }

    findAll(): Observable<Order[]> {
        return Observable.create(observer => {
            this.db.find({}).exec((err, document) => {
                if (err) observer.onError(err);
                observer.onNext(document.map(doc => new Order(doc as OrderInterface)));
                observer.onCompleted();
            });
        });
    }

    delete(stockID: string, userID: string): Observable<number> {
        return Observable.create(observer => {
            this.db.remove({
                stockID: stockID,
                userID: userID
            }, {}, (err, number) => {
                if (err) observer.onError(err);
                observer.onNext(number);
                observer.onCompleted();
            });
        });
    }

    updateQuantity(userID: string, stockID: string, quantity: number): Observable<boolean> {
        return Observable.create(observer => {
            this.db.update({
                userID: userID,
                stockID: stockID
            }, {
                    $set: {
                        quantity: quantity
                    }
                }, {
                }, (err, numberOfUpdate) => {
                    if (err) observer.onError(err);
                    observer.onNext(true);
                    observer.onCompleted();
                }
            );
        });
    }

    incrementQuantity(userID: string, stockID: string): Observable<boolean> {
        return this.findByUserID(userID, stockID).flatMap(order => {
            return this.updateQuantity(userID, stockID, order.getQuantity() + 1);
        });
    }
}

interface OrderInterface {
    _id?: string,
    userID: string,
    stockID: string,
    quantity: number
}

export interface CartInterface {
    imgURL: string,
    name: string,
    price: number,
    quantity: number,
    stockID: string
}

export class Order {

    private order: OrderInterface;

    constructor(order: OrderInterface) {
        this.order = order;
    }

    getInterface(): OrderInterface {
        return this.order;
    }

    getID(): string {
        return this.order._id;
    }

    getQuantity(): number {
        return this.order.quantity
    }

    getCartInterface(): Observable<CartInterface> {
        return StockManager.getInstance().find(this.order.stockID).map(stock => {
            return {
                imgURL: stock.getInterface().imgURL,
                name: stock.getInterface().name,
                price: stock.getInterface().price,
                quantity: this.order.quantity,
                stockID: this.order.stockID
            }
        });
    }
}