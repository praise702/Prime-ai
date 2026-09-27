/* A small explicit tool boundary for the active brain pipeline. */
const mathEngine = require("../mathematics/mathEngine");

const tools = Object.freeze({
    calculator: {
        validate: args => typeof args?.expression === "string" && args.expression.length <= 500,
        execute: args => {
            const result = mathEngine.calculate(args.expression);
            return result === null ? { ok: false, error: "Invalid arithmetic expression." } : { ok: true, result };
        }
    }
});

function execute(name, args) {
    const tool = Object.prototype.hasOwnProperty.call(tools, name) ? tools[name] : null;
    if (!tool || !tool.validate(args)) return { ok: false, error: "Tool request is not allowed." };
    try { return tool.execute(args); } catch { return { ok: false, error: "Tool execution failed." }; }
}

function allowedTools() { return Object.keys(tools); }
module.exports = { execute, allowedTools };
