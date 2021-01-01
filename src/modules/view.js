import * as events from "./events.js";


const eventsEmitted = {
    USER_ADDS_PROJECT: "userAddsProject",
    USER_CHANGES_PROJECT_DISPLAYED: "userChangesProjectDisplayed",
    USER_ADDS_TASK: "userAddsTask",
    USER_REMOVES_TASK: "userRemovesTask",
    USER_UPDATES_TASK: "userUpdatesTask",
    USER_REQUESTS_TASK_DETAILS: "userRequestsTaskDetails",
};

// handles whether focus outlines appear depending on whether the user uses tabs or not

document.body.addEventListener("click", () => {
    document.body.classList.add("using-mouse");
});

document.body.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
        document.body.classList.remove("using-mouse");
    }
});

// Handles setting up and managing the projects pane on the UI
const projectsPaneHandler = (function () {
    const _projectsPane = document.querySelector(".projects-pane");
    const _projectsContainer = _projectsPane.querySelector(".projects-container");
    
    // callback function for handling users pressing enter while using the project adder
    const _onEnterOfProjectAdder = function (e) {
        if (e.key === "Enter") {
            const title = e.target.value;
            e.target.value = "";
            e.target.blur();
            events.emit(eventsEmitted.USER_ADDS_PROJECT, { title });
        }
    };
    

    // add initial event listeners
    _projectsPane.querySelector(".new-project-textbox").addEventListener("keydown", _onEnterOfProjectAdder);

    // callback function that emits an event when the user clicks a project
    const _onClickOfProject = function (e) {
        events.emit(eventsEmitted.USER_CHANGES_PROJECT_DISPLAYED, e.target.getAttribute("data-project-id"));
    }

    // adds event listeners to the provided project div
    const _addProjectEventListeners = function (project) {
        project.addEventListener("click", _onClickOfProject);
    }

    // removes event listeners from the provided project div
    const _removeProjectEventListeners = function (project) {
        project.removeEventListener("click", _onClickOfProject);

    }

    const addProject = function (id, title) {
        const project = document.createElement("div");
        project.classList.add("project");
        project.textContent = title;
        project.setAttribute("data-project-id", id);
        _addProjectEventListeners(project);

        _projectsContainer.appendChild(project);
    }

    const switchActiveProject = function (id) {
        const currentActiveProject = _projectsContainer.querySelector(".selected-project");
        if (currentActiveProject !== null) classList.remove("selected-project");
        const newActiveProject = _projectsContainer.querySelector(`[data-project-id='${id}']`);
        newActiveProject.classList.add("selected-project");
    }

    const getDisplayedProject = function() {
        return +_projectsContainer.querySelector(".selected-project").getAttribute("data-project-id");
    };

    return {
        addProject,
        switchActiveProject,
        getDisplayedProject,
    }
})();


