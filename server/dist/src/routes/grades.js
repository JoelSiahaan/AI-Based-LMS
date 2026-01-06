"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.json({ message: 'List grades endpoint - to be implemented' });
});
router.get('/gpa', (req, res) => {
    res.json({ message: 'Calculate GPA endpoint - to be implemented' });
});
exports.default = router;
//# sourceMappingURL=grades.js.map