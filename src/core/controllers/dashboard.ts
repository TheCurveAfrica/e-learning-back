import { DashboardRepository } from '../repositories/DashboardRepository';
import { IDashboardStats } from '../interfaces/dashboard';

class DashboardController {
  private dashboardRepository: DashboardRepository;

  constructor() {
    this.dashboardRepository = new DashboardRepository();
  }

  async adminDashboardStats(): Promise<IDashboardStats> {
    return this.dashboardRepository.adminDashboard();
  }
}
export default DashboardController;
