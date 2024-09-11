"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var mongoose_1 = __importDefault(require("mongoose"));
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var app = (0, express_1.default)();
var port = process.env.PORT || 3003;
mongoose_1.default.connect(process.env.MONGODB_URL)
    .then(function () { return console.log('Connected to MongoDB'); })
    .catch(function (err) { return console.error('Failed to connect to MongoDB', err); });
app.listen(port, function () {
    console.log("App is listening on ".concat(port));
});
//# sourceMappingURL=index.js.map