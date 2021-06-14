const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const { json } = require('express');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find((c) => c.username === username);

  if(!user){
    return response.status(404).json({"error":"User doesn't exist"})
  }

  request.user = user;

  return next();

}

function checkExistsTodo(request, response, next) {
  const user = request.user;
  const {id} = request.params;
  const todo = user.todos.find((t) => t.id === id);

  if(!todo){
    return response.status(404).json({"error":"Todo doesn't exist"})
  }

  request.todo = todo;

  return next();

}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  
  const user = { 
    name, 
    username,
    id: uuidv4(),
    todos: []
  }

  const usernameCheck = users.find((c) => c.username === username);

  if(usernameCheck){
    return response.status(400).json({"error":"Username already in use"})
  }

  users.push(user);

  return response.status(201).json(user).send();

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  return response.json(user.todos).send();
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;

  const {title, deadline} = request.body;
  
  const newTodo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }


  user.todos.push(newTodo)

  return response.status(201).json(newTodo).send();

});

app.put('/todos/:id', checksExistsUserAccount, checkExistsTodo, (request, response) => {
  const {title, deadline} = request.body;
  const todo = request.todo;

  todo.title = title? title : todo.title;
  todo.deadline = deadline? new Date(deadline) : todo.deadline;

  return response.status(200).json(todo).send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkExistsTodo, (request, response) => {
  const todo = request.todo;

  todo.done = true;

  return response.status(200).json(todo).send();

});

app.delete('/todos/:id', checksExistsUserAccount, checkExistsTodo, (request, response) => {
    const user = request.user;
    const {id} = request.params;
    user.todos.splice(user.todos.findIndex(td => td.id === id), 1);

    return response.status(204).send();
});

module.exports = app;