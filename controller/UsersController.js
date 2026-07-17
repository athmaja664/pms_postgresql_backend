const con = require('../config/db')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const transporter = require('../config/mailer')

// ADMIN REGISTER
exports.adminRegister = async (req, res) => {
    try {
        const name = req.body.name?.trim()
        const email = req.body.email?.trim().toLowerCase()
        const { password } = req.body
        const existing = await con.query('SELECT * FROM users WHERE email = $1', [email])
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: "Admin already exist" })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        await con.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
            [name, email, hashedPassword]
        )
        res.status(200).json({ message: "Admin registered successfully" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// ADMIN LOGIN
exports.adminLogin = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase()
        const { password } = req.body
        const result = await con.query('SELECT * FROM users WHERE email = $1', [email])
        const user = result.rows[0]
        if (!user) {
            return res.status(404).json({ message: "Admin not found" })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" })
        }
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' })
        res.status(200).json({ message: "Login successful", token, user })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// UPDATE ADMIN
exports.updateAdmin = async (req, res) => {
    try {
        const { name, email, currentPassword, newPassword } = req.body
        const result = await con.query('SELECT * FROM users WHERE id = $1', [req.payload])
        const admin = result.rows[0]
        if (!admin) {
            return res.status(400).json({ message: 'Admin not found' })
        }
        const isMatch = await bcrypt.compare(currentPassword, admin.password)
        if (!isMatch) {
            return res.status(400).json({ message: "current password is incorrect" })
        }
        const updatedName = name || admin.name
        const updatedEmail = email || admin.email
        const updatedPassword = newPassword ? await bcrypt.hash(newPassword, 10) : admin.password

        const updated = await con.query(
            'UPDATE users SET name=$1, email=$2, password=$3, updated_at=NOW() WHERE id=$4 RETURNING id, name, email',
            [updatedName, updatedEmail, updatedPassword, req.payload]
        )
        return res.status(200).json({ message: "Profile updated successfully", user: updated.rows[0] })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

//FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase()
        const result = await con.query('SELECT * FROM users WHERE email=$1', [email])
        const user = result.rows[0]
        if (!user) {
            return res.status(400).json({ message: "Admin not found" })
        }
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30min' })
        const expiry = new Date(Date.now() + 15 * 60 * 1000)
        await con.query('UPDATE users SET reset_token=$1,reset_token_expiry=$2 WHERE id=$3', [token, expiry, user.id])
        const resetLink = `http://localhost:5173/reset-password/${token}`

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: user.email,
            subject: "Reset Password",
            html: `
                <h2>Password Reset</h2> <br/>
                <p>Click the link below to reset your password.</p>
                <a href="${resetLink}">${resetLink}</a>
            `})
        return res.status(200).json({ message: "Reset the link successfully" })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

//RESET PASSWORD
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params
        const { newPassword } = req.body

        let decoded
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET)
        } catch (err) {
            return res.status(400).json({ message: "Reset link is invalid or expired" })
        }

        const result = await con.query('SELECT * FROM users WHERE id=$1', [decoded.id])
        const user = result.rows[0]
        if (!user) {
            return res.status(400).json({ message: "Admin not found" })
        }

        if (user.reset_token !== token || new Date(user.reset_token_expiry) < new Date()) {
            return res.status(400).json({ message: "Reset link is invalid or expired" })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await con.query(
            'UPDATE users SET password=$1, reset_token=NULL, reset_token_expiry=NULL, updated_at=NOW() WHERE id=$2',
            [hashedPassword, user.id]
        )

        return res.status(200).json({ message: "Password reset successfully" })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}