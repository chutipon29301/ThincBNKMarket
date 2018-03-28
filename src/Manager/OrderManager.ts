import * as DataStore from "nedb";
import { join } from "path";
import { Observable } from "rx";

export class OrderManager {

    private static instance: OrderManager;

    private db: DataStore;

    private constructor(){
        this.db = new DataStore({ filename: join(__dirname, "../database/order.db"), autoload: true });
    }

    static getInstance() {
        if (!OrderManager.instance) {
            OrderManager.instance = new OrderManager();
        }
        return OrderManager.instance;
    }

    isExistInDB(order: Order): Observable<boolean> {
        return Observable.create(observer => {
            this.db.findOne({
                _id: order.getID()
            }, (err, document) => {
                if (err) observer.onError(err);
                if (!document) observer.onNext(false);
                else observer.onNext(true);
                observer.onCompleted();
            });
        });
    }

    add(order: Order): Observable<boolean>{
        return this.isExistInDB(order).flatMap(isExist => {
            if (!isExist) {
                return Observable.create(observer => {
                    this.db.insert(order.getInterface(), (err, document) => {
                        if (err) observer.onError(err);
                        observer.onNext(true);
                        observer.onCompleted();
                    });
                });
            } else {
                return Observable.create(observer => {
                    observer.onNext(false);
                    observer.onCompleted();
                });
            }
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

    delete(order: Order): Observable<number> {
        return Observable.create(observer => {
            this.db.remove({
                _id: order.getID()
            }, {}, (err, number) => {
                if (err) observer.onError(err);
                observer.onNext(number);
                observer.onCompleted();
            });
        });
    }
}

interface OrderInterface {
    _id: string,
    imgURL: string,
    name: string,
    price: number
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

}