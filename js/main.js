const body = document.querySelector('body');

const container = document.querySelector('.container');

const tasksList = document.querySelector('.tasks');

const counterTasks = document.querySelector('.counter');

let tasks = [];

let removedTask = [];

const theme = document.querySelector('.tasks-control__theme');
const iconTheme = theme.querySelector('img');

if (localStorage.getItem('theme')) {
    body.classList.add(localStorage.getItem('theme'));

    if (iconTheme.src.includes('icons/dark.svg')) {
        iconTheme.src = 'icons/light.svg';
    } else {
        iconTheme.src = 'icons/dark.svg';
    }
}

theme.addEventListener('click', changeTheme);

if (localStorage.getItem('tasks')) {
    tasks = getFromLocalStorage('tasks');
    tasks.forEach(task => renderTask(task));
}

renderCounter();

checkEmptyList(tasks);

function changeTheme() {
    if (iconTheme.src.includes('icons/dark.svg')) {
        iconTheme.src = 'icons/light.svg';
    } else {
        iconTheme.src = 'icons/dark.svg';
    }

    body.classList.toggle('dark-theme');

    const themeLS = body.classList.contains('dark-theme') ? 'dark-theme' : 'light-theme';

    localStorage.setItem('theme', themeLS);
}


const btnOpenAddTaskModal = document.querySelector('.open-add-todo-btn'); 
btnOpenAddTaskModal.addEventListener('click', (e) => renderTaskModal(e, 'addTaskModal'));

const btnOpenDeleteAllTasksModal = document.querySelector('.open-delete-all-todo-btn');
const chekboxToggle = btnOpenDeleteAllTasksModal.querySelector('input');

function renderTaskModal(e, typeModal) {

    body.classList.add('no-scroll');

    let textTitle = '';

    if (typeModal === 'editTaskModal') {
        textTitle = 'EDIT NOTE'
    } else if (typeModal === 'addTaskModal') {
        textTitle = 'NEW NOTE'
    } else {
        textTitle = 'Are you sure you want to delete all tasks?'
    }

    const deleteInputHTML = (typeModal === 'deleteAllTasksModal')  ? '' : '<input class="modal__input" type="text" placeholder="Input your note...">'

    const modalHTML = `
                <div class="modal modal--open">
                    <div class="modal__content">
                        <div class="modal__title">${textTitle}</div>
                        ${deleteInputHTML}
                        <div class="modal__buttons">
                            <button class="modal__button modal__button--cancel">CANCEL</button>
                            <button class="modal__button modal__button--apply">APPLY</button>
                            
                        </div>
                    </div>
                </div>
    `
    container.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.querySelector('.modal')
    const btnApplyModal = document.querySelector('.modal__button--apply');
    const inputModal = modal.querySelector('.modal__input');

    if (typeModal === 'addTaskModal') {
        inputModal.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                addTask(e, inputModal);
            }
        });
        
        btnApplyModal.addEventListener('click', (e) => addTask(e, inputModal));

        const btnCloseModal = document.querySelector('.modal__button--cancel');
        btnCloseModal.addEventListener('click', deleteTaskModal);

        modal.addEventListener('click', (e) => {
            const modalContent = modal.querySelector('.modal__content')
            if (!modalContent.contains(e.target)) {
                modal.remove()
                body.classList.remove('no-scroll');
            }
        })
    }

    if (typeModal === 'editTaskModal') {
        inputModal.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                applyTaskEdit(btnApplyModal, inputModal);
            }
        });

        inputModal.addEventListener('input', (e) => checkInputChange(btnApplyModal, inputModal));

        btnApplyModal.addEventListener('click', () => applyTaskEdit(btnApplyModal, inputModal));
        
        editTask(e, inputModal, btnApplyModal)

        checkInputChange(btnApplyModal, inputModal)

        const btnCloseModal = document.querySelector('.modal__button--cancel');
        btnCloseModal.addEventListener('click', deleteTaskModal);

        
        modal.addEventListener('click', (e) => {
            const modalContent = modal.querySelector('.modal__content')
            if (!modalContent.contains(e.target)) {
                modal.remove()
                body.classList.remove('no-scroll');
            }
        })
    }

    if (typeModal === 'deleteAllTasksModal') {
        btnApplyModal.addEventListener('click', deleteAllTasks);

        const btnCloseModal = document.querySelector('.modal__button--cancel');
        btnCloseModal.addEventListener('click', deleteAllTasksModal);

        modal.addEventListener('click', (e) => {
            const modalContent = modal.querySelector('.modal__content')
            if (!modalContent.contains(e.target)) {
                modal.remove()
                body.classList.remove('no-scroll');
                chekboxToggle.checked = !chekboxToggle.checked
            }
        })
    }
}

