define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TreeMark = exports.TreeNodeType = void 0;
    var TreeNodeType;
    (function (TreeNodeType) {
        TreeNodeType[TreeNodeType["FLOW"] = 0] = "FLOW";
        TreeNodeType[TreeNodeType["LEAF"] = 1] = "LEAF";
    })(TreeNodeType = exports.TreeNodeType || (exports.TreeNodeType = {}));
    var TreeMark;
    (function (TreeMark) {
        TreeMark["HIGHLIGHT"] = "highlight";
        TreeMark["RIGHT"] = "right";
        TreeMark["WRONG"] = "wrong";
        TreeMark["NONE"] = "none";
    })(TreeMark = exports.TreeMark || (exports.TreeMark = {}));
});
//# sourceMappingURL=classifier.js.map