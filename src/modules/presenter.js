import * as model from "./model.js";
import * as view from "./view.js";
import * as events from "./events.js";


// changes a date to string from
const _formatDate = function(date) {
    const dateLocaleStringOptions = {weekday: "short", year: "numeric" , month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", dateLocaleStringOptions)
};

// functions for attaching to events from the model

// adds a new task to the tasks panel on the UI if the relevant project is currently displayed
const _onItemAddedFromModel = function(eventData) {
    if(view.projectsPaneHandler.getDisplayedProject() !== eventData.projectID) return;

    const title = eventData.todoItemProperties.title;
    const dueDate = eventData.todoItemProperties.dueDate;
    const important = eventData.todoItemProperties.important;
    const completed = eventData.todoItemProperties.completed;
    const taskID = eventData.todoItemProperties.id;

    const dateString = dueDate === null ? null : "Due " + _formatDate(dueDate);

    view.tasksPaneHandler.addTask(taskID,title,dateString,important,completed);
};

// adds a new project to the projects panel on the UI
const _onProjectAddedFromModel = function(eventData) {
    view.projectsPaneHandler.addProject(eventData.projectID, eventData.title);
}

const _onItemUpdatedFromModel = function(eventData) {

    const taskID = eventData.currentProperties.id;
    const title = eventData.currentProperties.title;
    const important = eventData.currentProperties.important;
    const completed = eventData.currentProperties.completed;
    const dueDate = eventData.currentProperties.dueDate;

    const dueDateString = dueDate === null ? null : "Due: " + _formatDate(dueDate);

    view.tasksPaneHandler.updateTaskDetails(taskID,title,dueDateString,completed,important)

    if(+view.detailsPaneHandler.getAssociatedTask().taskID === +taskID) {
        console.log(eventData);
        const description = eventData.currentProperties.description;
        const detailsDueDateString = dueDateString === null ? "No Due Date" : dueDateString.slice(5);
        const importantString = important ? "Important" : "Not Important";
        view.detailsPaneHandler.setFields(title, importantString, detailsDueDateString, description);
    }
};


// set up events.on for model
events.on(model.eventsEmitted.ITEM_ADDED, _onItemAddedFromModel);
events.on(model.eventsEmitted.PROJECT_ADDED, _onProjectAddedFromModel);
events.on(model.eventsEmitted.ITEM_UPDATED, _onItemUpdatedFromModel);

// functions for attaching to events from the view

// handles adding the task to the model
const _onUserAddsTaskFromView = function(eventData) {
    model.addTodoItem(eventData.projectID, eventData.title);
};

// handles display of the details panel upon user request for details for a task
const _onUserRequestsTaskDetailsFromView = function (eventData) {
    const taskID = eventData.taskID;
    const projectID = eventData.projectID;
    const properties = model.getTodoItemProperties(projectID, taskID);

    const titleDisplayed = properties.title;
    const dueDateDisplayed = properties.dueDate === null ? "No Due Date" : _formatDate(properties.dueDate);
    const importantDisplayed = properties.important ? "Important" : "Not Important";
    const descriptionDisplayed = properties.description;

    view.detailsPaneHandler.setFields(titleDisplayed,importantDisplayed,dueDateDisplayed,descriptionDisplayed)
    view.detailsPaneHandler.setAssociatedTask(projectID, taskID);

    view.detailsPaneHandler.appear();
};

const _onUserUpdatesTasks = function(eventData) {
    const taskID = eventData.taskID;
    const projectID = eventData.projectID;

    const options = {};
    for(let key in eventData) {
        if (key === "taskID" || key === "projectID") continue;
        if (key === "dueDate") {
            if (eventData[key] === "") {
                options[key] = null;
                continue;
            } else {
                const yearMonthDate = eventData[key].split("-");
                options[key] = new Date(+yearMonthDate[0], (+yearMonthDate[1]) - 1, +yearMonthDate[2]);
                continue;
            }
        }
        options[key] = eventData[key];
    }
    model.updateTodoItem(projectID,taskID,options);
};

// makes the modal window appear
const _onUserRequestsToEditTask = function(eventData) {
    const taskID = eventData.taskID;
    const projectID = eventData.projectID;
    console.log(taskID, projectID);
    const properties = model.getTodoItemProperties(projectID, taskID);

    const title = properties.title;
    const important = properties.important;
    const description = properties.description;
    const date = properties.dueDate;
    const dateString = date === null ? null : date.toISOString().slice(0,date.toISOString().indexOf("T"));

    view.modalWindowHandler.setAssociatedTask(projectID, taskID);
    view.modalWindowHandler.setFields(title,dateString,important, description);

    view.modalWindowHandler.appear();
};


// set up events.on for view
events.on(view.eventsEmitted.USER_ADDS_TASK, _onUserAddsTaskFromView);
events.on(view.eventsEmitted.USER_REQUESTS_TASK_DETAILS, _onUserRequestsTaskDetailsFromView);
events.on(view.eventsEmitted.USER_UPDATES_TASK, _onUserUpdatesTasks);
events.on(view.eventsEmitted.USER_REQUESTS_TO_EDIT_TASK, _onUserRequestsToEditTask);

const initialization = (function() {
    model.addProject("Project 1");
    view.projectsPaneHandler.switchActiveProject(1);
    view.detailsPaneHandler.disappear();
})();