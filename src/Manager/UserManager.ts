import * as DataStore from "nedb";
import { join } from "path";
import { Observable } from "rx";

export class UserManager {
    private static instance: UserManager;

    private db: DataStore;

    private constructor() {
        this.db = new DataStore({ filename: join(__dirname, "../database/users.db"), autoload: true });
    }

    static getInstance() {
        if (!UserManager.instance) {
            UserManager.instance = new UserManager();
        }
        return UserManager.instance;
    }
    
    isExistInDB(user: User): Observable<boolean> {
        return Observable.create(observer => {
            this.db.findOne({
                _id: user.getEmail()
            }, (err, document) => {
                if (err) observer.onError(err);
                if (!document) observer.onNext(false);
                else observer.onNext(true);
                observer.onCompleted();
            });
        });
    }

    add(user: User): Observable<boolean> {
        return this.isExistInDB(user).flatMap(isExist => {
            if (!isExist) {
                return Observable.create(observer => {
                    this.db.insert(user.getInterface(), (err, document) => {
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


    find(email: string): Observable<User> {
        return Observable.create(observer => {
            this.db.findOne({
                _id: email
            }, (err, document) => {
                if (err) observer.onError(err);
                observer.onNext(new User(document as UserInterface));
                observer.onCompleted()
            });
        });
    }

    findAll(): Observable<User[]> {
        return Observable.create(observer => {
            this.db.find({}).exec((err, document) => {
                if (err) observer.onError(err);
                observer.onNext(document.map(doc => new User(doc as UserInterface)));
                observer.onCompleted();
            });
        });
    }

    delete(user: User): Observable<number> {
        return Observable.create(observer => {
            this.db.remove({
                _id: user.getEmail()
            }, {}, (err, number) => {
                if (err) observer.onError(err);
                observer.onNext(number);
                observer.onCompleted();
            });
        });
    }
}

interface UserInterface {
    _id: string,
    name: string
}

export class User {

    private user: UserInterface

    constructor(user: UserInterface) {
        this.user = user;
    }

    getInterface(): UserInterface {
        return this.user;
    }

    getEmail(): string {
        return this.user._id;
    }
}