const Game = require('../models/Game');

const listGames = async (req, res) => {
  try {
    const filter = { status: 'Active' };
    if (req.query.studentId) filter.generatedForStudent = req.query.studentId;
    const games = await Game.find(filter).sort({ createdAt: -1 }).limit(200).lean();
    res.json(games);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const getGame = async (req, res) => {
  try {
    const game = await Game.findOne({ gameId: req.params.gameId, status: 'Active' }).lean();
    if (!game) return res.status(404).json({ message: 'Game not found.' });
    res.json(game);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const deleteGame = async (req, res) => {
  try {
    const game = await Game.findOneAndUpdate({ gameId: req.params.gameId }, { status: 'Inactive' }, { new: true });
    if (!game) return res.status(404).json({ message: 'Game not found.' });
    res.json({ message: 'Game archived.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

module.exports = { listGames, getGame, deleteGame };
