const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs'); 
const router = express.Router();

// Import configs
const transporter = require('../config/email'); 
const db = require('../config/db'); 

// ---------------- SIGNUP ----------------
router.post('/signup', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = 'customer';

    const [result] = await db.query(
      'INSERT INTO UserDb (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'Email or username already exists' });
    } else {
      console.error("Signup Error:", err);
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// ---------------- LOGIN ----------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM UserDb WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Optional: Dito ka magse-set ng cookie kung gusto mo sa future
    // res.cookie('token', 'your_jwt_token', { httpOnly: true, secure: true });

    const { password: pw, ...userData } = user;
    res.json({ message: 'Login successful', user: userData });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------- LOGOUT (ADDED) ----------------
// Ito ang hinahanap ng AuthContext.jsx mo
router.post('/logout', (req, res) => {
    // Kung may cookies ka sa future, dito mo buburahin:
    // res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
});

// ---------------- FORGOT PASSWORD ----------------
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const [users] = await db.query('SELECT * FROM UserDb WHERE email = ?', [email]);
    const user = users[0];

    if (!user) {
      console.log("Forgot Password: User not found for email:", email);
      return res.status(200).json({ message: 'Reset link sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    console.log("Updating user token for ID:", user.id);

    await db.query(
      'UPDATE UserDb SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE id = ?',
      [hashedToken, expires, user.id]
    );

    // FIX: Dynamic URL para sa Deployment
    // Kapag nasa Render ka na, babasahin niya ang process.env.FRONTEND_URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetURL = `${frontendUrl}/reset-password?token=${token}`; 

    console.log("Attempting to send email to:", user.email);

    await transporter.sendMail({
      from: `"La Piscina" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your La Piscina account.</p>
          <p>Click the button below to set a new password (link expires in 15 minutes):</p>
          <a href="${resetURL}" target="_blank" style="background-color: #F57C00; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">Reset Password</a>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    });

    console.log("Email sent successfully");
    res.status(200).json({ message: 'Reset link sent.' });

  } catch (err) {
    console.error("Forgot Password Error:", err);
    if (err.code === 'ER_BAD_FIELD_ERROR') {
        console.error("POSSIBLE CAUSE: Missing columns in UserDb.");
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------- RESET PASSWORD ----------------
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;
    
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const [users] = await db.query(
      'SELECT * FROM UserDb WHERE resetPasswordToken = ? AND resetPasswordExpires > NOW()',
      [hashedToken]
    );
    const user = users[0];

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.query(
      'UPDATE UserDb SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.status(200).json({ message: 'Password reset successful.' });

  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;