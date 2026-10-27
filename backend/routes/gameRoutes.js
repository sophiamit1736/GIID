const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { listGames, getGame, deleteGame } = require('../controllers/gameController');

router.get('/', verifyToken, listGames);
router.get('/:gameId', verifyToken, getGame);
router.delete('/:gameId', verifyToken, authorizeRoles('admin', 'teacher'), deleteGame);

module.exports = router;
