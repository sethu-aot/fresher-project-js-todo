document.addEventListener("DOMContentLoaded", function() {
    const taskForm = document.getElementById("taskForm");
    const editTaskForm = document.getElementById("editTaskForm");
    const taskList = document.getElementById("taskList");
    const completedTaskList = document.getElementById("completedTaskList");
    const clearCompletedBtn = document.getElementById("clearCompleted");
    const sortTasks = document.getElementById("sortTasks");
    const searchTask = document.getElementById("searchTask");

    let tasks = JSON.parse(localStorage.getItem("tasks")) || []; //retrieves tasks from localStorage. If no tasks are found, it initializes tasks as an empty array.

    let currentEditTaskId = null; //keep track of the task ID that is currently being edited

    function createTask(title, description, dueDate) {
        const newTask = {
            id: Date.now(), // Uses the current timestamp as a unique ID for the task.
            title: title,
            description: description,
            dueDate: dueDate,
            completed: false,
        };
        tasks.push(newTask); //Adds the new task to the tasks array.
        saveTasks(); //store the updated tasks array in localStorage.
        renderTasks();
    }

    function editTask(taskId, title, description, dueDate) {
        //Finds the task with the given taskId in the tasks array
        const task = tasks.find(function(t) {
            return t.id === taskId;
        });
        //If the task is found, it updates the task's title, description, and dueDate.
        if (task) {
            task.title = title;
            task.description = description;
            task.dueDate = dueDate;
            saveTasks();
            renderTasks();
        }
    }

    function deleteTask(taskId) {
        //Filters out the task with the given taskId from the tasks array.
        tasks = tasks.filter(function(t) {
            return t.id !== taskId;
        });
        saveTasks();
        renderTasks();
    }

    function clearCompletedTasks() {
        //It filters out tasks that are marked as completed.
        //Removes all tasks that are marked as completed from the tasks array
        tasks = tasks.filter(function(t) {
            return !t.completed;
        });
        saveTasks();
        renderTasks();
    }

    function saveTasks() {
        //saves the tasks array to localStorage
        //Converts the tasks array to a JSON string and stores it in localStorage
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function renderTasks() {
       // Clears the existing task lists (taskList and completedTaskList).
        taskList.innerHTML = "";
        completedTaskList.innerHTML = "";

        //Sorts tasks based on the selected sort order (newest or oldest).
        const sortedTasks = sortTasks.value === "newest" 
            //if true
            ? tasks.slice().sort(function(a, b) {
                return b.id - a.id;
            }) 
            //if false
            : tasks.slice().sort(function(a, b) {
                return a.id - b.id;
            });

        sortedTasks.forEach(function(task) {
            const taskItem = document.createElement("li");
            taskItem.className = 'list-group-item border-top rounded';
            taskItem.innerHTML = `
                <div class="list-container">
                <div>
                    <input class="checkbox" type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskComplete(${task.id})">
                </div>
                <div>
                    <span>${task.title}</span> ${task.completed 
                        ? '<i style="color:green" class="bi bi-circle-fill"></i>' 
                        : '<i style="color: #EBB705" class="bi bi-circle-fill"></i>'}
                    <br>
                    <span class="list-description">${task.description}</span> <br>
                <small class=" ${!task.completed ? 'active-due-date':"text-muted" }"><i class="bi bi-calendar4-week"></i> by ${task.dueDate}</small>
                </div>
                </div>
                <div class="list-btn-icons">
                    <i class="bi bi-pencil-fill" style="cursor: pointer;" onclick="showEditModal(${task.id})"></i>
                    <i class="bi bi-trash" style="cursor: pointer;" onclick="showDeleteModal(${task.id})"></i>
                    
                </div>
            `;

            if (task.completed) {
                completedTaskList.appendChild(taskItem);
            } else {
                taskList.appendChild(taskItem);
            }
        });
    }

    taskForm.addEventListener("submit", function(e) {
        //Prevents the default form submission behavior. || prevent page refreshing
        e.preventDefault();
        const title = taskForm.elements.taskTitle.value.trim();
        const description = taskForm.elements.taskDescription.value.trim();
        const dueDate = taskForm.elements.taskDueDate.value.trim();

        if (title === "") {
            alert("Please enter a title for the task.");
            return;
        }

        createTask(title, description, dueDate);

        //Hides the modal and resets the form.
        $('#addTaskModal').modal('hide');
        taskForm.reset();
    });

    editTaskForm.addEventListener("submit", function(e) {
        //Prevents the default form submission behavior
        e.preventDefault();
        const title = editTaskForm.elements.editTaskTitle.value.trim();
        const description = editTaskForm.elements.editTaskDescription.value.trim();
        const dueDate = editTaskForm.elements.editTaskDueDate.value.trim();

        editTask(currentEditTaskId, title, description, dueDate);
        $('#editTaskModal').modal('hide');
        editTaskForm.reset();
    });

    clearCompletedBtn.addEventListener("click", function() {
        clearCompletedTasks();
    });

    sortTasks.addEventListener("change", function() {
        renderTasks(); // Re-renders tasks based on the new sort order.

    });

    searchTask.addEventListener("input", function(e) {
        //Retrieves and trims the search input value, converting it to lowercase.
        const searchValue = e.target.value.trim().toLowerCase();

        //If the search input is empty, calls renderTasks() and stops the function
        if (searchValue === "") {
            renderTasks();
            return;
        }

        //Filters tasks based on whether the task title includes the search input.
        const filteredTasks = tasks.filter(function(task) {
            return task.title.toLowerCase().includes(searchValue);
        });
        renderFilteredTasks(filteredTasks);
    });

    function renderFilteredTasks(filteredTasks) {
        taskList.innerHTML = "";
        completedTaskList.innerHTML = "";

        filteredTasks.forEach(function(task) {
            const taskItem = document.createElement("li");
            taskItem.className = 'list-group-item';
            taskItem.innerHTML = `
                <div>
                    <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskComplete(${task.id})">
                    <span>${task.title}</span> <br>
                    <span class="list-description">${task.description}</span> <br>
                    <small class="text-muted"><i class="bi bi-calendar4-week"></i> by ${task.dueDate}</small>
                </div>
                <div class="list-btn-icons">
                    <i class="bi bi-pencil-fill" style="cursor: pointer;" onclick="showEditModal(${task.id})"></i>
                    <i class="bi bi-trash" style="cursor: pointer;" onclick="showDeleteModal(${task.id})"></i>
                </div>
            `;

            if (task.completed) {
                completedTaskList.appendChild(taskItem);
            } else {
                taskList.appendChild(taskItem);
            }
        });
    }

    window.showEditModal = function(taskId) {
        currentEditTaskId = taskId; //Sets currentEditTaskId to the task ID being edited.

        //Finds the task with the given ID.
        const task = tasks.find(function(t) {
            return t.id === taskId;
        });
        if (task) {
            //If the task is found, populates the edit form fields with the task's details and shows the modal.
            document.getElementById("editTaskTitle").value = task.title;
            document.getElementById("editTaskDescription").value = task.description;
            document.getElementById("editTaskDueDate").value = task.dueDate;

            // Shows the modal
            $('#editTaskModal').modal('show');
        }
    }

    window.showDeleteModal = function(taskId) {
        currentEditTaskId = taskId;
        //Shows the delete modal.
        $('#deleteTaskModal').modal('show');
    }

    document.getElementById("confirmDelete").addEventListener("click", function() {
        //Calls deleteTask() with currentEditTaskId to delete the task.
        deleteTask(currentEditTaskId);
        $('#deleteTaskModal').modal('hide'); //Hides the delete modal.
    });


    //toggles the completion status of a task
    window.toggleTaskComplete = function(taskId) {
        const task = tasks.find(function(t) {
            return t.id === taskId; //Finds the task with the given ID.
        });
        if (task) {
            //If the task is found, toggles its completed status.
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        }
    }

    renderTasks();
});
