const router = require('express').Router();
const ctrl = require('../controllers/positions.controller');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, ctrl.getAllPositions);
router.get('/all-last', auth, ctrl.getAllVehiclesLastPositions);
router.get('/history/:vehicleId', auth, ctrl.getPositionHistory);
router.get('/:vehicleId/history', auth, ctrl.getPositionHistory);
router.get('/:vehicleId', auth, ctrl.getPositionByVehicle);
router.post('/', auth, ctrl.createPosition);

module.exports = router;
