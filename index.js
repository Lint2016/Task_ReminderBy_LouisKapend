// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { 
  getFirestore, 
  addDoc, 
  collection, 
  serverTimestamp,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  deleteDoc
} from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js';


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_C8Ew5AR9YjPhYSUP96Im0uytwhXxG-M",
  authDomain: "tasks-reminder-b13ab.firebaseapp.com",
  projectId: "tasks-reminder-b13ab",
  storageBucket: "tasks-reminder-b13ab.firebasestorage.app",
  messagingSenderId: "100526080665",
  appId: "1:100526080665:web:57470eb502299b92be2e08"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Utility functions
function showLoading() {
  document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}

async function showConfirmation(message) {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, proceed!',
    cancelButtonText: 'Cancel'
  });
  return result.isConfirmed;
}

// Format date for display
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Format time for display
function formatTime(timeString) {
  const [hours, minutes] = timeString.split(':');
  let hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12; // the hour '0' should be '12'
  return `${hour}:${minutes} ${ampm}`;
}

/*the below codes creates the text effect on the web page */
var typed = new Typed('.auto-type',{
  strings :['I am a task reminder,', 'write anything down','and I will remind!'],
  typeSpeed: 150,
  backSpeed: 150,
  loop: true
})
/*the below code is used to get the form element from the html file and send it to firestore database */
// Schedule a local notification for mobile devices
async function scheduleLocalNotification(taskData) {
  if (!('Notification' in window)) return false;
  
  if (Notification.permission === 'granted') {
    const now = new Date();
    const taskTime = new Date(`${taskData.date}T${taskData.time}`);
    const timeUntilTask = taskTime - now;
    
    if (timeUntilTask > 0) {
      // Schedule the notification
      setTimeout(() => {
        const notification = new Notification('🔔 Task Reminder', {
          body: taskData.task,
          icon: '/images/icon-192x192.png',
          vibrate: [200, 100, 200, 100, 200, 100, 200]
        });
        
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }, timeUntilTask);
      
      return true;
    }
  }
  return false;
}

// Handle form submission
document.getElementById('task-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const task = document.getElementById('textarea').value.trim();
  const email = document.getElementById('user-email').value.trim();
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value.trim();

  // Validate all fields are filled
  if (task === '' || email === '' || date === '' || time === '') {
    Swal.fire({
      title: "Error!",
      text: "All fields must be completed!",
      timer: 2000,
      icon: "error",
      showConfirmButton: false
    });
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    Swal.fire({
      title: "Error!",
      text: "Please enter a valid email address!",
      timer: 2000,
      icon: "error",
      showConfirmButton: false
    });
    return;
  }

  // Parse date/time to ensure it's in the future
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':');
  const selectedDateTime = new Date(year, month - 1, day, hours, minutes);
  const now = new Date();

  if (selectedDateTime <= now) {
    Swal.fire({ 
      title: "Error!", 
      text: "Please select a future date and time!", 
      timer: 2000, 
      icon: "error", 
      showConfirmButton: false 
    });
    return;
  }
  
  showLoading();
  try {
    // Add the task to Firestore
    await addDoc(collection(db, 'tasks'), {
      task: task,
      email: email,
      date: date,
      time: time,
      completed: false,
      timestamp: serverTimestamp()
    });

    Swal.fire({
      title: "Great!",
      text: "Task successfully saved!",
      icon: "success",
      showConfirmButton: false,
      timer: 2000
    });

    // Clear the form fields
    document.getElementById('textarea').value = '';
    document.getElementById('date').value = '';
    document.getElementById('time').value = '';
    
  } catch (error) {
    console.error('Error adding task:', error);
    Swal.fire({
      title: "Error!",
      text: "Failed to save task. Please try again.",
      icon: "error",
      showConfirmButton: true
    });
  } finally {
    hideLoading();
  }
});

// Clear All button handler
document.getElementById('clearAll').addEventListener('click', async () => {
  const confirmed = await showConfirmation("This will clear the task description. Continue?");
  if (confirmed) {
    document.getElementById('textarea').value = '';
  }
});

// Hide tasks button handler
document.getElementById('hide-task').addEventListener('click', () => {
  document.getElementById('saved-tasks').style.display = 'none';
  document.getElementById('saved-tasks').innerHTML = '';
});

