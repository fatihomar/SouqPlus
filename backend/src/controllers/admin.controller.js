import adminService from '../services/admin.service.js';

class AdminController {
  async getStats(req, res, next) {
    try {
      const stats = await adminService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req, res, next) {
    try {
      const { page, limit, search, role, banned } = req.query;
      const result = await adminService.getUsers(page, limit, search, role, banned);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async toggleUserBan(req, res, next) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;
      const user = await adminService.toggleUserBan(adminId, id);
      res.status(200).json({
        success: true,
        message: user.isBanned ? 'تم حظر المستخدم بنجاح وإخفاء إعلاناته النشطة' : 'تم فك الحظر عن المستخدم',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async getListings(req, res, next) {
    try {
      const { page, limit, status, search, category } = req.query;
      const result = await adminService.getListings(page, limit, status, search, category);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async updateListingStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const adminId = req.user.id;
      const listing = await adminService.updateListingStatus(adminId, id, status);
      res.status(200).json({
        success: true,
        message: 'تم تحديث حالة الإعلان بنجاح',
        data: listing
      });
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req, res, next) {
    try {
      const { page, limit, action, adminId } = req.query;
      const result = await adminService.getAuditLogs(page, limit, action, adminId);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
  async getReports(req, res, next) {
    try {
      const { page, limit, status } = req.query;
      const result = await adminService.getReports(page, limit, status);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async updateReportStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const adminId = req.user.id;
      const report = await adminService.updateReportStatus(adminId, id, status);
      res.status(200).json({
        success: true,
        message: 'OU. OOUSUSO O-O U,Oc OU,OU,OO',
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async getSettings(req, res, next) {
    try {
      const settings = await adminService.getSettings();
      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req, res, next) {
    try {
      const settings = req.body;
      const adminId = req.user.id;
      const updatedSettings = await adminService.updateSettings(adminId, settings);
      res.status(200).json({
        success: true,
        message: 'OU. OO-O_USO OO1O_OO_OO OU,U+O,OU. O"U+OO O-',
        data: updatedSettings
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();
