const dashboardService = require('../services/dashboardService');

const getSummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const summary = await dashboardService.getDashboardSummary(req.user.id, month, year);
    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary
};
