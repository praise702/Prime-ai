/* Bounded arithmetic evaluator. It deliberately never executes input as code. */
function normalize(message) {
    let text = String(message || "").toLowerCase().trim().replace(/,/g, "");
    const percent = text.match(/^(?:what is |calculate |solve )?(\d+(?:\.\d+)?)\s*%\s+of\s+(\d+(?:\.\d+)?)\??$/);
    if (percent) return String(Number(percent[1]) * Number(percent[2]) / 100);
    text = text.replace(/^(?:what is|calculate|solve|find|answer|how much is|please|can you|tell me)\s+/g, "")
        .replace(/square root of\s*([\d.]+)/g, "sqrt($1)")
        .replace(/([\d.]+)\s+(?:squared|square)\b/g, "($1^2)")
        .replace(/multiplied by|multiply by|times|\bx\b/g, "*")
        .replace(/divided by|divide by|over/g, "/")
        .replace(/plus|\badd\b/g, "+")
        .replace(/minus|\bsubtract\b/g, "-")
        .replace(/\?+$/g, "")
        // A trailing operator is a common accidental keystroke. Removing only
        // operators at the very end keeps the evaluator strict and safe while
        // making inputs such as "558+84+" behave naturally.
        .replace(/[+*/^]+$/g, "")
        .trim();
    return text;
}

function tokenize(expression) {
    const tokens = expression.match(/sqrt|\d*\.\d+|\d+|[()+\-*/^]/g) || [];
    return tokens.join("") === expression.replace(/\s+/g, "") ? tokens : null;
}

function evaluate(expression) {
    const tokens = tokenize(expression);
    if (!tokens || !tokens.length || tokens.length > 200) return null;
    let position = 0;
    function primary() {
        const token = tokens[position++];
        if (token === "+") return primary();
        if (token === "-") { const value = primary(); return value === null ? null : -value; }
        if (token === "sqrt") { if (tokens[position++] !== "(") return null; const value = addSubtract(); if (tokens[position++] !== ")" || value === null || value < 0) return null; return Math.sqrt(value); }
        if (token === "(") { const value = addSubtract(); return tokens[position++] === ")" ? value : null; }
        return /^\d*\.?\d+$/.test(token || "") ? Number(token) : null;
    }
    function power() { let value = primary(); while (tokens[position] === "^") { position++; const right = power(); if (value === null || right === null || Math.abs(right) > 1000) return null; value = value ** right; } return value; }
    function multiplyDivide() { let value = power(); while (["*", "/"].includes(tokens[position])) { const operator = tokens[position++]; const right = power(); if (value === null || right === null || (operator === "/" && right === 0)) return null; value = operator === "*" ? value * right : value / right; } return value; }
    function addSubtract() { let value = multiplyDivide(); while (["+", "-"].includes(tokens[position])) { const operator = tokens[position++]; const right = multiplyDivide(); if (value === null || right === null) return null; value = operator === "+" ? value + right : value - right; } return value; }
    const result = addSubtract();
    return position === tokens.length && Number.isFinite(result) ? Number(result.toFixed(10)) : null;
}

function calculate(message) { try { return evaluate(normalize(message)); } catch { return null; } }
function isMathExpression(message) { return calculate(message) !== null; }
module.exports = { calculate, isMathExpression, normalize, evaluate };
