// Initialize Socket.io
const socket = io();

// Connection status
socket.on('connect', () => {
  console.log('Connected to server');
  updateConnectionStatus(true);
  socket.emit('request-dashboard-update');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
  updateConnectionStatus(false);
});

// Real-time updates
socket.on('staff-added', (staff) => {
  console.log('New staff added:', staff);
  loadStaffList();
  loadDashboard();
});

socket.on('cpd-activity-added', (activity) => {
  console.log('New activity added:', activity);
  loadDashboard();
  loadStaffCards();
});

socket.on('dashboard-update', (data) => {
  console.log('Dashboard update:', data);
  loadDashboard();
  loadStaffCards();
});

socket.on('dashboard-data', (data) => {
  console.log('Dashboard data received:', data);
  updateDashboard(data);
});

// Update connection status
function updateConnectionStatus(isConnected) {
  const statusDot = document.getElementById('connection-status');
  const statusText = document.getElementById('connection-text');
  
  if (isConnected) {
    statusDot.className = 'status-dot online';
    statusText.textContent = 'Connected';
  } else {
    statusDot.className = 'status-dot offline';
    statusText.textContent = 'Disconnected';
  }
}

// Tab navigation
function showTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Remove active class from all buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab
  document.getElementById(tabName).classList.add('active');
  
  // Add active class to clicked button
  event.target.classList.add('active');
  
  // Load data for specific tabs
  if (tabName === 'dashboard') {
    loadDashboard();
  } else if (tabName === 'add-activity') {
    loadStaffList();
  } else if (tabName === 'staff-details') {
    loadStaffCards();
  }
}

// Load dashboard
async function loadDashboard() {
  try {
    const response = await fetch('/api/dashboard/summary');
    const data = await response.json();
    updateDashboard(data);
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

// Update dashboard with data
function updateDashboard(staffData) {
  if (!staffData || staffData.length === 0) {
    document.getElementById('total-staff').textContent = '0';
    document.getElementById('total-points').textContent = '0';
    document.getElementById('total-activities').textContent = '0';
    document.getElementById('avg-points').textContent = '0';
    document.getElementById('leaderboard-body').innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No data available</td></tr>';
    return;
  }
  
  // Calculate totals
  const totalStaff = staffData.length;
  const totalPoints = staffData.reduce((sum, staff) => sum + (staff.total_points || 0), 0);
  const totalActivities = staffData.reduce((sum, staff) => sum + (staff.activity_count || 0), 0);
  const avgPoints = totalStaff > 0 ? (totalPoints / totalStaff).toFixed(1) : 0;
  
  // Update stat cards
  document.getElementById('total-staff').textContent = totalStaff;
  document.getElementById('total-points').textContent = totalPoints.toFixed(1);
  document.getElementById('total-activities').textContent = totalActivities;
  document.getElementById('avg-points').textContent = avgPoints;
  
  // Update leaderboard
  const leaderboardBody = document.getElementById('leaderboard-body');
  leaderboardBody.innerHTML = '';
  
  staffData.forEach((staff, index) => {
    const row = document.createElement('tr');
    const lastActivityDate = staff.last_activity ? new Date(staff.last_activity).toLocaleDateString() : 'N/A';
    row.innerHTML = `
      <td><strong>${index + 1}</strong></td>
      <td>${staff.name}</td>
      <td>${staff.profession}</td>
      <td><strong>${staff.total_points.toFixed(1)}</strong></td>
      <td>${staff.activity_count}</td>
      <td>${lastActivityDate}</td>
    `;
    leaderboardBody.appendChild(row);
  });
}

// Load staff list for dropdown
async function loadStaffList() {
  try {
    const response = await fetch('/api/staff');
    const staff = await response.json();
    
    const select = document.getElementById('activity-staff');
    const currentValue = select.value;
    select.innerHTML = '<option value="">Select staff member</option>';
    
    staff.forEach(s => {
      const option = document.createElement('option');
      option.value = s.id;
      option.textContent = s.name;
      select.appendChild(option);
    });
    
    if (currentValue) select.value = currentValue;
  } catch (error) {
    console.error('Error loading staff list:', error);
  }
}

// Load staff cards
async function loadStaffCards() {
  try {
    const response = await fetch('/api/dashboard/summary');
    const staffData = await response.json();
    
    const container = document.getElementById('staff-cards-container');
    container.innerHTML = '';
    
    if (!staffData || staffData.length === 0) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No staff members added yet</p>';
      return;
    }
    
    for (const staff of staffData) {
      const cpdResponse = await fetch(`/api/staff/${staff.id}/cpd`);
      const activities = await cpdResponse.json();
      
      const card = document.createElement('div');
      card.className = 'staff-card';
      
      let activitiesHtml = '';
      if (activities && activities.length > 0) {
        activitiesHtml = '<div class="activities-list"><h4>Recent Activities:</h4>';
        activities.slice(0, 3).forEach(activity => {
          const date = new Date(activity.date_completed).toLocaleDateString();
          activitiesHtml += `
            <div class="activity-item">
              <strong>${activity.activity_name}</strong> (${activity.category})
              <br/>${activity.points} pts • ${date}
            </div>
          `;
        });
        activitiesHtml += '</div>';
      }
      
      card.innerHTML = `
        <h3>${staff.name}</h3>
        <p><strong>Profession:</strong> ${staff.profession}</p>
        <p><strong>Total Activities:</strong> ${staff.activity_count}</p>
        <span class="points-badge">${staff.total_points.toFixed(1)} Points</span>
        ${activitiesHtml}
      `;
      
      container.appendChild(card);
    }
  } catch (error) {
    console.error('Error loading staff cards:', error);
  }
}

// Add staff form
document.getElementById('add-staff-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('staff-name').value.trim();
  const email = document.getElementById('staff-email').value.trim();
  const profession = document.getElementById('staff-profession').value;
  
  if (!name || !email || !profession) {
    showMessage('add-staff-message', 'Please fill all fields', 'error');
    return;
  }
  
  try {
    const response = await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, profession })
    });
    
    if (response.ok) {
      showMessage('add-staff-message', `✓ ${name} added successfully!`, 'success');
      document.getElementById('add-staff-form').reset();
      setTimeout(() => {
        loadStaffList();
        loadDashboard();
      }, 500);
    } else {
      const error = await response.json();
      showMessage('add-staff-message', `Error: ${error.error}`, 'error');
    }
  } catch (error) {
    showMessage('add-staff-message', `Error: ${error.message}`, 'error');
  }
});

