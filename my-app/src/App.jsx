import './App.css';
import { useState, useEffect, useRef } from 'react';

import addIcon from './add-icon.svg';
import closeIcon from './closeIcon.svg';

function AppControl({ value, setValue, addTask }) {
  const inputRef = useRef(null);

  const handleAdd = () => {
    if (value.trim()) {
      addTask(value.trim());
      setValue('');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        document.activeElement.tagName !== "INPUT" &&
        document.activeElement.tagName !== "TEXTAREA"
      ) {
        inputRef.current?.focus();
      }
    };


    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className='App-control'>
      <input
        ref={inputRef}
        className='taskName'
        placeholder='Add new task'
        value={value}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleAdd();
          }
        }}
        onChange={(e) => setValue(e.target.value)}
      />
      <button className='addBtn' onClick={handleAdd}>
        <img src={addIcon} alt="Add" />
      </button>
    </div>
  );
}

export default function App() {
  const [value, setValue] = useState('');

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);



  const addTask = (taskName) => {
    setTasks([
      ...tasks,
      { id: Date.now() + Math.random(), name: taskName, checked: false }
    ]);
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, checked: !task.checked } : task
    ));
  };

  const removeTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const doneListRef = useRef(null);

  function showlist(){
    if(doneListRef.current){
      doneListRef.current.style.display =
        doneListRef.current.style.display === 'block' ? 'none' : 'block';
    }
  }

  return (
    <div className="App">
      <h1>Your Daily To Do</h1>
      <AppControl value={value} setValue={setValue} addTask={addTask} />

      <ul className='list'>
        {tasks
          .filter(task => !task.checked)
          .map(task => (
            <li className='item' key={task.id}>
              <div>
                <input
                  type='checkbox'
                  checked={task.checked}
                  onChange={() => toggleTask(task.id)}
                />
                <p style={task.checked ? { textDecoration: 'line-through', color: 'gray' } : {}}>
                  {task.name}
                </p>
              </div>
              <div>
                <img
                  className='delBtn'
                  width='20px'
                  src={closeIcon}
                  alt="Delete"
                  onClick={() => removeTask(task.id)}
                />
              </div>
            </li>
          ))}
      </ul>

      <p 
      className='done'
      style={tasks.filter(task => task.checked).length <= 0 ? {display:'none'} : {display:'block'} }
      onClick={()=> showlist()}>

      Done {tasks.filter(task => task.checked).length > 0 && `(${tasks.filter(task => task.checked).length})`}</p>

      <ul ref={doneListRef} className='doneList'>
        {tasks
          .filter(task => task.checked)
          .map(task => (
            <li className='item' key={task.id}>
              <div>
                <input
                  type='checkbox'
                  checked={task.checked}
                  onChange={() => toggleTask(task.id)}
                />
                <p style={task.checked ? { textDecoration: 'line-through', color: 'gray' } : {}}>
                  {task.name}
                </p>
              </div>
              <div>
                <img
                  className='delBtn'
                  width='20px'
                  src={closeIcon}
                  alt="Delete"
                  onClick={() => removeTask(task.id)}
                />
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}