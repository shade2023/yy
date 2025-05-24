// Reports and charts management module
export class ReportsController {
    constructor(app) {
        this.app = app;
        this.grantsStatusChart = null;
        this.donorAmountsChart = null;
    }
    
    initializeCharts() {
        try {
            const ctx1 = document.getElementById('grantsStatusChart');
            const ctx2 = document.getElementById('donorAmountsChart');
            
            if (ctx1 && typeof Chart !== 'undefined') {
                this.grantsStatusChart = new Chart(ctx1, {
                    type: 'doughnut',
                    data: {
                        labels: [],
                        datasets: [{
                            data: [],
                            backgroundColor: ['#ffc107', '#28a745', '#dc3545', '#17a2b8', '#6f42c1']
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
            }
            
            if (ctx2 && typeof Chart !== 'undefined') {
                this.donorAmountsChart = new Chart(ctx2, {
                    type: 'bar',
                    data: {
                        labels: [],
                        datasets: [{
                            label: 'المبلغ',
                            data: [],
                            backgroundColor: '#007bff'
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Charts initialization error:', error);
        }
    }
    
    updateCharts() {
        try {
            const grants = this.app.room.collection('grant').getList();
            
            if (this.grantsStatusChart) {
                const statusCounts = {};
                grants.forEach(grant => {
                    const status = grant.status || 'غير محدد';
                    statusCounts[status] = (statusCounts[status] || 0) + 1;
                });
                
                this.grantsStatusChart.data.labels = Object.keys(statusCounts);
                this.grantsStatusChart.data.datasets[0].data = Object.values(statusCounts);
                this.grantsStatusChart.update();
            }
            
            if (this.donorAmountsChart) {
                const donorAmounts = {};
                grants.forEach(grant => {
                    const donor = grant.donor || 'غير محدد';
                    donorAmounts[donor] = (donorAmounts[donor] || 0) + parseFloat(grant.amount || 0);
                });
                
                const topDonors = Object.entries(donorAmounts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10);
                
                this.donorAmountsChart.data.labels = topDonors.map(([donor]) => donor);
                this.donorAmountsChart.data.datasets[0].data = topDonors.map(([,amount]) => amount);
                this.donorAmountsChart.update();
            }
        } catch (error) {
            console.error('Charts update error:', error);
        }
    }
    
    generateReport() {
        const donors = this.app.room.collection('donor').getList();
        const projects = this.app.room.collection('project').getList();
        const grants = this.app.room.collection('grant').getList();
        
        const reportData = {
            donors: donors.length,
            projects: projects.length,
            grants: grants.length,
            totalAmount: grants.reduce((sum, grant) => sum + parseFloat(grant.amount || 0), 0),
            date: new Date().toLocaleDateString('ar-SA')
        };
        
        const reportContent = `
تقرير إدارة الجهات المانحة
========================
تاريخ التقرير: ${reportData.date}
الملخص التنفيذي:
- إجمالي الجهات المانحة: ${reportData.donors}
- إجمالي المشاريع: ${reportData.projects}
- إجمالي المنح: ${reportData.grants}
- إجمالي المبالغ: $${reportData.totalAmount.toLocaleString()}
تفاصيل الجهات المانحة:
${donors.map(donor => `- ${donor.name} (${donor.type})`).join('\n')}
تفاصيل المشاريع:
${projects.map(project => `- ${project.name} - ${project.status}`).join('\n')}
تفاصيل المنح:
${grants.map(grant => `- ${grant.title} - ${grant.donor} - $${parseFloat(grant.amount).toLocaleString()}`).join('\n')}
        `;
        
        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `تقرير_الجهات_المانحة_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
