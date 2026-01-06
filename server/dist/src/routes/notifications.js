"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.json({ message: 'List notifications endpoint - to be implemented' });
});
router.put('/:id/read', (req, res) => {
    res.json({ message: 'Mark notification as read endpoint - to be implemented' });
});
exports.default = router;
//# sourceMappingURL=notifications.js.map