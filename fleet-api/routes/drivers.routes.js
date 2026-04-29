const router = require('express').Router();
const ctrl = require('../controllers/drivers.controller');
const auth = require('../middleware/authMiddleware');

router.get('/',       auth, ctrl.getAll);
router.get('/:id',    auth, ctrl.getOne);
router.post('/',      auth, ctrl.create);
router.put('/:id',    auth, ctrl.update);
router.delete('/:id', auth, ctrl.remove);

module.exports = router;