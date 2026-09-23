import myListingsStatsService from '../services/myListingsStats.service.js';
import catchAsync from '../utils/catchAsync.js';

class MyListingsStatsController {
  getStats = catchAsync(async (req, res) => {
    // Strictly retrieve the user ID from the authenticated token
    const userId = req.user.id;
    const stats = await myListingsStatsService.getStats(userId);

    res.status(200).json(stats);
  });
}

export default new MyListingsStatsController();
