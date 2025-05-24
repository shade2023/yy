// Import modules
import { DonorManager } from './js/donor-manager.js';
import { ProjectManager } from './js/project-manager.js';
import { GrantManager } from './js/grant-manager.js';
import { DashboardController } from './js/dashboard-controller.js';
import { ReportsController } from './js/reports-controller.js';
import { NavigationController } from './js/navigation-controller.js';

// Initialize WebsimSocket for persistent database
const room = new WebsimSocket();

// Initialize application
class App {
    constructor() {
        this.room = room;
        this.donorManager = new DonorManager(this.room);
        this.projectManager = new ProjectManager(this.room);
        this.grantManager = new GrantManager(this.room);
        this.dashboardController = new DashboardController(this);
        this.reportsController = new ReportsController(this);
        this.navigationController = new NavigationController();
        
        this.init();
    }
    
    init() {
        try {
            // Subscribe to data changes
            this.room.collection('donor').subscribe(() => {
                this.donorManager.render();
                this.dashboardController.updateDashboard();
            });
            
            this.room.collection('project').subscribe(() => {
                this.projectManager.render();
                this.dashboardController.updateDashboard();
            });
            
            this.room.collection('grant').subscribe(() => {
                this.grantManager.render();
                this.dashboardController.updateDashboard();
                this.reportsController.updateCharts();
            });
            
            this.dashboardController.updateDashboard();
            this.donorManager.render();
            this.projectManager.render();
            this.grantManager.render();
            this.reportsController.initializeCharts();
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }
    
    // Global data access
    get donors() { return this.room.collection('donor').getList(); }
    get projects() { return this.room.collection('project').getList(); }
    get grants() { return this.room.collection('grant').getList(); }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    window.app = new App();
});

// Global navigation function for onclick handlers
window.showSection = function(sectionId) {
    window.app.navigationController.showSection(sectionId);
    if (sectionId === 'reports') {
        setTimeout(() => window.app.reportsController.updateCharts(), 100);
    }
};

// Global modal functions for onclick handlers
window.showDonorModal = (donor = null) => window.app.donorManager.showModal(donor);
window.showProjectModal = (project = null) => window.app.projectManager.showModal(project);
window.showGrantModal = (grant = null) => window.app.grantManager.showModal(grant);
window.generateReport = () => window.app.reportsController.generateReport();