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



// set up events.on for model
events.on(model.eventsEmitted.ITEM_ADDED, _onItemAddedFromModel);
events.on(model.eventsEmitted.PROJECT_ADDED, _onProjectAddedFromModel);

// functions for attaching to events from the view

// handles adding the task to the model
const _onUserAddsTaskFromView = function(eventData) {
    model.addTodoItem(eventData.projectID, eventData.title);
};

events.on(view.eventsEmitted.USER_ADDS_TASK, _onUserAddsTaskFromView);


const initialization = (function() {
    model.addProject("Project 1");
    view.projectsPaneHandler.switchActiveProject(1);
    view.detailsPaneHandler.disappear();
})();