function checkInputChange(btnApplyModalEdit, inputModalEdit) {
    const id = btnApplyModalEdit.dataset.id

    const task = tasks.find(task => task.id == id);

    if (task.text == inputModalEdit.value) {
        btnApplyModalEdit.disabled = true;
    } else {
        btnApplyModalEdit.disabled = false;
    }
}

function deleteAllTasksModal () {
    document.querySelector('.modal').remove();
    body.classList.remove('no-scroll');

    chekboxToggle.checked = !chekboxToggle.checked
}

function deleteTaskModal() {
    document.querySelector('.modal').remove();
    body.classList.remove('no-scroll');

}

function applyTaskEdit(btnApplyModalEdit, inputModalEdit) {
    const id = btnApplyModalEdit.dataset.id

    const task = tasks.find(task => task.id == id);

    if (task.text == inputModalEdit.value) {
        btnApplyModalEdit.classList.add('disabled');
        return
    }

    if (inputModalEdit.value.length < 3) {
        if (inputModalEdit.classList.contains('modal__input--error')) {
            return
        }
        inputModalEdit.insertAdjacentHTML('afterend', '<div class="modal__error">The task must be at least 3 characters long</div>');
        inputModalEdit.classList.add('modal__input--error');
        return;
    }

    inputModalEdit.classList.remove('modal__input--error');  

    task.text = inputModalEdit.value;

    tasksList.innerHTML = '';

    tasks.forEach(task => renderTask(task));

    saveToLocalStorage('tasks', tasks);

    deleteTaskModal()
}

tasksList.addEventListener('click', taskListClickHandler);

function taskListClickHandler (e) {
    const action = e.target.dataset.action;

    switch (action) {
        case 'edit': renderTaskModal(e, 'editTaskModal')
            break;
        case 'delete': deleteTask(e);
            break;
        case 'done': doneTask(e);
            break;
    }
}

btnOpenDeleteAllTasksModal.addEventListener('change', (e) => {
    if (tasks.length === 0) {
        renderTaskModal(e, 'addTaskModal');
        return;
    }
    renderTaskModal(e, 'deleteAllTasksModal')
});

function deleteAllTasks() {
    const getCountDeleteTask = getFromLocalStorage('countDeleteTask');

    const countDeleteTask = getCountDeleteTask + tasks.length;

    chekboxToggle.checked = !chekboxToggle.checked

    saveToLocalStorage('countDeleteTask', countDeleteTask);

    tasks = [];
    tasksList.innerHTML = '';
    checkEmptyList([]);
    saveToLocalStorage('tasks', []);

    renderCounter();
    deleteTaskModal();
}


const selectFilterTasks = document.querySelector('.tasks-control__select');
selectFilterTasks.addEventListener('change', searchTasks);

function filterTasks() {

    const value = selectFilterTasks.value;

    const filteredTasks = tasks;

    if (value === 'completed') {
        return filteredTasks.filter(task => task.done);
    } 
    if (value === 'uncompleted') {
        return filteredTasks.filter(task => !task.done);
    }
    return filteredTasks;

}

const inputSearchTasks = document.querySelector('.tasks-control__input');
inputSearchTasks.addEventListener('input', searchTasks);

function searchTasks() {

    const sortedTasks = filterTasks();  

    const value = inputSearchTasks.value.toLowerCase();

    const sortedAndSearchTasks = sortedTasks.filter(task => task.text.toLowerCase().includes(value));

    tasksList.innerHTML = '';

    sortedAndSearchTasks.forEach(task => renderTask(task));

    checkEmptyList(sortedAndSearchTasks);
}


