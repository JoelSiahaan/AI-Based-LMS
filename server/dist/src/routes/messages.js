"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.json({ message: 'List messages endpoint - to be implemented' });
});
router.post('/', (req, res) => {
    res.json({ message: 'Send message endpoint - to be implemented' });
});
exports.default = router;
//# sourceMappingURL=messages.js.map