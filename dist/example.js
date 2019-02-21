"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const rxfeign_1 = require("./rxfeign");
let Example = class Example {
    constructor() { }
    get(id) { }
};
__decorate([
    rxfeign_1.Get(),
    __param(0, rxfeign_1.PathParam())
], Example.prototype, "get", null);
Example = __decorate([
    rxfeign_1.Client({
        url: "https://jsonplaceholder.typicode.com/posts",
        headers: {
            MIS: "HEADERS"
        },
    })
], Example);
const example = new Example();
example.get(1).subscribe(console.log, console.log);
