const userModel = require("./userModel");
const { createSession, setSessionCookie, clearSessionCookie, extractToken, destroySession } = require("../middleware/auth");

function fail(res, status, error) { return res.status(status).json({ success: false, error }); }

exports.signup = (req, res) => {
    try {
        const user = userModel.createUser(req.body || {});
        const token = createSession(user.id);
        setSessionCookie(res, token);
        return res.status(201).json({ success: true, user });
    } catch (error) {
        const status = ["EMAIL_EXISTS", "INVALID_EMAIL", "INVALID_NAME", "INVALID_PASSWORD"].includes(error.code) ? 400 : 500;
        return fail(res, status, error.message || "Account creation failed.");
    }
};
exports.login = (req, res) => {
    const email = userModel.normalizeEmail(req.body?.email);
    const password = req.body?.password;
    const user = userModel.findByEmail(email);
    if (!user || !userModel.verifyPassword(password, user)) return fail(res, 401, "Invalid email or password.");
    const token = createSession(user.id);
    setSessionCookie(res, token);
    return res.json({ success: true, user: userModel.sanitize(user) });
};
exports.me = (req, res) => res.json({ success: true, user: req.user });
exports.logout = (req, res) => { destroySession(extractToken(req)); clearSessionCookie(res); res.json({ success: true }); };
