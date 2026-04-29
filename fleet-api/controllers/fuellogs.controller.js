const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT fl.*, v.plate, d.name as driver_name
      FROM fuel_logs fl
      JOIN vehicles v ON fl.vehicle_id = v.id
      LEFT JOIN drivers d ON fl.driver_id = d.id
      ORDER BY fl.logged_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.getByVehicle = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM fuel_logs WHERE vehicle_id = ? ORDER BY logged_at DESC',
      [req.params.vehicle_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.add = async (req, res) => {
  const { vehicle_id, driver_id, quantity, note } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO fuel_logs (vehicle_id, driver_id, quantity, note) VALUES (?, ?, ?, ?)',
      [vehicle_id, driver_id || null, quantity, note || null]
    );
    res.status(201).json({ message: 'Carburant enregistré', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM fuel_logs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Entrée supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.stats = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT vehicle_id, v.plate,
             SUM(quantity) as total,
             COUNT(*) as entries,
             MAX(logged_at) as last_log
      FROM fuel_logs fl
      JOIN vehicles v ON fl.vehicle_id = v.id
      GROUP BY vehicle_id, v.plate
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};