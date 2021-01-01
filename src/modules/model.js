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
    let _currentHighestID = latestID;

    // generates a new unique ID
    const generate = function() {
        _currentHighestID++;
        return _currentHighestID;
    };

    // returns the current highest generated ID
    const getHighestID = function() {
        return _currentHighestID;
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
    const _todoItemProperties = {
        id: todoItemIDGenerator.generate(),   
        title,
        description: "description" in options ? options.description : "",
        important: "important" in options ? options.important : false,
        completed: "completed" in options ? options.completed : false,
        dueDate: "dueDate" in options ? new Date(options.date.valueOf()) : null, // need to copy value of date
    };
    // take a String argument and tests if that property exists on the to-do item
    const _isPropertyInExistence = function(property) {
        if (property in _todoItemProperties) {
            return true;
        } else {
            return false;
        }
    };
    // returns an object with all the properties of the to-do item
    const getProperties = function() {
        return ({
            id: _todoItemProperties.id,
            title: _todoItemProperties.title,
            description: _todoItemProperties.description,
            important: _todoItemProperties.important,
            completed: _todoItemProperties.completed,
            dueDate: _todoItemProperties.dueDate,
        })
    };
    
    /* sets the properties specified in the propertiesToUpdate argument,
    which is to be an object*/
    const updateProperties = function(propertiesToUpdate = {}) {
        for (let key in propertiesToUpdate) {
            if(!_isPropertyInExistence(key)) continue;
            console.log("UPDATED VALUE: " + propertiesToUpdate[key]);
            _todoItemProperties[key] = propertiesToUpdate[key];
            
        }
    };
    
    const getID = function() {
        return _todoItemProperties.id;
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

    const _projectID = projectIDGenerator.generate();

    const _currentTodoItems = [...todoItems];

    const getTitle = function() {
        return title;
    };

    const setTitle = function(newTitle) {
        title = newTitle;
    }

    /* Generates new todo item  and places it in currentToDoItems */
    const addTodo = function(title, options = {}) {
        const newTodo = todoItemFactory(title, options);
        _currentTodoItems.push(newTodo);
        const eventData = {
            projectID: _projectID,
            todoItemProperties: newTodo.getProperties(),
        };
        events.emit(eventsEmitted.ITEM_ADDED, eventData);
    };

    /* Removes todo item from currentToDoItems */
    const removeTodo = function(ID) { 
        let removedTodoItemID = null;
        for(let i = 0; i < _currentTodoItems.length; i++) {
            if(_currentTodoItems[i].getID() === ID) {
                removedTodoItemID = _currentTodoItems[i].getID();
                _currentTodoItems.splice(i,1);
                break;
            }
        }
        if(removedTodoItemID !== null) {
            const eventData = {
                id: removedTodoItemID,
                projectID: getID(),
            };
            events.emit(eventsEmitted.ITEM_REMOVED, eventData);
        }
    };

    /* Updates todo item within currentToDoItems */
    const updateTodo = function(ID, options = {}) {
        let currentProperties = null;
        for(let i = 0; i < _currentTodoItems.length; i++) {
            if(_currentTodoItems[i].getID() === ID) {
                _currentTodoItems[i].updateProperties(options);
                currentProperties = _currentTodoItems[i].getProperties();
            }
        }
        if (currentProperties !== null) {
            const eventData = {
                projectID: _projectID,
                currentProperties,
            };
            console.log("UPDATE EVENT DATA", eventData);
            events.emit(eventsEmitted.ITEM_UPDATED, eventData);
        }
    };

    const getID = function() {
        return _projectID;
    }

    const doesIDExist = function(ID) {
        for(let i = 0; i < _currentTodoItems.length; i++) {
            if(_currentTodoItems[i].getID() === ID) {
                return true;    
            }
        }
        return false;
    };

    const getTodoItemProperties = function(ID) {
        let properties = null;
        for(let i = 0; i < _currentTodoItems.length; i++) {
            if(_currentTodoItems[i].getID() === ID) {
                properties = _currentTodoItems[i].getProperties();
                break;
            }
        }
        if (properties !== null) {
            return properties;
        }
    };

    // returns an array of objects with properties of each task item
    const getAllTodoItemProperties = function() {
        let taskProperties = [];
        _currentTodoItems.forEach((value) => {
            taskProperties.push(value.getProperties());
        });
        return taskProperties;
    }

    return {
        getTitle,
        setTitle,
        addTodo,
        removeTodo,
        updateTodo,
        getID,
        doesIDExist,
        getTodoItemProperties,
        getAllTodoItemProperties
    }

};

/* Module that holds other projects */
const projectsList = (function() {

    const _currentProjects = [];

    const _getProjectIndexWithID = function(projectID) {
        for(let i = 0; i < _currentProjects.length; i++) {
            console.log("currentProjectID: " + _currentProjects[i].getID() )
            console.log("attemtped match: " + projectID);
            if(_currentProjects[i].getID() === +projectID) {
                return i;
            }
        }
        return null;
    }

    const addProject = function(title, todoItems = []) {
        const newProject = projectFactory(title, todoItems);
        _currentProjects.push(newProject);

        const eventData = {
            projectID: newProject.getID(),
            title: newProject.getTitle(),
        }
        events.emit(eventsEmitted.PROJECT_ADDED, eventData );
    };

    const removeProject = function(projectID) {
        const index = _getProjectIndexWithID(projectID);
        if (index !== null) {
            _currentProjects.splice(index, 1);
            events.emit(eventsEmitted.PROJECT_REMOVED, projectID);
        }
    };

    const changeProjectTitle = function(projectID, newTitle) {
        const index = _getProjectIndexWithID(projectID);
        if (index !== null) {
            _currentProjects[index].setTitle(newTitle);
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
            _currentProjects[projectIndex].addTodo(title, options);
        }
    };

    const removeTodoItem = function(projectID, todoItemID) {
        const index = _getProjectIndexWithID(projectID);
        if (index !== null) {
            _currentProjects[index].removeTodo(todoItemID);
        }
    };

    const updateTodoItem = function(projectID, todoItemID, options = {}) {
        const index = _getProjectIndexWithID(projectID);
        console.log("OPTIONS" , options);
        if (index !== null) {
            _currentProjects[index].updateTodo(todoItemID, options);
        }
    };

    const getTodoItemProperties = function(projectID, todoItemID) {
        const projectIndex = _getProjectIndexWithID(projectID);
        let properties = null;
        console.log("ARGUMENT ID: " + projectID);
        if (projectIndex !== null) {
            properties = _currentProjects[projectIndex].getTodoItemProperties(todoItemID);
        }
        if (properties !== null) return properties;
    };

    // returns an array of objects--the properties of tasks associated with a specific project ID
    const getAllTodoItemPropertiesOfProject = function(projectID) {
        const index = _getProjectIndexWithID(projectID);
        return _currentProjects[index].getAllTodoItemProperties();

    };

    return {
        addProject,
        removeProject,
        changeProjectTitle,
        addTodoItem,
        removeTodoItem,
        updateTodoItem,
        getTodoItemProperties,
        getAllTodoItemPropertiesOfProject,
    }
})();

export let addProject = projectsList.addProject, removeProject = projectsList.removeProject,
        changeProjectTitle = projectsList.changeProjectTitle, addTodoItem = projectsList.addTodoItem,
        removeTodoItem = projectsList.removeTodoItem, updateTodoItem = projectsList.updateTodoItem,
        getTodoItemProperties = projectsList.getTodoItemProperties, 
        getAllTodoItemPropertiesOfProject = projectsList.getAllTodoItemPropertiesOfProject;

export {eventsEmitted};