// Dashboard management module
export class DashboardController {
    constructor(app) {
        this.app = app;
    }
    
    updateDashboard() {
        try {
            this.updateStats();
            this.updateRecentProjects();
            this.updateTopDonors();
        } catch (error) {
            console.error('Dashboard update error:', error);
        }
    }
    
    updateStats() {
        const totalDonorsEl = document.getElementById('totalDonors');
        const totalProjectsEl = document.getElementById('totalProjects');
        const totalGrantsEl = document.getElementById('totalGrants');
        const totalAmountEl = document.getElementById('totalAmount');
        
        const donors = this.app.room.collection('donor').getList();
        const projects = this.app.room.collection('project').getList();
        const grants = this.app.room.collection('grant').getList();
        
        if (totalDonorsEl) totalDonorsEl.textContent = donors.length;
        if (totalProjectsEl) totalProjectsEl.textContent = projects.filter(p => p.status === 'نشط').length;
        if (totalGrantsEl) totalGrantsEl.textContent = grants.length;
        
        const totalAmount = grants.reduce((sum, grant) => sum + (parseFloat(grant.amount) || 0), 0);
        if (totalAmountEl) totalAmountEl.textContent = `$${totalAmount.toLocaleString()}`;
    }
    
    updateRecentProjects() {
        try {
            const projects = this.app.room.collection('project').getList();
            const recentProjects = projects.slice(-5).reverse();
            const container = document.getElementById('recentProjects');
            
            if (!container) return;
            
            if (recentProjects.length === 0) {
                container.innerHTML = '<p class="text-muted">لا توجد مشاريع حتى الآن</p>';
                return;
            }
            
            container.innerHTML = recentProjects.map(project => `
                <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                    <div>
                        <h6 class="mb-1">${project.name || 'بدون اسم'}</h6>
                        <small class="text-muted">${project.startDate || 'بدون تاريخ'}</small>
                    </div>
                    <span class="badge bg-${this.getStatusColor(project.status)}">${project.status || 'غير محدد'}</span>
                </div>
            `).join('');
        } catch (error) {
            console.error('Recent projects update error:', error);
        }
    }
    
    updateTopDonors() {
        try {
            const grants = this.app.room.collection('grant').getList();
            const donorStats = {};
            grants.forEach(grant => {
                const donorName = grant.donor || 'غير محدد';
                donorStats[donorName] = (donorStats[donorName] || 0) + parseFloat(grant.amount || 0);
            });
            
            const topDonors = Object.entries(donorStats)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5);
            
            const container = document.getElementById('topDonors');
            
            if (!container) return;
            
            if (topDonors.length === 0) {
                container.innerHTML = '<p class="text-muted">لا توجد بيانات</p>';
                return;
            }
            
            container.innerHTML = topDonors.map(([donor, amount]) => `
                <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                    <span>${donor}</span>
                    <strong>$${amount.toLocaleString()}</strong>
                </div>
            `).join('');
        } catch (error) {
            console.error('Top donors update error:', error);
        }
    }
    
    getStatusColor(status) {
        const colors = {
            'مخطط': 'secondary',
            'نشط': 'success',
            'متوقف': 'warning',
            'مكتمل': 'primary'
        };
        return colors[status] || 'secondary';
    }
}