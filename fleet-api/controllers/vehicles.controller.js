const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT v.*, d.name as driver_name 
      FROM vehicles v
      LEFT JOIN drivers d ON v.driver_id = d.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Véhicule introuvable' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.create = async (req, res) => {
  const { plate, brand, model, driver_id } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO vehicles (plate, brand, model, driver_id) VALUES (?, ?, ?, ?)',
      [plate, brand, model, driver_id || null]
    );
    res.status(201).json({ message: 'Véhicule créé', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.update = async (req, res) => {
  const { plate, brand, model, driver_id, status } = req.body;
  try {
    await db.query(
      'UPDATE vehicles SET plate=?, brand=?, model=?, driver_id=?, status=? WHERE id=?',
      [plate, brand, model, driver_id || null, status || 'offline', req.params.id]
    );
    res.json({ message: 'Véhicule mis à jour' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM vehicles WHERE id = ?', [req.params.id]);
    res.json({ message: 'Véhicule supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.assign = async (req, res) => {
  const { driver_id } = req.body;
  try {
    // Règle métier : un chauffeur actif sur un seul véhicule
    if (driver_id) {
      await db.query(
        'UPDATE vehicles SET driver_id = NULL WHERE driver_id = ?',
        [driver_id]
      );
    }
    // On met à jour SEULEMENT driver_id, pas le status
    await db.query(
      'UPDATE vehicles SET driver_id = ? WHERE id = ?',
      [driver_id || null, req.params.id]
    );
    res.json({ message: 'Affectation mise à jour' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.getOffline = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT v.*, d.name as driver_name,
             MAX(p.recorded_at) as last_position
      FROM vehicles v
      LEFT JOIN drivers d ON v.driver_id = d.id
      LEFT JOIN vehicle_positions p ON p.vehicle_id = v.id
      GROUP BY v.id
      HAVING last_position IS NULL 
         OR last_position < DATE_SUB(NOW(), INTERVAL 15 MINUTE)
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