function addTask(e, inputModal) {
    e.preventDefault();

    if (inputModal.value.length < 3) {
        if (inputModal.classList.contains('modal__input--error')) {
            return
        }
        console.log(!inputModal.classList.contains('.modal__error'))
        const modalErrorHTML = '<div class="modal__error">The task must be at least 3 characters long</div>';
        inputModal.insertAdjacentHTML('afterend', modalErrorHTML);
        inputModal.classList.add('modal__input--error');
        return;
    }

    const modalErrorHTML = document.querySelector('.modal__error');

    inputModal.classList.remove('modal__input--error');
    modalErrorHTML ? modalErrorHTML.remove() : null;

    const taskText = inputModal.value;

    const newTask = {
        id: Date.now(),
        text: taskText,
        done: false,
    }

    tasks.push(newTask);

    saveToLocalStorage('tasks', tasks);

    renderTask(newTask);

    inputModal.value = "";
    inputModal.focus();

    checkEmptyList(tasks);

    const getCountAddedTask = localStorage.getItem('countAddedTask');

    const countAddedTask = Number(getCountAddedTask) + 1;

    chekboxToggle.checked = false;

    saveToLocalStorage('countAddedTask', countAddedTask);

    renderCounter();

    deleteTaskModal();
}

function deleteTask(e) {

    const parantNode = e.target.closest('.tasks__item');

    const id = parantNode.id;

    const task = tasks.find(task => task.id == id);

    removedTask.push(task);

    tasks = tasks.filter(task => task.id != id);


    parantNode.remove();

    checkEmptyList(tasks);


    saveToLocalStorage('tasks', tasks);

    const getCountDeleteTask = localStorage.getItem('countDeleteTask');

    const countDeleteTask = Number(getCountDeleteTask) + 1;

    saveToLocalStorage('countDeleteTask', countDeleteTask);

    renderCounter();

    renderUndoDelete(id);
}

function editTask(e, inputModalEdit, applyModalEdit) {

    const parantNode = e.target.closest('.tasks__item');

    const id = parantNode.id;

    let task = tasks.find(task => task.id == id);

    inputModalEdit.value = task.text;
    applyModalEdit.dataset.id = id;
}

function doneTask(e) {
    const checkbox = e.target;  

    const parantNode = e.target.closest('.tasks__item');

    const id = parantNode.id;

    const task = tasks.find(task => task.id == id);
    task.done = !task.done;

    const taskTitle = parantNode.querySelector('.tasks__title');

    checkbox.checked = task.done;

    searchTasks();

    taskTitle.classList.toggle('tasks__title--done');

    saveToLocalStorage('tasks', tasks);
}

function renderTask(task) {
    const cssClassTitle = task.done ? 'tasks__title tasks__title--done' : 'tasks__title';

    const taskHTML = `<li id="${task.id}" class="tasks__item">

        <label class="task__checkbox">
            <input type="checkbox" class="task__checkbox-input" data-action="done" ${task.done ? 'checked' : ''}>
            <span class="task__checkmark" ></span>
        </label>

        <span class="${cssClassTitle}">${task.text}</span>
        <div class="tasks__buttons">
            <div class="tasks__button tasks__button--edit" data-action="edit">
                <svg class="tasks__icon" width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7.67272 3.49106L1 10.1637V13.5H4.33636L11.0091 6.82736M7.67272 3.49106L10.0654 1.09837L10.0669 1.09695C10.3962 0.767585 10.5612 0.602613 10.7514 0.540824C10.9189 0.486392 11.0993 0.486392 11.2669 0.540824C11.4569 0.602571 11.6217 0.767352 11.9506 1.09625L13.4018 2.54738C13.7321 2.87769 13.8973 3.04292 13.9592 3.23337C14.0136 3.40088 14.0136 3.58133 13.9592 3.74885C13.8974 3.93916 13.7324 4.10414 13.4025 4.43398L13.4018 4.43468L11.0091 6.82736M7.67272 3.49106L11.0091 6.82736" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
            </div>
            <div class="tasks__button tasks__button--trash" data-action="delete">
                <svg class="tasks__icon" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3.87426 7.61505C3.80724 6.74386 4.49607 6 5.36983 6H12.6302C13.504 6 14.1928 6.74385 14.1258 7.61505L13.6065 14.365C13.5464 15.1465 12.8948 15.75 12.1109 15.75H5.88907C5.10526 15.75 4.4536 15.1465 4.39348 14.365L3.87426 7.61505Z" stroke="currentColor"/>
                                    <path d="M14.625 3.75H3.375" stroke="currentColor" stroke-linecap="round"/>
                                    <path d="M7.5 2.25C7.5 1.83579 7.83577 1.5 8.25 1.5H9.75C10.1642 1.5 10.5 1.83579 10.5 2.25V3.75H7.5V2.25Z" stroke="currentColor"/>
                                    <path d="M10.5 9V12.75" stroke="currentColor" stroke-linecap="round"/>
                                    <path d="M7.5 9V12.75" stroke="currentColor" stroke-linecap="round"/>
                                </svg>
            </div>
        </div>
</li>`


    tasksList.insertAdjacentHTML('beforeend', taskHTML);
}

