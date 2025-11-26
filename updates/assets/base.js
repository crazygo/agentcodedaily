// Navigation injection for agentcodedaily
(function() {
  'use strict';
  
  // Load manifest and inject navigation
  async function loadManifestAndInjectNav() {
    try {
      // Determine the path to manifest.json based on current location
      const currentPath = window.location.pathname;
      const pathParts = currentPath.split('/').filter(p => p);
      
      // Calculate relative path to updates root
      let manifestPath = '/updates/manifest.json';
      if (pathParts.includes('updates')) {
        const updatesIndex = pathParts.indexOf('updates');
        const depth = pathParts.length - updatesIndex - 1;
        if (depth > 0) {
          manifestPath = '../'.repeat(depth) + 'manifest.json';
        } else {
          manifestPath = './manifest.json';
        }
      }
      
      const response = await fetch(manifestPath);
      if (!response.ok) {
        console.warn('Could not load manifest.json');
        return;
      }
      
      const manifest = await response.json();
      injectNavigation(manifest);
    } catch (error) {
      console.warn('Error loading manifest:', error);
    }
  }
  
  function injectNavigation(manifest) {
    if (!manifest || !manifest.days || manifest.days.length === 0) {
      return;
    }
    
    // Determine current page date from URL
    const currentPath = window.location.pathname;
    const dateMatch = currentPath.match(/(\d{4}-\d{2}-\d{2})/);
    const currentDate = dateMatch ? dateMatch[1] : null;
    
    // Find current, previous, and next dates
    let prevDate = null;
    let nextDate = null;
    
    if (currentDate) {
      const currentIndex = manifest.days.findIndex(d => d.date === currentDate);
      if (currentIndex !== -1) {
        if (currentIndex > 0) {
          prevDate = manifest.days[currentIndex - 1].date;
        }
        if (currentIndex < manifest.days.length - 1) {
          nextDate = manifest.days[currentIndex + 1].date;
        }
      }
    }
    
    // Build navigation HTML
    const isIndexPage = currentPath.endsWith('updates/') || currentPath.endsWith('updates/index.html');
    let navHTML = '<div class="nav-bar">';
    
    if (!isIndexPage) {
      navHTML += '<a href="../index.html" class="nav-home">🏠 Home</a>';
    }
    
    if (prevDate) {
      navHTML += `<a href="../${prevDate}/">← Previous (${prevDate})</a>`;
    }
    
    if (nextDate) {
      navHTML += `<a href="../${nextDate}/">Next (${nextDate}) →</a>`;
    }
    
    navHTML += '</div>';
    
    // Inject at the beginning of body
    const navElement = document.createElement('div');
    navElement.innerHTML = navHTML;
    
    const body = document.body;
    if (body.firstChild) {
      body.insertBefore(navElement.firstChild, body.firstChild);
    } else {
      body.appendChild(navElement.firstChild);
    }
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadManifestAndInjectNav);
  } else {
    loadManifestAndInjectNav();
  }
})();