// Handles setting up and managing the tasks pane on the UI
const tasksPaneHandler = (function () {
    const _tasksPane = document.querySelector(".tasks-pane");
    const _tasksContainer = _tasksPane.querySelector(".tasks-container");

    // callback function for handling users pressing enter while using the task adder
    const _onEnterOfTaskAdder = function (e) {
        if (e.key === "Enter") {
            const title = e.target.value;
            e.target.value = "";
            e.target.blur();
            
            const eventData = {
                title,
                projectID: projectsPaneHandler.getDisplayedProject(),
            }
            events.emit(eventsEmitted.USER_ADDS_TASK, eventData);
        }
    };

    // callback function handling clicks on a task (but not on its input descendents)
    const _onClickOfTask = function(e) {
        const targetTag = e.target.tagName.toLowerCase();
        if(targetTag === "input") {
            return;
        }
        eventData = {
            taskID: e.currentTarget.getAttribute("data-task-id"),
            projectID: projectsPaneHandler.getDisplayedProject(),
        };
        events.emit(eventsEmitted.USER_REQUESTS_TASK_DETAILS, eventData);
    };

    // add initial event listeners
    _tasksPane.querySelector(".new-task-textbox").addEventListener("keydown", _onEnterOfTaskAdder);


    // callback function for handling users clicking the important checkbox on tasks
    const _onClickOfImportantCheckbox = function (e) {
        const newValue = e.target.checked;
        const eventData = {
            taskID: e.target.closest("task").getAttribute("data-task-id"),
            important: newValue,
            projectID: projectsPaneHandler.getDisplayedProject(),
        };
        events.emit(eventsEmitted.USER_UPDATES_TASK, { eventData});
    };

    // callback function for handling users clicking the complete checkbox on tasks
    const _onClickOfCompletedCheckbox = function (e) {
        const newValue = e.target.checked;
        const eventData = {
            taskID: e.target.closest("task").getAttribute("data-task-id"),
            completed: newValue,
            projectID: projectsPaneHandler.getDisplayedProject(),
        };
        events.emit(eventsEmitted.USER_UPDATES_TASK, eventData);
    };

    // adds event listeners to the provided task div
    const _addTaskEventListeners = function (task) {
        task.addEventListener("click",_onClickOfTask);
        task.querySelector(".task-completed-checkbox").addEventListener("click", _onClickOfCompletedCheckbox);
        task.querySelector(".task-important").addEventListener("click", _onClickOfImportantCheckbox);
    };

    // removes event listeners from the provided task div
    const _removeTaskEventListeners = function (task) {
        task.removeEventListener("click",_onClickOfTask);
        task.querySelector(".task-completed-checkbox").removeEventListener("click", _onClickOfCompletedCheckbox);
        task.querySelector(".task-important").removeEventListener("click", _onClickOfImportantCheckbox);
    };

    // renders a new task in the tasks pane, adding it to the top. Adds event handlers. [TO BE DONE]
    const addTask = function (id, title, dueDateToBeDisplayed, important, completed) {

        const task = document.createElement("div");
        task.classList.add("task");
        task.setAttribute("data-task-id", id);

        // deal with checkbox

        const taskCheckboxContainer = document.createElement("div");
        taskCheckboxContainer.classList.add("task-checkbox-container");
        task.appendChild(taskCheckboxContainer);

        const taskCompletedCheckbox = document.createElement("input");
        taskCompletedCheckbox.classList.add("task-completed-checkbox");
        taskCompletedCheckbox.setAttribute("type", "checkbox");
        if (completed) {
            taskCompletedCheckbox.checked = true;
        }
        taskCheckboxContainer.appendChild(taskCompletedCheckbox);

        // deal with task content

        const taskContent = document.createElement("task-content");
        taskContent.classList.add("task-content");
        task.appendChild(taskContent);

        const taskSummary = document.createElement("div");
        taskSummary.classList.add("task-summary");
        taskContent.appendChild(taskSummary);

        const taskTitle = document.createElement("p");
        taskTitle.classList.add("task-title");
        taskTitle.textContent = title;
        taskSummary.appendChild(taskTitle);

        if (dueDateToBeDisplayed !== null) {
            const dueDateP = document.createElement("p");
            dueDateP.classList.add("due-date");
            dueDateP.textContent = dueDateToBeDisplayed;
            taskSummary.appendChild(dueDateP);
    
        } 
       
        const importantRatingDiv = document.createElement("div");
        importantRatingDiv.classList.add("important-rating");
        taskContent.appendChild(importantRatingDiv);

        const taskImportantInput = document.createElement("input");
        taskImportantInput.classList.add("task-important");
        taskImportantInput.setAttribute("type", "checkbox");
        if (important) {
            taskImportantInput.checked = true;
        }
        importantRatingDiv.appendChild(taskImportantInput);


        _addTaskEventListeners(task);
        _tasksContainer.prepend(task);
    };

    // removes a task from the tasks pane. Removes event handlers. [TO BE DONE]
    const removeTask = function (id) {
        const task = _tasksContainer.querySelector(`.task[data-task-id='${id}']`);
        _removeTaskEventListeners(task);
        task.remove();
    };

    const clearAllTasks = function () {
        const tasks = _tasksContainer.querySelectorAll(".task");

        tasks.forEach((task) => {
            removeTask(task.getAttribute("data-task-id"));
        });
    };

    return {
        addTask,
        removeTask,
        clearAllTasks,
    }
})();