function renderCounter() {

    counterTasks.innerHTML = '';

    if (!localStorage.getItem('countDeleteTask')) {
        saveToLocalStorage('countDeleteTask', 0);
    }

    if (!localStorage.getItem('countAddedTask')) {
        saveToLocalStorage('countAddedTask', 0);
    }

    if (localStorage.getItem('countAddedTask') > 0) {
        counterTasks.classList.add('slide-in');
    }

    const tasksCount = getFromLocalStorage('tasks').length;

    const countDeleteTask = getFromLocalStorage('countDeleteTask');

    const countAddedTask = getFromLocalStorage('countAddedTask');

    const counterHTML = `<ul class="counter__list">
                            <li class="counter__item">TASKS</li>
                            <li class="counter__item">Count: ${tasksCount}</li>
                            <li class="counter__item">Deleted: ${countDeleteTask}</li>
                            <li class="counter__item">Added: ${countAddedTask}</li>

                        </ul>`;
    counterTasks.insertAdjacentHTML('beforeend', counterHTML);
}

function renderUndoDelete(id) {

    const undoDeleteList = document.querySelector('.undo-delete-list-modal');
    const undoDelete = document.createElement('div');
    undoDelete.classList.add('undo-delete');
    undoDeleteList.insertAdjacentElement('beforeend', undoDelete);
    
    
    undoDelete.addEventListener('click', () => undoDeleteTask(id));

    let seconds = 3;

    const timer = setInterval(() => {
        seconds--;

        undoDelete.querySelector('.undo-delete__timer').innerHTML = seconds;

        if (seconds === 0) {
            clearInterval(timer);
            
            undoDelete.remove();
        }

    }, 1000);


    function undoDeleteTask(id) {
        const task = removedTask.find(task => task.id == id);

        tasks.push(task);

        saveToLocalStorage('tasks', tasks);

        renderTask(task);

        const getCountDeleteTask = localStorage.getItem('countDeleteTask');

        const countDeleteTask = Number(getCountDeleteTask) - 1;
    
        saveToLocalStorage('countDeleteTask', countDeleteTask);

        removedTask = removedTask.filter(task => task.id != id);

        undoDelete.remove();

        renderCounter();

        checkEmptyList(tasks);
    }

    const undoDeleteHTML = `
            <div class="undo-delete__timer">${seconds}</div>
            <div class="undo-delete__title">UNDO</div>
            <div class="undo-delete__icon">
                <img src="icons/undo.svg" alt="undo">
            </div>
    `;
    undoDelete.insertAdjacentHTML('beforeend', undoDeleteHTML);  
     
}

renderClock()

function renderClock() {

    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    const clockNode = container.querySelector('.clock');
    const clocInnerNode = clockNode.querySelector('.clock__inner');
    clocInnerNode.innerHTML = updateClock();

    clockNode.append(clocInnerNode)

    setTimeout(renderClock, 1000);
}


function checkEmptyList(data) {

    if (data.length === 0) {
        const emptyHTML = `<li class="tasks__item tasks__item--empty">
                                <img class="empty__icon" src="icons/man-white.svg" alt="man-white">
                                <div class="tasks__empty-title">Empty...</div>
                            </li>`;

        tasksList.insertAdjacentHTML('afterbegin', emptyHTML);

        const emptyIcon = document.querySelector('.empty__icon');
        if (emptyIcon.src.includes('icons/man-white.svg')) {
            emptyIcon.src = 'icons/man-black.svg';
        } else {
            emptyIcon.src = 'icons/man-white.svg';
        }
    }

    if (data.length > 0) {
        const emptyNode = document.querySelector('.tasks__item--empty');
        emptyNode ? emptyNode.remove() : null;
    }
}

function saveToLocalStorage(name, data) {
    localStorage.setItem(name, JSON.stringify(data));
}

function getFromLocalStorage(name) {
    const data = localStorage.getItem(name);
    return data ? JSON.parse(data) : [];
}
