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

current optional properties: description, important, dueDate (a Date object), notes */
const todoItemFactory = function(title, options = {}) {
    
    const todoItemID = todoItemIDGenerator.generate();

    const todoItemProperties = {
        title,
        description: "description" in options ? options.description : "",
        important: "important" in options ? options.important : false,
        dueDate: "dueDate" in options ? new Date(options.date.valueOf()) : null, // need to copy value of date
        notes: "notes" in options ? options.notes : "",
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
            notes,
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
        return todoItemID;
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
        const newToDo = todoItemFactory(title, options);
        currentTodoItems.push(newToDo);
    };

    /* Removes todo item from currentToDoItems */
    const removeTodo = function(ID) { 
        for(let i = 0; i < currentTodoItems.length; i ++) {
            if(currentTodoItems[i].getID() === ID) {
                currentTodoItems.splice(i,1);
                break;
            }
        }
    };

    /* Updates todo item within currentToDoItems */
    const updateTodo = function(ID, options = {}) {
        for(let i = 0; i < currentTodoItems.length; i ++) {
            if(currentTodoItems[i].getID() === ID) {
                currentTodoItems[i].updateProperties(options);
            }
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
    };

    const removeProject = function(projectID) {
        const index = _getProjectIndexWithID(projectID);
        if (index !== null) {
            currentProjects.splice(index, 1);
        }
    };

    const changeProjectTitle = function(projectID, newTitle) {
        const index = _getProjectIndexWithID(projectID);
        if (index !== null) {
            currentProjects[index].setTitle(newTitle);
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