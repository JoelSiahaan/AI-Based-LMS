"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const options = {
    hostname: 'localhost',
    port: process.env.PORT || 3001,
    path: '/health',
    method: 'GET',
    timeout: 3000,
};
const req = http_1.default.request(options, (res) => {
    if (res.statusCode === 200) {
        console.log('Health check passed');
        process.exit(0);
    }
    else {
        console.log(`Health check failed with status code: ${res.statusCode}`);
        process.exit(1);
    }
});
req.on('error', (error) => {
    console.log(`Health check failed with error: ${error.message}`);
    process.exit(1);
});
req.on('timeout', () => {
    console.log('Health check timed out');
    req.destroy();
    process.exit(1);
});
req.end();
//# sourceMappingURL=health-check.js.map