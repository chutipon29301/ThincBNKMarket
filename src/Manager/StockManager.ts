import * as DataStore from "nedb";
import { join } from "path";
import { Observable } from "rx";

export class StockManager {

    private static instance: StockManager;

    private db: DataStore;

    private constructor(){
        this.db = new DataStore({ filename: join(__dirname, "../database/stock.db"), autoload: true });
    }

    static getInstance() {
        if (!StockManager.instance) {
            StockManager.instance = new StockManager();
        }
        return StockManager.instance;
    }

    isExistInDB(stock: Stock): Observable<boolean> {
        return Observable.create(observer => {
            this.db.findOne({
                _id: stock.getID()
            }, (err, document) => {
                if (err) observer.onError(err);
                if (!document) observer.onNext(false);
                else observer.onNext(true);
                observer.onCompleted();
            });
        });
    }

    add(stock: Stock): Observable<boolean>{
        return this.isExistInDB(stock).flatMap(isExist => {
            if (!isExist) {
                return Observable.create(observer => {
                    this.db.insert(stock.getInterface(), (err, document) => {
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

    find(id: string): Observable<Stock> {
        return Observable.create(observer => {
            this.db.findOne({
                _id: id
            }, (err, document) => {
                if (err) observer.onError(err);
                observer.onNext(new Stock(document as StockInterface));
                observer.onCompleted()
            });
        });
    }

    findAll(): Observable<Stock[]> {
        return Observable.create(observer => {
            this.db.find({}).exec((err, document) => {
                if (err) observer.onError(err);
                observer.onNext(document.map(doc => new Stock(doc as StockInterface)));
                observer.onCompleted();
            });
        });
    }

    delete(stock: Stock): Observable<number> {
        return Observable.create(observer => {
            this.db.remove({
                _id: stock.getID()
            }, {}, (err, number) => {
                if (err) observer.onError(err);
                observer.onNext(number);
                observer.onCompleted();
            });
        });
    }
}

interface StockInterface {
    _id: string,
    imgURL: string,
    name: string,
    price: number
}

export class Stock {

    private stock: StockInterface;

    constructor(stock: StockInterface) {
        this.stock = stock;
    }

    getInterface(): StockInterface {
        return this.stock;
    }
    
    getID(): string{
        return this.stock._id;
    }

}