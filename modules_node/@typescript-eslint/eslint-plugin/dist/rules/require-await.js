"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const experimental_utils_1 = require("@typescript-eslint/experimental-utils");
const tsutils = __importStar(require("tsutils"));
const util = __importStar(require("../util"));
exports.default = util.createRule({
    name: 'require-await',
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow async functions which have no `await` expression',
            category: 'Best Practices',
            recommended: 'error',
            requiresTypeChecking: true,
            extendsBaseRule: true,
        },
        schema: [],
        messages: {
            missingAwait: "{{name}} has no 'await' expression.",
        },
    },
    defaultOptions: [],
    create(context) {
        const parserServices = util.getParserServices(context);
        const checker = parserServices.program.getTypeChecker();
        const sourceCode = context.getSourceCode();
        let scopeInfo = null;
        /**
         * Push the scope info object to the stack.
         */
        function enterFunction(node) {
            scopeInfo = {
                upper: scopeInfo,
                hasAwait: false,
                hasAsync: node.async,
            };
        }
        /**
         * Pop the top scope info object from the stack.
         * Also, it reports the function if needed.
         */
        function exitFunction(node) {
            /* istanbul ignore if */ if (!scopeInfo) {
                // this shouldn't ever happen, as we have to exit a function after we enter it
                return;
            }
            if (node.async && !scopeInfo.hasAwait && !isEmptyFunction(node)) {
                context.report({
                    node,
                    loc: getFunctionHeadLoc(node, sourceCode),
                    messageId: 'missingAwait',
                    data: {
                        name: util.upperCaseFirst(util.getFunctionNameWithKind(node)),
                    },
                });
            }
            scopeInfo = scopeInfo.upper;
        }
        /**
         * Checks if the node returns a thenable type
         */
        function isThenableType(node) {
            const type = checker.getTypeAtLocation(node);
            return tsutils.isThenableType(checker, node, type);
        }
        /**
         * Marks the current scope as having an await
         */
        function markAsHasAwait() {
            if (!scopeInfo) {
                return;
            }
            scopeInfo.hasAwait = true;
        }
        return {
            FunctionDeclaration: enterFunction,
            FunctionExpression: enterFunction,
            ArrowFunctionExpression: enterFunction,
            'FunctionDeclaration:exit': exitFunction,
            'FunctionExpression:exit': exitFunction,
            'ArrowFunctionExpression:exit': exitFunction,
            AwaitExpression: markAsHasAwait,
            'ForOfStatement[await = true]': markAsHasAwait,
            // check body-less async arrow function.
            // ignore `async () => await foo` because it's obviously correct
            'ArrowFunctionExpression[async = true] > :not(BlockStatement, AwaitExpression)'(node) {
                const expression = parserServices.esTreeNodeToTSNodeMap.get(node);
                if (expression && isThenableType(expression)) {
                    markAsHasAwait();
                }
            },
            ReturnStatement(node) {
                // short circuit early to avoid unnecessary type checks
                if (!scopeInfo || scopeInfo.hasAwait || !scopeInfo.hasAsync) {
                    return;
                }
                const { expression } = parserServices.esTreeNodeToTSNodeMap.get(node);
                if (expression && isThenableType(expression)) {
                    markAsHasAwait();
                }
            },
        };
    },
});
function isEmptyFunction(node) {
    var _a;
    return (((_a = node.body) === null || _a === void 0 ? void 0 : _a.type) === experimental_utils_1.AST_NODE_TYPES.BlockStatement &&
        node.body.body.length === 0);
}
// https://github.com/eslint/eslint/blob/03a69dbe86d5b5768a310105416ae726822e3c1c/lib/rules/utils/ast-utils.js#L382-L392
/**
 * Gets the `(` token of the given function node.
 */
function getOpeningParenOfParams(node, sourceCode) {
    return util.nullThrows(node.id
        ? sourceCode.getTokenAfter(node.id, util.isOpeningParenToken)
        : sourceCode.getFirstToken(node, util.isOpeningParenToken), util.NullThrowsReasons.MissingToken('(', node.type));
}
// https://github.com/eslint/eslint/blob/03a69dbe86d5b5768a310105416ae726822e3c1c/lib/rules/utils/ast-utils.js#L1220-L1242
/**
 * Gets the location of the given function node for reporting.
 */
function getFunctionHeadLoc(node, sourceCode) {
    const parent = util.nullThrows(node.parent, util.NullThrowsReasons.MissingParent);
    let start = null;
    let end = null;
    if (node.type === experimental_utils_1.AST_NODE_TYPES.ArrowFunctionExpression) {
        const arrowToken = util.nullThrows(sourceCode.getTokenBefore(node.body, util.isArrowToken), util.NullThrowsReasons.MissingToken('=>', node.type));
        start = arrowToken.loc.start;
        end = arrowToken.loc.end;
    }
    else if (parent.type === experimental_utils_1.AST_NODE_TYPES.Property ||
        parent.type === experimental_utils_1.AST_NODE_TYPES.MethodDefinition) {
        start = parent.loc.start;
        end = getOpeningParenOfParams(node, sourceCode).loc.start;
    }
    else {
        start = node.loc.start;
        end = getOpeningParenOfParams(node, sourceCode).loc.start;
    }
    return {
        start,
        end,
    };
}
//# sourceMappingURL=require-await.js.map