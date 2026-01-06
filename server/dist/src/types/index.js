"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserType = exports.MessageType = exports.MaterialType = exports.NotificationType = void 0;
var NotificationType;
(function (NotificationType) {
    NotificationType["ASSIGNMENT_DUE"] = "ASSIGNMENT_DUE";
    NotificationType["GRADE_POSTED"] = "GRADE_POSTED";
    NotificationType["ANNOUNCEMENT"] = "ANNOUNCEMENT";
    NotificationType["MESSAGE_RECEIVED"] = "MESSAGE_RECEIVED";
    NotificationType["COURSE_UPDATE"] = "COURSE_UPDATE";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var MaterialType;
(function (MaterialType) {
    MaterialType["VIDEO"] = "VIDEO";
    MaterialType["DOCUMENT"] = "DOCUMENT";
    MaterialType["LINK"] = "LINK";
    MaterialType["INTERACTIVE"] = "INTERACTIVE";
    MaterialType["QUIZ"] = "QUIZ";
})(MaterialType || (exports.MaterialType = MaterialType = {}));
var MessageType;
(function (MessageType) {
    MessageType["DIRECT"] = "DIRECT";
    MessageType["FORUM"] = "FORUM";
    MessageType["ANNOUNCEMENT"] = "ANNOUNCEMENT";
})(MessageType || (exports.MessageType = MessageType = {}));
var UserType;
(function (UserType) {
    UserType["STUDENT"] = "STUDENT";
    UserType["TEACHER"] = "TEACHER";
    UserType["ADMIN"] = "ADMIN";
})(UserType || (exports.UserType = UserType = {}));
//# sourceMappingURL=index.js.map