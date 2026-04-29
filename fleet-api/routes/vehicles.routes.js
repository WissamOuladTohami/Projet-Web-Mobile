const router = require('express').Router();
const ctrl = require('../controllers/vehicles.controller');
const auth = require('../middleware/authMiddleware');

router.get('/offline',    auth, ctrl.getOffline);
router.get('/',           auth, ctrl.getAll);
router.get('/:id',        auth, ctrl.getOne);
router.post('/',          auth, ctrl.create);
router.put('/:id/assign', auth, ctrl.assign);
router.put('/:id',        auth, ctrl.update);
router.delete('/:id',     auth, ctrl.remove);

module.exports = router;