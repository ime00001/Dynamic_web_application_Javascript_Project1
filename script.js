// Retrieve tasks from local storage or initialize an empty array
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// DOM elements
const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTask');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const filterSelect = document.getElementById('filterSelect');
const clearCompletedButton = document.getElementById('clearCompleted');

// Function to save tasks in local storage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to create a new task element
function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.classList.add('task');
    taskElement.innerHTML = `
        <input type="checkbox">
        <span>${task}</span>
        <button class="delete">Delete</button>
        <div class="drag-handle">:::</div>
    `;
    return taskElement;
}

// Function to render tasks on the page
function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const taskElement = createTaskElement(task);
        const checkbox = taskElement.querySelector('input');
        const deleteButton = taskElement.querySelector('.delete');

        // Mark task as completed
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                taskElement.classList.add('completed');
            } else {
                taskElement.classList.remove('completed');
            }
            tasks[index] = task;
            saveTasks();
            updateTaskCount();
        });

        // Delete task
        deleteButton.addEventListener('click', () => {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
            updateTaskCount();
        });

        taskList.appendChild(taskElement);
    });
    makeTasksDraggable();
}

// Function to update the task count
function updateTaskCount() {
    const openTaskCount = tasks.filter((task, index) => {
        const taskElement = taskList.children[index];
        return !taskElement.classList.contains('completed');
    }).length;
    taskCount.textContent = `${openTaskCount} task${openTaskCount !== 1 ? 's' : ''} remaining`;
}

// Function to make tasks draggable
function makeTasksDraggable() {
    const taskElements = taskList.children;
    for (let i = 0; i < taskElements.length; i++) {
        taskElements[i].draggable = true;
        taskElements[i].setAttribute('data-index', i);

        taskElements[i].addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.getAttribute('data-index'));
        });

        taskElements[i].addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        taskElements[i].addEventListener('drop', (e) => {
            const fromIndex = e.dataTransfer.getData('text/plain');
            const toIndex = e.target.getAttribute('data-index');

            if (fromIndex !== toIndex) {
                const movedTask = tasks.splice(fromIndex, 1)[0];
                tasks.splice(toIndex, 0, movedTask);
                saveTasks();
                renderTasks();
                updateTaskCount();
            }
        });
    }
}

// Function to save the filter in local storage
function saveFilter() {
    localStorage.setItem('filter', filterSelect.value);
}

// Load the filter from local storage
const savedFilter = localStorage.getItem('filter');
if (savedFilter) {
    filterSelect.value = savedFilter;
}

// Add event listeners for filter and filter saving
filterSelect.addEventListener('change', () => {
    saveFilter();
    filterTasks();
});

// Function to filter tasks
function filterTasks() {
    const filterValue = filterSelect.value;
    const taskElements = taskList.children;
    for (let i = 0; i < tasks.length; i++) {
        const taskElement = taskElements[i];
        if (filterValue === 'all' || (filterValue === 'active' && !taskElement.classList.contains('completed')) || (filterValue === 'completed' && taskElement.classList.contains('completed'))) {
            taskElement.style.display = 'block';
        } else {
            taskElement.style.display = 'none';
        }
    }
}

// Add a new task
addTaskButton.addEventListener('click', () => {
    const newTask = taskInput.value.trim();
    if (newTask.length > 0) {
        tasks.push(newTask);
        saveTasks();
        taskInput.value = '';
        renderTasks();
        updateTaskCount();
    }
});

// Initial rendering and updating the task count
renderTasks();
updateTaskCount();
filterTasks();
