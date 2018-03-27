import * as express from "express";
import * as morgan from "morgan";
import { urlencoded, json } from "body-parser";
import { config } from "dotenv";

config();

const app = express();

app.use(morgan("common"));
app.use(express.static("./public"));

app.use(urlencoded({
    extended: true
}));
app.use(json());

app.listen(process.env.PORT, () => {
    console.log('Listening on port ' + process.env.PORT);
});