// Handles setting up and managing the details pane on the UI
const detailsPaneHandler = (function() {
    const _detailsPane = document.querySelector(".details-pane");
    const modal = document.querySelector(".bg-modal");
    const titleParagraph = _detailsPane.querySelector(".details-pane-title");
    const importantParagraph = _detailsPane.querySelector(".detail-important p");
    const dueDateParagraph = _detailsPane.querySelector(".detail-due-date p");
    const descriptionParagraph = _detailsPane.querySelector(".detail-description");

    // callback function for handling clicks on the settings button,
    // making the edit panel for the pane visible
    const _onClickOfSettingsButton = function() {
        modal.style.visibility = "visible";
    }
    // callback function for handling clicks on the delete button, removing the task
    const _onClickOfDeleteButton = function() {
        const currentTask = _detailsPane.getAttribute("data-task-id");
        _detailsPane.removeAttribute("data-task-id");
        disappear();
        eventData = {
            taskID: currentTask,
            projectID: projectsPaneHandler.getDisplayedProject(),
        }
        events.emit(eventsEmitted.USER_REMOVES_TASK, eventData);
    }

    // add event handlers

    _detailsPane.querySelector(".options-button").addEventListener("click",_onClickOfSettingsButton);
    _detailsPane.querySelector(".delete-button").addEventListener("click",_onClickOfDeleteButton);

    // makes the details pane visible on the UI
    const appear = function() {
        _detailsPane.style.visibility = "visible";
    }

    // makes the details pane hidden on the UI
    const disappear = function () {
        _detailsPane.style.visibility = "hidden";
    }

    // sets the individual fields of the details pane
    const setFields = function(title, important, dueDate, description) {
        titleParagraph.textContent = title;
        importantParagraph.textContent = important ? "Important" : "Not Important";
        dueDateParagraph.textContent = dueDate;
        descriptionParagraph.textContent = description;
    };
    return {
        appear,
        disappear,
        setFields,
    };
})();

// handles setting up and managing the modal window that enables the user to edit a task's details
const modalWindowHandler = (function() {
    const modalWindow = document.querySelector(".bg-modal");
    const modalContent = modalWindow.querySelector(".modal-content");

    const titleTextBox = modalContent.querySelector("#title-field");
    const dueDateDateBox = modalContent.querySelector("#due-date-field");
    const importantSelect = modalContent.querySelector("#important-field");
    const descriptionTextArea = modalContent.querySelector("#description-field");

    const _resetContent = function() {
        titleTextBox.value = "";
        dueDateDateBox.value = "";
        importantSelect.selectedIndex = 0;
        descriptionTextArea.textContent = "";
    };

    // callback function that handles clicks on the submit button
    const _onClickOfSubmit = function() {
        const title = titleTextBox.value;
        const dueDate = dueDateDateBox.value;
        const important = importantSelect.options[importantSelect.selectedIndex].text;
        description = descriptionTextArea.textContent;

        const eventData = {
            title,
            dueDate,
            important: important.text === "Yes",
            description,
        };
        events.emit(eventsEmitted.USER_UPDATES_TASK, eventData);

        modalWindow.style.visibility = "hidden";
        _resetContent();
    };

    // callback function that hides the modal window upon click of the cancel or close button
    const _onClickOfCloseOrCancel = function(e) {
        modalWindow.style.visibility = "hidden";
        _resetContent();
    };
    

    // add event listeners
    modalWindow.querySelector(".close").addEventListener("click",_onClickOfCloseOrCancel);
    modalWindow.querySelector(".cancel").addEventListener("click",_onClickOfCloseOrCancel);
    modalWindow.querySelector(".submit").addEventListener("click",_onClickOfSubmit);

    // sets the fields in the modal window. dueDate is a string in the format YYYY-MM-DD
    const setFields = function(title, dueDate, important, description) {
        titleTextBox.value = title;
        dueDateDateBox.value = dueDate;
        importantSelect.selectedIndex = important ? 1 : 0;
        descriptionTextArea.textContent = description;
    };

    return {
        setFields,
    };
})();


export { projectsPaneHandler, tasksPaneHandler, detailsPaneHandler, modalWindowHandler, eventsEmitted };
