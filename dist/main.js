(()=>{"use strict";const t={};function e(e,o){t[e]=t[e]||[],t[e].push(o)}function o(e,o){t[e]&&t[e].forEach((function(t){t(o)}))}const n="itemAdded",r="itemRemoved",c="itemUpdated",i="projectAdded",s="projectRemoved",a=function(t=0){let e=[],o=t;return{generate:function(){return o++,e.push(o),console.log("generate"),o},getHighestID:function(){return o},requestID:function(t){return console.log("requested ID",t),e.forEach((e=>{if(e===t)return null})),t>o&&(o=t),t}}},d=a(0),l=function(t,e={}){const o={id:"id"in e?d.requestID(e.id):d.generate(),title:t,description:"description"in e?e.description:"",important:"important"in e&&e.important,completed:"completed"in e&&e.completed,dueDate:"dueDate"in e&&null!==e.dueDate?new Date(e.date.valueOf()):null};return{getProperties:function(){return{id:o.id,title:o.title,description:o.description,important:o.important,completed:o.completed,dueDate:o.dueDate}},updateProperties:function(t={}){for(let e in t)e in o&&(o[e]=t[e])},getID:function(){return o.id}}},u=a(0),p=function(){const t=[],e=function(e){for(let o=0;o<t.length;o++)if(t[o].getID()===+e)return o;return null},a=function(e,s=null,a=null){const d=function(t,e=null,i=null){console.log("constructed id",i);const s=null===i?u.generate():u.requestID(i);let a=[];null!==e&&e.forEach((t=>{const e=t.title,o=l(e,t);a.push(o)}));const d=function(){return s};return{getTitle:function(){return t},setTitle:function(e){t=e},addTodo:function(t,e={}){const r=l(t,e);a.push(r);const c={projectID:s,todoItemProperties:r.getProperties()};o(n,c)},removeTodo:function(t){let e=null;for(let o=0;o<a.length;o++)if(a[o].getID()===t){e=a[o].getID(),a.splice(o,1);break}if(null!==e){const t={id:e,projectID:d()};o(r,t)}},updateTodo:function(t,e={}){let n=null;for(let o=0;o<a.length;o++)a[o].getID()===t&&(a[o].updateProperties(e),n=a[o].getProperties());null!==n&&o(c,{projectID:s,currentProperties:n})},getID:d,doesIDExist:function(t){for(let e=0;e<a.length;e++)if(a[e].getID()===t)return!0;return!1},getTodoItemProperties:function(t){let e=null;for(let o=0;o<a.length;o++)if(a[o].getID()===t){e=a[o].getProperties();break}if(null!==e)return e},getAllTodoItemProperties:function(){let t=[];return a.forEach((e=>{t.push(e.getProperties())})),t}}}(e,s,a);t.push(d);const f={projectID:d.getID(),title:d.getTitle()};p(),o(i,f)},d=function(){let t;try{t=window.localStorage;const e="__storage_test__";return t.setItem(e,e),t.removeItem(e),!0}catch(e){return e instanceof DOMException&&(22===e.code||1014===e.code||"QuotaExceededError"===e.name||"NS_ERROR_DOM_QUOTA_REACHED"===e.name)&&t&&0!==t.length}},p=function(){if(!d())return!1;const e=function(){let e=[];return t.forEach((t=>{const o={title:t.getTitle(),id:+t.getID(),todoItemProperties:t.getAllTodoItemProperties()};e.push(o)})),e}(),o=window.localStorage;return console.log("extracted data",e),o.setItem("projectsList",JSON.stringify(e)),!0};return{addProject:a,removeProject:function(n){const r=e(n);null!==r&&(t.splice(r,1),o(s,n)),p()},changeProjectTitle:function(n,r){const c=e(n);null!==c&&(t[c].setTitle(r),o(s,{projectID:n,newTitle:r})),p()},addTodoItem:function(o,n,r={}){const c=e(o);null!==c&&t[c].addTodo(n,r),p()},removeTodoItem:function(o,n){const r=e(o);null!==r&&t[r].removeTodo(n),p()},updateTodoItem:function(o,n,r={}){const c=e(o);null!==c&&t[c].updateTodo(n,r),p()},getTodoItemProperties:function(o,n){const r=e(o);let c=null;if(null!==r&&(c=t[r].getTodoItemProperties(n)),null!==c)return c},getAllTodoItemPropertiesOfProject:function(o){const n=e(o);return t[n].getAllTodoItemProperties()},saveToLocalStorage:p,loadFromLocalStorage:function(){if(!d())return!1;const t=window.localStorage;let e=JSON.parse(t.getItem("projectsList"));return console.log("loaded projects list",e),!!e&&(e.forEach((t=>{console.log(t),t.todoItemProperties,a(t.title,t.todoItemProperties,+t.id)})),!0)},clearLocalStorage:function(){if(!d())return!1;window.localStorage.removeItem("projectsList")}}}();let f=p.addProject,m=(p.removeProject,p.changeProjectTitle,p.addTodoItem),g=p.removeTodoItem,I=p.updateTodoItem,k=p.getTodoItemProperties,D=p.getAllTodoItemPropertiesOfProject,j=(p.saveToLocalStorage,p.loadFromLocalStorage);p.clearLocalStorage;const y="userAddsProject",v="userChangesProjectDisplayed",P="userAddsTask",S="userRemovesTask",T="userUpdatesTask",h="userRequestsTaskDetails",A="userRequestsToEditTasks";document.body.addEventListener("click",(()=>{document.body.classList.add("using-mouse")})),document.body.addEventListener("keydown",(t=>{"Tab"===t.key&&document.body.classList.remove("using-mouse")}));const b=function(){const t=document.querySelector(".projects-pane"),e=t.querySelector(".projects-container");t.querySelector(".new-project-textbox").addEventListener("keydown",(function(t){if("Enter"===t.key){const e=t.target.value;t.target.value="",t.target.blur(),o(y,{title:e})}}));const n=function(t){o(v,{projectID:t.target.getAttribute("data-project-id")})};return{addProject:function(t,o){const r=document.createElement("div");r.classList.add("project"),r.textContent=o,r.setAttribute("data-project-id",t),function(t){t.addEventListener("click",n)}(r),e.appendChild(r)},switchActiveProject:function(t){const o=e.querySelector(".selected-project");null!==o&&o.classList.remove("selected-project"),e.querySelector(`[data-project-id='${t}']`).classList.add("selected-project")},getDisplayedProject:function(){return+e.querySelector(".selected-project").getAttribute("data-project-id")},getFirstDisplayedProjectID:function(){return+e.querySelector(".project").getAttribute("data-project-id")}}}(),q=function(){const t=document.querySelector(".tasks-pane"),e=t.querySelector(".tasks-container"),n=function(t){if("input"===t.target.tagName.toLowerCase())return;const e={taskID:+t.currentTarget.getAttribute("data-task-id"),projectID:+b.getDisplayedProject()};o(h,e)};t.querySelector(".new-task-textbox").addEventListener("keydown",(function(t){if("Enter"===t.key){const e=t.target.value;t.target.value="",t.target.blur();const n={title:e,projectID:+b.getDisplayedProject()};o(P,n)}}));const r=function(t){const e=t.target.checked,n={taskID:+t.target.closest(".task").getAttribute("data-task-id"),important:e,projectID:+b.getDisplayedProject()};o(T,n)},c=function(t){const e=t.target.checked,n={taskID:+t.target.closest(".task").getAttribute("data-task-id"),completed:e,projectID:+b.getDisplayedProject()};o(T,n)},i=function(t){const o=e.querySelector(`.task[data-task-id='${t}']`);!function(t){t.removeEventListener("click",n),t.querySelector(".task-completed-checkbox").removeEventListener("click",c),t.querySelector(".task-important").removeEventListener("click",r)}(o),o.remove()};return{addTask:function(t,o,i,s,a){const d=document.createElement("div");d.classList.add("task"),d.setAttribute("data-task-id",t);const l=document.createElement("div");l.classList.add("task-checkbox-container"),d.appendChild(l);const u=document.createElement("input");u.classList.add("task-completed-checkbox"),u.setAttribute("type","checkbox"),a&&(u.checked=!0),l.appendChild(u);const p=document.createElement("task-content");p.classList.add("task-content"),d.appendChild(p);const f=document.createElement("div");f.classList.add("task-summary"),p.appendChild(f);const m=document.createElement("p");if(m.classList.add("task-title"),m.textContent=o,f.appendChild(m),null!==i){const t=document.createElement("p");t.classList.add("due-date"),t.textContent=i,f.appendChild(t)}const g=document.createElement("div");g.classList.add("important-rating"),p.appendChild(g);const I=document.createElement("input");I.classList.add("task-important"),I.setAttribute("type","checkbox"),s&&(I.checked=!0),g.appendChild(I),function(t){t.addEventListener("click",n),t.querySelector(".task-completed-checkbox").addEventListener("click",c),t.querySelector(".task-important").addEventListener("click",r)}(d),e.prepend(d)},removeTask:i,clearAllTasks:function(){e.querySelectorAll(".task").forEach((t=>{i(t.getAttribute("data-task-id"))}))},updateTaskDetails:function(t,o,n,r,c){const i=e.querySelector(`.task[data-task-id='${t}']`);if(i.querySelector(".task-checkbox-container input").selected=r,i.querySelector(".task-important").selected=c,i.querySelector(".task-title").textContent=o,null!==n){let t=i.querySelector(".due-date");null===t&&(t=document.createElement("p"),t.classList.add("due-date"),i.querySelector(".task-summary").appendChild(t)),t.textContent=n}else{const t=i.querySelector(".due-date");null!==t&&t.remove()}},getAssociatedProjectID:function(){return+t.getAttribute("data-project-id")},setAssociatedProjectID:function(e){t.setAttribute("data-project-id",e)}}}(),E=function(){const t=document.querySelector(".details-pane"),e=(document.querySelector(".bg-modal"),t.querySelector(".details-pane-title")),n=t.querySelector(".detail-important p"),r=t.querySelector(".detail-due-date p"),c=t.querySelector(".detail-description"),i=function(){return{taskID:+t.getAttribute("data-task-id"),projectID:+t.getAttribute("data-project-id")}};t.querySelector(".options-button").addEventListener("click",(function(){const t=i();o(A,t)})),t.querySelector(".delete-button").addEventListener("click",(function(){const e=i();t.removeAttribute("data-task-id"),s();const n={taskID:e.taskID,projectID:e.projectID};o(S,n)}));const s=function(){t.style.display="none"};return{appear:function(){t.style.display="block"},disappear:s,setFields:function(t,o,i,s){e.textContent=t,n.textContent=o,r.textContent=i,c.textContent=s},setAssociatedTask:function(e,o){t.setAttribute("data-task-id",o),t.setAttribute("data-project-id",e)},getAssociatedTask:i}}(),L=function(){const t=document.querySelector(".bg-modal"),e=t.querySelector(".modal-content"),n=e.querySelector("#title-field"),r=e.querySelector("#due-date-field"),c=e.querySelector("#important-field"),i=e.querySelector("#description-field"),s=function(){return{taskID:+t.getAttribute("data-task-id"),projectID:+t.getAttribute("data-project-id")}},a=function(){n.value="",r.value="",c.selectedIndex=0,i.textContent=""},d=function(t){l(),a()};t.querySelector(".close").addEventListener("click",d),t.querySelector(".cancel").addEventListener("click",d),t.querySelector(".submit").addEventListener("click",(function(){const t=n.value,e=r.value,d=c.options[c.selectedIndex].text,u=i.value,p=s(),f={taskID:p.taskID,projectID:p.projectID,title:t,dueDate:e,important:"Yes"===d,description:u};o(T,f),l(),a()}));const l=function(){t.style.visibility="hidden"};return{setFields:function(t,e,o,s){n.value=t,null!==e&&(r.value=e),c.selectedIndex=o?1:0,i.textContent=s},appear:function(){t.style.visibility="visible"},disappear:l,setAssociatedTask:function(e,o){t.setAttribute("data-task-id",o),t.setAttribute("data-project-id",e)},getAssociatedTask:s}}(),x=function(t){return t.toLocaleDateString("en-US",{weekday:"short",year:"numeric",month:"long",day:"numeric"})};e(n,(function(t){if(q.getAssociatedProjectID()!==t.projectID)return;const e=t.todoItemProperties.title,o=t.todoItemProperties.dueDate,n=t.todoItemProperties.important,r=t.todoItemProperties.completed,c=t.todoItemProperties.id,i=null===o?null:"Due "+x(o);q.addTask(c,e,i,n,r)})),e(i,(function(t){b.addProject(t.projectID,t.title)})),e(c,(function(t){if(q.getAssociatedProjectID()!==t.projectID)return;const e=t.currentProperties.id,o=t.currentProperties.title,n=t.currentProperties.important,r=t.currentProperties.completed,c=t.currentProperties.dueDate,i=null===c?null:"Due: "+x(c);if(q.updateTaskDetails(e,o,i,r,n),+E.getAssociatedTask().taskID==+e){const e=t.currentProperties.description,r=null===i?"No Due Date":i.slice(5),c=n?"Important":"Not Important";E.setFields(o,c,r,e)}})),e(r,(function(t){if(q.getAssociatedProjectID()!==t.projectID)return;const e=t.id;t.projectID,q.removeTask(e)}));const C=function(t){D(t).forEach((t=>{const e=t.id,o=t.title,n=t.important,r=t.completed,c=t.dueDate,i=null===c?null:"Due: "+x(c);q.addTask(e,o,i,n,r)})),q.setAssociatedProjectID(t)};e(P,(function(t){m(t.projectID,t.title)})),e(h,(function(t){const e=t.taskID,o=t.projectID,n=k(o,e),r=n.title,c=null===n.dueDate?"No Due Date":x(n.dueDate),i=n.important?"Important":"Not Important",s=n.description;E.setFields(r,i,c,s),E.setAssociatedTask(o,e),E.appear()})),e(T,(function(t){const e=t.taskID,o=t.projectID,n={};for(let e in t)if("taskID"!==e&&"projectID"!==e){if("dueDate"===e){if(""===t[e]){n[e]=null;continue}{const o=t[e].split("-");n[e]=new Date(+o[0],+o[1]-1,+o[2]);continue}}n[e]=t[e]}I(o,e,n)})),e(A,(function(t){const e=t.taskID,o=t.projectID,n=k(o,e),r=n.title,c=n.important,i=n.description,s=n.dueDate,a=null===s?null:s.toISOString().slice(0,s.toISOString().indexOf("T"));L.setAssociatedTask(o,e),L.setFields(r,a,c,i),L.appear()})),e(S,(function(t){const e=t.taskID,o=t.projectID;g(o,e)})),e(y,(function(t){const e=t.title;f(e)})),e(v,(function(t){const e=t.projectID;b.switchActiveProject(e),q.clearAllTasks(),C(t.projectID)})),function(){if(j()){const t=b.getFirstDisplayedProjectID();b.switchActiveProject(t),C(t)}else f("Project 1",null,1),b.switchActiveProject(1),q.setAssociatedProjectID(1);E.disappear()}()})();