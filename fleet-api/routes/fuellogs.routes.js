const router = require('express').Router();
const ctrl = require('../controllers/fuellogs.controller');
const auth = require('../middleware/authMiddleware');

router.get('/',                     auth, ctrl.getAll);
router.get('/stats',                auth, ctrl.stats);
router.get('/:vehicle_id',          auth, ctrl.getByVehicle);
router.post('/',                    auth, ctrl.add);
router.delete('/:id',               auth, ctrl.remove);

module.exports = router;