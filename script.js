let tasks = [];
let taskCount = 0;
let filteredTasks = tasks;
let priorityChart = null; // Store the chart instance globally
let statusChart = null; // Store the status chart instance globally

// Helper function to generate random colors
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function addTask() {
  const taskInput = document.getElementById("task-input");
  const dueDateInput = document.getElementById("due-date");
  const priorityInput = document.getElementById("priority");

  const taskText = taskInput.value.trim();
  const dueDate = dueDateInput.value;
  const priority = priorityInput.value;

  if (taskText === "") {
    return;
  }

  taskCount++;
  const newTask = {
    text: taskText,
    dueDate,
    priority,
    status: 'To-Do',
  };

  tasks.push(newTask);
  filteredTasks = tasks; // Ensure all tasks are displayed when added
  taskInput.value = "";
  dueDateInput.value = "";
  renderTasks();
  updateProgress();
  updatePriorityDistribution(); // Update priority chart when a task is added
  updateStatusDistribution(); // Update status chart when a task is added
}

function changeStatus(index, status) {
  tasks[index].status = status;
  renderTasks();
  updateProgress();
  updatePriorityDistribution(); // Update priority chart when status is changed
  updateStatusDistribution(); // Update status chart when status is changed
}

function filterTasks(status) {
  filteredTasks = status === 'All' ? tasks : tasks.filter(task => task.status === status);
  renderTasks();
}

function renderTasks() {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  if (filteredTasks.length === 0) {
    taskList.innerHTML = "<p>No tasks found.</p>";
    return;
  }

  const table = document.createElement("table");
  const header = document.createElement("thead");
  header.innerHTML = `
    <tr>
      <th>Title</th>
      <th>Priority</th>
      <th>Due Date</th>
      <th>Status</th>
      <th>Change Status</th>
    </tr>
  `;
  table.appendChild(header);

  const body = document.createElement("tbody");

  filteredTasks.forEach((task, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${task.text}</td>
      <td>${task.priority}</td>
      <td>${task.dueDate}</td>
      <td>${task.status}</td>
      <td>
        <select onchange="changeStatus(${index}, this.value)">
          <option value="To-Do" ${task.status === 'To-Do' ? 'selected' : ''}>To-Do</option>
          <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
        </select>
      </td>
    `;
    body.appendChild(row);
  });

  table.appendChild(body);
  taskList.appendChild(table);
  updateProgress();
  updateTaskSummary();
  updatePriorityDistribution(); // Ensure pie chart updates after tasks are rendered
  updateStatusDistribution(); // Ensure status chart updates after tasks are rendered
}

function updateProgress() {
  const completedTasks = tasks.filter(task => task.status === 'Completed').length;
  const progressPercentage = Math.round((completedTasks / taskCount) * 100);
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");

  progressBar.value = progressPercentage;
  progressText.textContent = `${progressPercentage}% Completed`;
}

function updateTaskSummary() {
  const todoCount = tasks.filter(task => task.status === 'To-Do').length;
  const inProgressCount = tasks.filter(task => task.status === 'In Progress').length;
  const completedCount = tasks.filter(task => task.status === 'Completed').length;

  document.getElementById("todo-count").textContent = todoCount;
  document.getElementById("in-progress-count").textContent = inProgressCount;
  document.getElementById("completed-count").textContent = completedCount;
}

function updatePriorityDistribution() {
  // Filter out completed tasks from the priority distribution chart
  const activeTasks = tasks.filter(task => task.status !== 'Completed');

  const lowPriority = activeTasks.filter(task => task.priority === 'Low').length;
  const mediumPriority = activeTasks.filter(task => task.priority === 'Medium').length;
  const highPriority = activeTasks.filter(task => task.priority === 'High').length;

  // Check if there are no tasks and set a random color for the completed state
  const completedTasks = tasks.filter(task => task.status === 'Completed').length;
  const randomColor = completedTasks === 0 ? getRandomColor() : '#4CAF50'; // Green for completed tasks

  const ctx = document.getElementById('priority-chart').getContext('2d');

  // If the chart already exists, destroy it before creating a new one
  if (priorityChart) {
    priorityChart.destroy();
  }

  // Create a new chart
  priorityChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Low', 'Medium', 'High', 'Completed'],
      datasets: [{
        data: [lowPriority, mediumPriority, highPriority, completedTasks],
        backgroundColor: ['#FFC0CB', '#FFEB3B', '#F44336', randomColor],
        hoverBackgroundColor: ['#FF80AB', '#FFEB3B', '#FF5252', randomColor],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: function(tooltipItem) {
              const label = tooltipItem.label || '';
              const value = tooltipItem.raw || 0;
              return `${label}: ${value} task(s)`;
            }
          }
        }
      }
    }
  });
}

function updateStatusDistribution() {
  const todoCount = tasks.filter(task => task.status === 'To-Do').length;
  const inProgressCount = tasks.filter(task => task.status === 'In Progress').length;
  const completedCount = tasks.filter(task => task.status === 'Completed').length;

  const ctx = document.getElementById('status-chart').getContext('2d');

  // If the chart already exists, destroy it before creating a new one
  if (statusChart) {
    statusChart.destroy();
  }

  // Create a new chart
  statusChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['To-Do', 'In Progress', 'Completed'],
      datasets: [{
        data: [todoCount, inProgressCount, completedCount],
        backgroundColor: ['#FFEB3B', '#FF9800', '#4CAF50'],
        hoverBackgroundColor: ['#FFEB3B', '#FF9800', '#66BB6A'],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: function(tooltipItem) {
              const label = tooltipItem.label || '';
              const value = tooltipItem.raw || 0;
              return `${label}: ${value} task(s)`;
            }
          }
        }
      }
    }
  });
}
