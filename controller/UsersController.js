const con = require('../config/db')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

// ADMIN REGISTER
exports.adminRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body
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
        const { email, password } = req.body
        const result = await con.query('SELECT * FROM users WHERE email = $1', [email])
        const user = result.rows[0]
        if (!user) {
            return res.status(404).json({ message: "Admin not found" })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" })
        }
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' })
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