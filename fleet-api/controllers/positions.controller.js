// fleet-api/controllers/positions.controller.js
const db = require("../config/db");

/**
 * GET /api/positions
 * Retourne la dernière position connue de chaque véhicule.
 * Appelé toutes les 5s par le frontend.
 */
const getAllPositions = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        p.id,
        p.vehicle_id,
        p.latitude,
        p.longitude,
        p.recorded_at,
        p.recorded_at AS recorded_at,
        v.plate,
        v.brand,
        v.model,
        v.status
      FROM vehicle_positions p
      INNER JOIN (
        SELECT vehicle_id, MAX(recorded_at) AS latest
        FROM vehicle_positions
        GROUP BY vehicle_id
      ) AS latest_pos
        ON p.vehicle_id = latest_pos.vehicle_id
        AND p.recorded_at = latest_pos.latest
      LEFT JOIN vehicles v ON p.vehicle_id = v.id
      ORDER BY p.recorded_at DESC
    `);

    return res.json(rows);
  } catch (error) {
    console.error("[positions.controller] getAllPositions:", error.message);
    if (error?.code === "ER_NO_SUCH_TABLE") {
      return res.status(500).json({
        message: "La table `vehicle_positions` n'existe pas dans la base de données.",
        error: error.message,
        hint: "Vérifiez que votre table s'appelle `vehicle_positions` (ou adaptez le code), puis relancez l'API.",
      });
    }
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

/**
 * GET /api/positions/all-last
 * Retourne TOUS les véhicules, avec leur dernière position si elle existe.
 */
const getAllVehiclesLastPositions = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        v.id AS vehicle_id,
        v.plate,
        v.brand,
        v.model,
        v.status,
        p.id,
        p.latitude,
        p.longitude,
        p.recorded_at,
        p.recorded_at AS recorded_at
      FROM vehicles v
      LEFT JOIN (
        SELECT p1.*
        FROM vehicle_positions p1
        INNER JOIN (
          SELECT vehicle_id, MAX(recorded_at) AS latest
          FROM vehicle_positions
          GROUP BY vehicle_id
        ) lp
          ON p1.vehicle_id = lp.vehicle_id
          AND p1.recorded_at = lp.latest
      ) p
        ON p.vehicle_id = v.id
      ORDER BY p.recorded_at DESC
    `);

    return res.json(rows);
  } catch (error) {
    console.error("[positions.controller] getAllVehiclesLastPositions:", error.message);
    if (error?.code === "ER_NO_SUCH_TABLE") {
      return res.status(500).json({
        message: "La table `vehicle_positions` n'existe pas dans la base de données.",
        error: error.message,
        hint: "Vérifiez que votre table s'appelle `vehicle_positions` (ou adaptez le code), puis relancez l'API.",
      });
    }
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

/**
 * GET /api/positions/:vehicleId
 * Dernière position d'un véhicule spécifique.
 */
const getPositionByVehicle = async (req, res) => {
  const { vehicleId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT
        p.*,
        p.recorded_at AS recorded_at,
        v.plate,
        v.brand,
        v.model,
        v.status
       FROM vehicle_positions p
       LEFT JOIN vehicles v ON p.vehicle_id = v.id
       WHERE p.vehicle_id = ?
       ORDER BY p.recorded_at DESC
       LIMIT 1`,
      [vehicleId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Aucune position trouvée pour ce véhicule" });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error("[positions.controller] getPositionByVehicle:", error.message);
    if (error?.code === "ER_NO_SUCH_TABLE") {
      return res.status(500).json({
        message: "La table `vehicle_positions` n'existe pas dans la base de données.",
        error: error.message,
        hint: "Vérifiez que votre table s'appelle `vehicle_positions` (ou adaptez le code), puis relancez l'API.",
      });
    }
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

/**
 * POST /api/positions
 * Enregistre une nouvelle position (envoyée par l'app Android).
 * Body: { vehicle_id, latitude, longitude, speed, heading, accuracy }
 */
const createPosition = async (req, res) => {
  const { vehicle_id, latitude, longitude, speed = 0, heading = 0, accuracy = null } = req.body;

  if (!vehicle_id || latitude === undefined || longitude === undefined) {
    return res.status(400).json({
      message: "vehicle_id, latitude et longitude sont requis",
    });
  }

  // Validation basique des coordonnées
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({ message: "Coordonnées GPS invalides" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO vehicle_positions (vehicle_id, latitude, longitude, recorded_at)
       VALUES (?, ?, ?, NOW())`,
      [vehicle_id, latitude, longitude]
    );

    // Mettre à jour le statut du véhicule si en mouvement
    if (speed > 0) {
      await db.query(
        `UPDATE vehicles SET status = 'active' WHERE id = ?`,
        [vehicle_id]
      );
    }

    const io = req.app.get("io");
    if (io) {
      io.emit("vehicle-update", {
        id: result.insertId,
        vehicle_id,
        latitude,
        longitude,
      });
    }

    return res.status(201).json({
      id: result.insertId,
      vehicle_id,
      latitude,
      longitude,
      message: "Position enregistrée",
    });
  } catch (error) {
    console.error("[positions.controller] createPosition:", error.message);
    if (error?.code === "ER_NO_SUCH_TABLE") {
      return res.status(500).json({
        message: "La table `vehicle_positions` n'existe pas dans la base de données.",
        error: error.message,
        hint: "Vérifiez que votre table s'appelle `vehicle_positions` (ou adaptez le code), puis relancez l'API.",
      });
    }
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

/**
 * GET /api/positions/:vehicleId/history
 * Historique des positions d'un véhicule (pour tracer la trajectoire).
 * Query params: ?limit=50&from=ISO_DATE&to=ISO_DATE
 */
const getPositionHistory = async (req, res) => {
  const { vehicleId } = req.params;
  const { limit = 50, from, to } = req.query;

  try {
    let query = `
      SELECT latitude, longitude, recorded_at
      , recorded_at AS recorded_at
      FROM vehicle_positions
      WHERE vehicle_id = ?
    `;
    const params = [vehicleId];

    if (from) {
      query += " AND recorded_at >= ?";
      params.push(from);
    }
    if (to) {
      query += " AND recorded_at <= ?";
      params.push(to);
    }

    query += " ORDER BY recorded_at DESC LIMIT ?";
    params.push(parseInt(limit, 10));

    const [rows] = await db.query(query, params);

    return res.json(rows.reverse()); // ordre chronologique
  } catch (error) {
    console.error("[positions.controller] getPositionHistory:", error.message);
    if (error?.code === "ER_NO_SUCH_TABLE") {
      return res.status(500).json({
        message: "La table `vehicle_positions` n'existe pas dans la base de données.",
        error: error.message,
        hint: "Vérifiez que votre table s'appelle `vehicle_positions` (ou adaptez le code), puis relancez l'API.",
      });
    }
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

module.exports = {
  getAllPositions,
  getAllVehiclesLastPositions,
  getPositionByVehicle,
  createPosition,
  getPositionHistory,
};
