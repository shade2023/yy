// Navigation management module
export class NavigationController {
    showSection(sectionId) {
        try {
            // Hide all sections
            document.querySelectorAll('.content-section').forEach(section => {
                section.style.display = 'none';
            });
            
            // Show selected section
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
            
            // Update nav links
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            
            // Find the clicked nav link and make it active
            const navLink = document.querySelector(`[href="#${sectionId}"]`);
            if (navLink) {
                navLink.classList.add('active');
            }
            
            // Update charts if reports section
            if (sectionId === 'reports') {
                setTimeout(updateCharts, 100);
            }
        } catch (error) {
            console.error('Section navigation error:', error);
        }
    }
}