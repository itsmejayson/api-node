// This file contains the JavaScript code for the frontend application, handling user interactions and making API calls to the backend.

document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('userForm');
    const userList = document.getElementById('userList');

    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(userForm);
        const userData = Object.fromEntries(formData);

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                const newUser = await response.json();
                addUserToList(newUser);
                userForm.reset();
            } else {
                console.error('Error creating user:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    const addUserToList = (user) => {
        const li = document.createElement('li');
        li.textContent = `${user.name} (${user.email})`;
        userList.appendChild(li);
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users');
            if (response.ok) {
                const users = await response.json();
                users.forEach(addUserToList);
            } else {
                console.error('Error fetching users:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    fetchUsers();
});