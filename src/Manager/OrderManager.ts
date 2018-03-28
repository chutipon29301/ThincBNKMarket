import * as DataStore from "nedb";
import { join } from "path";
import { Observable } from "rx";
import { StockManager } from "./StockManager";

export class OrderManager {

    private static instance: OrderManager;

    private db: DataStore;

    private constructor(){
        this.db = new DataStore({ filename: join(__dirname, "../database/orders.db"), autoload: true });
    }

    static getInstance() {
        if (!OrderManager.instance) {
            OrderManager.instance = new OrderManager();
        }
        return OrderManager.instance;
    }

    add(order: Order): Observable<boolean>{
        return Observable.create(observer => {
            this.db.insert(order.getInterface(), (err, document) => {
                if (err) observer.onError(err);
                observer.onNext(true);
                observer.onCompleted();
            });
        });
    }

    findUserOrder(id: string): Observable<Order[]>{
        return Observable.create(observer => {
            this.db.find({
                userID: id
            }).exec((err, document) => {
                if(err) observer.onError(err);
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

    findAll(): Observable<Order[]> {
        return Observable.create(observer => {
            this.db.find({}).exec((err, document) => {
                if (err) observer.onError(err);
                observer.onNext(document.map(doc => new Order(doc as OrderInterface)));
                observer.onCompleted();
            });
        });
    }

    delete(id: string): Observable<number> {
        return Observable.create(observer => {
            this.db.remove({
                _id: id
            }, {}, (err, number) => {
                if (err) observer.onError(err);
                observer.onNext(number);
                observer.onCompleted();
            });
        });
    }
}

interface OrderInterface {
    _id?: string,
    userID: string,
    stockID: string,
    quantity: number
}

interface CartInterface {
    imgURL: string,
    name: string,
    price: number,
    quantity: number
}

export class Order {

    private order: OrderInterface;

    constructor(order: OrderInterface) {
        this.order = order;
    }

    getInterface(): OrderInterface {
        return this.order;
    }
    
    getID(): string{
        return this.order._id;
    }

    getCartInterface(): Observable<CartInterface>{
        console.log("IN");
        return StockManager.getInstance().find(this.order.stockID).map(stock => {
            console.log(stock);
            return {
                imgURL: stock.getInterface().imgURL,
                name: stock.getInterface().name,
                price: stock.getInterface().price,
                quantity: this.order.quantity
            }
        });
    }
}