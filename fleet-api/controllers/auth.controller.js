const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { name, password, role } = req.body;
  const email = (req.body.email || '').trim().toLowerCase();
  try {
    const [existing] = await db.query('SELECT id FROM drivers WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ message: 'Email déjà utilisé' });

    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO drivers (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashed, role || 'driver']
    );
    res.status(201).json({ message: 'Compte créé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.login = async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';
  try {
    const [rows] = await db.query('SELECT * FROM drivers WHERE LOWER(email) = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ message: 'Email incorrect' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Mot de passe incorrect' });

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
