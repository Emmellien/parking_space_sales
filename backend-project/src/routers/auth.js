const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db.js');

const router = express.Router();


// PASSWORD VALIDATION FUNCTION
const validatePassword = (password) => {

  // minimum 8 chars
  // one uppercase
  // one lowercase
  // one number

  const strongPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  return strongPassword.test(password);
};


// REGISTER
router.post('/register', async (req, res) => {

  const { name, email, password } = req.body;

  try {

    // check empty
    if (!name || !email || !password) {
      return res.status(400).json({
        msg: 'All fields are required'
      });
    }

    // password validation
    if (!validatePassword(password)) {
      return res.status(400).json({
        msg: 'Password must contain uppercase, lowercase, number and 8 characters'
      });
    }

    // check email
    const [exists] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (exists.length > 0) {
      return res.status(400).json({
        msg: 'User already exists'
      });
    }

    // hash password
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // insert user
    await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    res.status(201).json({
      msg: 'User registered successfully'
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });
  }
});


// LOGIN
router.post('/login', async (req, res) => {

  const { email, password } = req.body;

  try {

    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({
        msg: 'Invalid credentials'
      });
    }

    const user = users[0];

    const isMatch =
      await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        msg: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;