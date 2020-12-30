import * as events from "./events.js"

const eventsEmitted = {
    ITEM_ADDED: "itemAdded",
    ITEM_REMOVED: "itemRemoved",    
    ITEM_UPDATED: "itemUpdated",
    PROJECT_ADDED: "projectAdded",
    PROJECT_REMOVED: "projectRemoved",
    PROJECT_TITLE_CHANGED: "projectTitleChanged",
};



/* Creates objects that generate unique IDs. Takes one argument representing 
the highest existing ID in order to generate IDs that are greater
than latestID. If not specified, defaults to 0. */
const IDGeneratorFactory = function(latestID = 0) {
    let currentHighestID = latestID;

    // generates a new unique ID
    const generate = function() {
        currentHighestID++;
        return currentHighestID;
    };

    // returns the current highest generated ID
    const getHighestID = function() {
        return currentHighestID;
    }

    return {
        generate,
        getHighestID,
    };

};

const todoItemIDGenerator = IDGeneratorFactory(0);

/* creates objects that represent the individual items on the todo list. The last argument
is meant to be an object containing optional arguments for further configuring the
todoItem. 

current optional properties: description, important, dueDate (a Date object) */
const todoItemFactory = function(title, options = {}) {
    
    const todoItemProperties = {
        id: todoItemIDGenerator.generate(),   
        title,
        description: "description" in options ? options.description : "",
        important: "important" in options ? options.important : false,
        dueDate: "dueDate" in options ? new Date(options.date.valueOf()) : null, // need to copy value of date
    };

    // take a String argument and tests if that property exists on the to-do item
    const _isPropertyInExistence = function(property) {
        if (property in todoItemProperties) {
            return true;
        } else {
            return false;
        }
    };
    // returns an object with all the properties of the to-do item
    const getProperties = function() {
        return ({
            title,
            description,
            important,
            dueDate,
        } = todoItemProperties)
    };
    
    /* sets the properties specified in the propertiesToUpdate argument,
    which is to be an object*/
    const updateProperties = function(propertiesToUpdate = {}) {
        for (let key in propertiesToUpdate) {
            if(!_isPropertyInExistence(key)) continue;
            todoItemProperties[key] = propertiesToUpdate[key];
            
        }
    };
    
    const getID = function() {
        return todoItemProperties.id;
    };

    return {
        getProperties,
        updateProperties,
        getID,
    }
};

const projectIDGenerator = IDGeneratorFactory(0);

/* Creates objects representing projects used to classify todo items */
const projectFactory = function(title, todoItems = []) {

    const projectID = projectIDGenerator.generate();

    const currentTodoItems = [...todoItems];

    const getTitle = function() {
        return title;
    };

    const setTitle = function(newTitle) {
        title = newTitle;
    }

    /* Generates new todo item  and places it in currentToDoItems */
    const addTodo = function(title, options = {}) {
        const newTodo = todoItemFactory(title, options);
        currentTodoItems.push(newTodo);

        const eventData = {
            projectID,
            todoProperties: newTodo.getProperties(),
        };

        events.emit(eventsEmitted.ITEM_ADDED, eventData);
    };

    /* Removes todo item from currentToDoItems */
    const removeTodo = function(ID) { 
        let removedTodoItemID = null;
        for(let i = 0; i < currentTodoItems.length; i ++) {
            if(currentTodoItems[i].getID() === ID) {
                removedTodoItemID = currentTodoItems[i].getID();
                currentTodoItems.splice(i,1);
                break;
            }
        }
        if(removedTodoItemID !== null) {
            events.emit(eventsEmitted.REMOVED_ITEM, removedTodoItemID);
        }
    };

    /* Updates todo item within currentToDoItems */
    const updateTodo = function(ID, options = {}) {
        let currentProperties = null;
        for(let i = 0; i < currentTodoItems.length; i ++) {
            if(currentTodoItems[i].getID() === ID) {
                currentTodoItems[i].updateProperties(options);
                currentProperties = currentTodoItems.getProperties();
            }
        }
        if (currentProperties !== null) {
            const eventData = {
                projectID,
                currentProperties,
            };
            events.emit(eventsEmitted.ITEM_UPDATED, eventData);
        }
    };

    const getID = function() {
        return projectID;
    }

    const doesIDExist = function(ID) {
        for(let i = 0; i < currentTodoItems.length; i ++) {
            if(currentTodoItems[i].getID() === ID) {
                return true;    
            }
        }
        return false;
    };
    return {
        getTitle,
        setTitle,
        addTodo,
        removeTodo,
        updateTodo,
        getID,
        doesIDExist,
    }

};

/* Module that holds other projects */
const projectsList = (function() {

    const currentProjects = [];

    const _getProjectIndexWithID = function(projectID) {
        for(let i = 0; i < currentProjects.length; i++) {
            if(currentProjects[i].getID() === projectID) {
                return i;
            }
        }
        return null;
    }

    const addProject = function(title, todoItems = []) {
        const newProject = projectFactory(title, todoItems);
        currentProjects.push(newProject);

        const eventData = {
            projectID: newProject.getID(),
            title: newProject.getTitle(),
        }
        events.emit(eventsEmitted.PROJECT_ADDED, eventData );
    };

    const removeProject = function(projectID) {
        const index = _getProjectIndexWithID(projectID);
        if (index !== null) {
            currentProjects.splice(index, 1);
            events.emit(eventsEmitted.PROJECT_REMOVED, projectID);
        }
    };

    const changeProjectTitle = function(projectID, newTitle) {
        const index = _getProjectIndexWithID(projectID);
        if (index !== null) {
            currentProjects[index].setTitle(newTitle);
            const eventData = {
                projectID,
                newTitle,
            }
            events.emit(eventsEmitted.PROJECT_REMOVED, eventData);
        }
    };

    const addTodoItem = function(projectID, title, options = {}) {
        const projectIndex = _getProjectIndexWithID(projectID);
        if (projectIndex !== null) {
            currentProjects[projectIndex].addTodo(title, options);
        }
    };

    const removeTodoItem = function(projectID, todoItemID) {
        const index = _getProjectIndexWithID(projectID);
        if (index !== null) {
            currentProjects[index].removeTodo(todoItemID);
        }
    };

    const updateTodoItem = function(projectID, todoItemID, options = {}) {
        const index = _getProjectIndexWithID(projectID);
        if (index !== null) {
            currentProjects[index].updateTodo(todoItemID, options);
        }
    };

    return {
        addProject,
        removeProject,
        changeProjectTitle,
        addTodoItem,
        removeTodoItem,
        updateTodoItem,
    }
})();

export let addProject = projectsList.addProject, removeProject = projectsList.removeProject,
        changeProjectTitle = projectsList.changeProjectTitle, addTodoItem = projectsList.addTodoItem,
        removeTodoItem = projectsList.removeTodoItem, updateTodoItem = projectsList.updateTodoItem;