const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, phone, role, status, created_at FROM drivers'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, phone, role, status FROM drivers WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Chauffeur introuvable' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.create = async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO drivers (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashed, phone || null, role || 'driver']
    );
    res.status(201).json({ message: 'Chauffeur créé', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.update = async (req, res) => {
  const { name, email, phone, status } = req.body;
  try {
    await db.query(
      'UPDATE drivers SET name=?, email=?, phone=?, status=? WHERE id=?',
      [name, email, phone || null, status, req.params.id]
    );
    res.json({ message: 'Chauffeur mis à jour' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM drivers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Chauffeur supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};