// Function to create a task element
function createTaskElement(taskData, docId) {
  const taskItem = document.createElement('div');
  taskItem.className = `task-item ${taskData.completed ? 'completed' : ''}`;
  taskItem.dataset.id = docId;

  // Create checkbox for task completion
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked = taskData.completed || false;
  
  // Create task content container
  const taskContent = document.createElement('div');
  taskContent.className = 'task-content';
  
  // Create task text
  const taskText = document.createElement('div');
  taskText.className = 'task-text';
  taskText.contentEditable = true;
  taskText.textContent = taskData.task;
  
  // Create task details container
  const taskDetails = document.createElement('div');
  taskDetails.className = 'task-details';
  
  // Add due date
  const dueDate = document.createElement('div');
  dueDate.className = 'task-detail';
  dueDate.innerHTML = `<i>📅</i> ${formatDate(taskData.date)}`;
  
  // Add due time
  const dueTime = document.createElement('div');
  dueTime.className = 'task-detail';
  dueTime.innerHTML = `<i>⏰</i> ${formatTime(taskData.time)}`;
  
  // Add email (if needed)
  const email = document.createElement('div');
  email.className = 'task-detail';
  email.innerHTML = `<i>✉️</i> ${taskData.email || 'No email'}`;
  
  // Add details to task details container
  taskDetails.appendChild(dueDate);
  taskDetails.appendChild(dueTime);
  if (taskData.email) taskDetails.appendChild(email);
  
  // Create delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.innerHTML = '🗑️';
  deleteBtn.title = 'Delete task';
  deleteBtn.setAttribute('aria-label', 'Delete task');
  
  // Task actions container
  const taskActions = document.createElement('div');
  taskActions.className = 'task-actions';
  taskActions.appendChild(deleteBtn);
  
  // Assemble the task item
  taskContent.appendChild(taskText);
  taskContent.appendChild(taskDetails);
  taskItem.appendChild(checkbox);
  taskItem.appendChild(taskContent);
  taskItem.appendChild(taskActions);
  
  // Add event listeners for the task item
  checkbox.addEventListener('change', async () => {
    showLoading();
    try {
      await updateDoc(doc(db, 'tasks', docId), {
        completed: checkbox.checked
      });
      taskItem.classList.toggle('completed', checkbox.checked);
    } catch (error) {
      console.error('Error updating task status:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update task status',
        icon: 'error'
      });
    } finally {
      hideLoading();
    }
  });
  
  taskText.addEventListener('blur', async () => {
    if (taskText.textContent.trim() !== taskData.task) {
      showLoading();
      try {
        await updateDoc(doc(db, 'tasks', docId), {
          task: taskText.textContent.trim()
        });
      } catch (error) {
        console.error('Error updating task:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to update task',
          icon: 'error'
        });
      } finally {
        hideLoading();
      }
    }
  });
  
  deleteBtn.addEventListener('click', async (e) => {
    e.preventDefault(); // Prevent default button behavior
    e.stopPropagation(); // Stop event bubbling
    
    const confirmed = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });
    
    if (confirmed.isConfirmed) {
      showLoading();
      try {
        await deleteDoc(doc(db, 'tasks', docId));
        taskItem.style.animation = 'fadeOut 0.3s ease';
        
        // Remove the task from the UI after animation
        setTimeout(() => {
          taskItem.remove();
          
          // Check if this was the last task
          const tasksContainer = document.querySelector('.tasks-container');
          if (tasksContainer && tasksContainer.children.length === 0) {
            const savedTasksDiv = document.getElementById('saved-tasks');
            savedTasksDiv.innerHTML = `
              <div class="no-tasks">
                <i>📝</i>
                <p>No tasks found for this email address.</p>
                <p>Add a new task to get started!</p>
              </div>`;
          }
        }, 280);
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Your task has been deleted.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error deleting task:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete task. Please try again.',
          icon: 'error',
          timer: 2000,
          showConfirmButton: false
        });
      } finally {
        hideLoading();
      }
    }
  });
  
  return taskItem;
}

// View tasks button handler
document.getElementById('view-task').addEventListener('click', async () => {
  const email = document.getElementById('user-email').value.trim();
  
  if (!email) {
    Swal.fire({
      title: 'Error!',
      text: 'Please enter your email address',
      icon: 'error',
      showConfirmButton: false,
      timer: 2000
    });
    return;
  }

  showLoading();
  
  try {
    const q = query(collection(db, 'tasks'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    const savedTasksDiv = document.getElementById('saved-tasks');
    savedTasksDiv.innerHTML = ''; // Clear existing tasks
    
    // Create a header for the task list
    const header = document.createElement('h2');
    header.textContent = 'Your Tasks';
    savedTasksDiv.appendChild(header);
    
    if (querySnapshot.empty) {
      savedTasksDiv.innerHTML = `
        <div class="no-tasks">
          <i>📝</i>
          <p>No tasks found for this email address.</p>
          <p>Add a new task to get started!</p>
        </div>`;
      savedTasksDiv.style.display = 'block';
      return;
    }
    
    // Create a container for the tasks
    const tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    
    // Process each task
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort tasks by date and time (earliest first)
    tasks.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA - dateB;
    });
    
    // Add each task to the container
    tasks.forEach(task => {
      const taskElement = createTaskElement(task, task.id);
      tasksContainer.appendChild(taskElement);
    });
    
    savedTasksDiv.appendChild(tasksContainer);
    savedTasksDiv.style.display = 'block';
    
    // Scroll to the task list
    savedTasksDiv.scrollIntoView({ behavior: 'smooth' });
    
  } catch (error) {
    console.error('Error fetching tasks:', error);
    Swal.fire({
      title: 'Error!',
      text: 'Failed to load tasks. Please try again.',
      icon: 'error',
      showConfirmButton: false,
      timer: 2000
    });
  } finally {
    hideLoading();
  }
});
