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

    let _takenIDs = [];
    let _currentHighestID = latestID;

    // generates a new unique ID
    const generate = function() {
        _currentHighestID++;
        _takenIDs.push(_currentHighestID);
        console.log("generate");
        return _currentHighestID;
    };

    // returns the current highest generated ID
    const getHighestID = function() {
        return _currentHighestID;
    }

    // approves a given ID as valid or not, marking it as taken if valid
    const requestID = function(id) {
        console.log("requested ID", id);
        _takenIDs.forEach((value) => {
            if (value === id) return null
        });

        if (id > _currentHighestID) _currentHighestID = id;
        return id;
    }
    
    return {
        generate,
        getHighestID,
        requestID,
    };

};

const todoItemIDGenerator = IDGeneratorFactory(0);

/* creates objects that represent the individual items on the todo list. The last argument
is meant to be an object containing optional arguments for further configuring the
todoItem. 

current optional properties: description, important, dueDate (a Date object) */
const todoItemFactory = function(title, options = {}) {
    const _todoItemProperties = {
        id: "id" in options ? todoItemIDGenerator.requestID(options.id) : todoItemIDGenerator.generate(),   
        title,
        description: "description" in options ? options.description : "",
        important: "important" in options ? options.important : false,
        completed: "completed" in options ? options.completed : false,
        dueDate: ("dueDate" in options && options.dueDate !== null) ? new Date(options.date.valueOf()) : null, // need to copy value of date
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
const projectFactory = function(title, todoItemsProperties = null, id = null) {
    console.log("constructed id", id);
    const _projectID = id === null ? projectIDGenerator.generate() : projectIDGenerator.requestID(id);
    let _currentTodoItems = [];

    if (todoItemsProperties !== null) {
        todoItemsProperties.forEach((properties) => {
            const title = properties.title;
            const newTodo = todoItemFactory(title, properties);
            _currentTodoItems.push(newTodo)
        });
    }

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
            if(_currentProjects[i].getID() === +projectID) {
                return i;
            }
        }
        return null;
    }

    const addProject = function(title, todoItemsProperties = null, projectID = null) {
        const newProject = projectFactory(title, todoItemsProperties, projectID);
        _currentProjects.push(newProject);

        const eventData = {
            projectID: newProject.getID(),
            title: newProject.getTitle(),
        }
        saveToLocalStorage();
        events.emit(eventsEmitted.PROJECT_ADDED, eventData );
    };

    const removeProject = function(projectID) {
        const index = _getProjectIndexWithID(projectID);
        if (index !== null) {
            _currentProjects.splice(index, 1);
            events.emit(eventsEmitted.PROJECT_REMOVED, projectID);
        }
        saveToLocalStorage();
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
        saveToLocalStorage();
    };

    const addTodoItem = function(projectID, title, options = {}) {

        const projectIndex = _getProjectIndexWithID(projectID);
        if (projectIndex !== null) {
            _currentProjects[projectIndex].addTodo(title, options);
        }
        saveToLocalStorage();
    };

    const removeTodoItem = function(projectID, todoItemID) {
        const index = _getProjectIndexWithID(projectID);
        if (index !== null) {
            _currentProjects[index].removeTodo(todoItemID);
        }
        saveToLocalStorage();
    };

    const updateTodoItem = function(projectID, todoItemID, options = {}) {
        const index = _getProjectIndexWithID(projectID);
        if (index !== null) {
            _currentProjects[index].updateTodo(todoItemID, options);
        }
        saveToLocalStorage();
    };

    const getTodoItemProperties = function(projectID, todoItemID) {
        const projectIndex = _getProjectIndexWithID(projectID);
        let properties = null;
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


    // checks if localStorage functions (i.e., not disabled / missing)
    const _isLocalStorageAvailable = function() {
        let storage;
        try {
            storage = window["localStorage"];
            const test = "__storage_test__";
            storage.setItem(test,test);
            storage.removeItem(test);
            return true;
        } catch (e) {
            return e instanceof DOMException && (
                // everything except Firefox
                e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field because code might not be present
                // everything but Firefox
                e.name === "QuotaExceededError" ||
                // Firefox
                e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
                // acknowledge QuotaExceededError only if something is already stored
                (storage && storage.length !== 0);
        }
        
    };


    // returns an array of objects that contains the title and ID of each project and an array of the properties
    // of the todo items contained in the project
    const _extractProjectListData = function() {
        let extractedData = []

        _currentProjects.forEach((value) => {
            const projectData = {
                title: value.getTitle(),
                id: +value.getID(),
                todoItemProperties: value.getAllTodoItemProperties(),
            };
            extractedData.push(projectData);
        });

        return extractedData;
    };


    // saves the entire projectList in localStorage
    const saveToLocalStorage = function() {
        if(!_isLocalStorageAvailable()) return false;
        const extractedData = _extractProjectListData();
        const localStorage = window.localStorage; 
        console.log("extracted data", extractedData);
        localStorage.setItem("projectsList",JSON.stringify(extractedData));
        return true;
    };
    // loads the entire projectList from localStorage. Returns false if localStorage is not available or if
    // the projectList cannot be found in it
    const loadFromLocalStorage = function() {
        if(!_isLocalStorageAvailable()) return false;
        const localStorage = window.localStorage;  
        let loadedProjectsList = JSON.parse(localStorage.getItem("projectsList"));
        console.log("loaded projects list", loadedProjectsList);
        if(!loadedProjectsList) {
            return false;
        }
        loadedProjectsList.forEach((projectData) => {
            console.log(projectData);
            const todoItemProperties = projectData.todoItemProperties;
            addProject(projectData.title,projectData.todoItemProperties,+projectData.id);
        });
        return true;
    };

    const clearLocalStorage = function() {
        if(!_isLocalStorageAvailable()) return false;
        const localStorage = window.localStorage;  
        localStorage.removeItem("projectsList");

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
        saveToLocalStorage,
        loadFromLocalStorage,
        clearLocalStorage,
    }
})();

export let addProject = projectsList.addProject, removeProject = projectsList.removeProject,
        changeProjectTitle = projectsList.changeProjectTitle, addTodoItem = projectsList.addTodoItem,
        removeTodoItem = projectsList.removeTodoItem, updateTodoItem = projectsList.updateTodoItem,
        getTodoItemProperties = projectsList.getTodoItemProperties, 
        getAllTodoItemPropertiesOfProject = projectsList.getAllTodoItemPropertiesOfProject,
        saveToLocalStorage = projectsList.saveToLocalStorage, loadFromLocalStorage = projectsList.loadFromLocalStorage,
        clearLocalStorage = projectsList.clearLocalStorage;

export {eventsEmitted};