// Add activity form
document.getElementById('add-activity-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const staff_id = document.getElementById('activity-staff').value;
  const activity_name = document.getElementById('activity-name').value.trim();
  const points = parseFloat(document.getElementById('activity-points').value);
  const category = document.getElementById('activity-category').value;
  const date_completed = document.getElementById('activity-date').value;
  const description = document.getElementById('activity-description').value.trim();
  
  if (!staff_id || !activity_name || !points || !category || !date_completed) {
    showMessage('add-activity-message', 'Please fill all required fields', 'error');
    return;
  }
  
  try {
    const response = await fetch('/api/cpd-activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        staff_id,
        activity_name,
        points,
        category,
        date_completed,
        description
      })
    });
    
    if (response.ok) {
      showMessage('add-activity-message', `✓ Activity logged successfully! (+${points} points)`, 'success');
      document.getElementById('add-activity-form').reset();
      setTimeout(() => {
        loadDashboard();
        loadStaffCards();
      }, 500);
    } else {
      const error = await response.json();
      showMessage('add-activity-message', `Error: ${error.error}`, 'error');
    }
  } catch (error) {
    showMessage('add-activity-message', `Error: ${error.message}`, 'error');
  }
});

// Show message
function showMessage(elementId, message, type) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.className = type;
  element.style.display = 'block';
  
  if (type === 'success') {
    setTimeout(() => {
      element.style.display = 'none';
    }, 3000);
  }
}

// Initial load
window.addEventListener('load', () => {
  loadDashboard();
  loadStaffList();
});

// Request dashboard update every 5 seconds for real-time updates
setInterval(() => {
  if (document.getElementById('dashboard').classList.contains('active')) {
    socket.emit('request-dashboard-update');
  }
}, 5000);
