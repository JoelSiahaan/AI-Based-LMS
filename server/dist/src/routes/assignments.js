"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.json({ message: 'List assignments endpoint - to be implemented' });
});
router.post('/:id/submit', (req, res) => {
    res.json({ message: 'Submit assignment endpoint - to be implemented' });
});
exports.default = router;
//# sourceMappingURL=assignments.js.map