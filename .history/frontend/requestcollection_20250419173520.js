// requestCollection.js

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken'); // Assuming you store token in local storage

    try {
        // Fetch user's waste entries
        const response = await fetch('/api/waste-collection/entries', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const wasteEntries = await response.json();
        if (response.ok) {
            displayWasteEntries(wasteEntries);
        } else {
            document.getElementById('statusMsg').textContent = 'Failed to fetch waste entries.';
        }
    } catch (error) {
        console.error('Error fetching waste entries:', error);
        document.getElementById('statusMsg').textContent = 'An error occurred. Please try again.';
    }
});

function displayWasteEntries(entries) {
    const listContainer = document.getElementById('wasteEntriesList');
    listContainer.innerHTML = ''; // Clear existing entries

    entries.forEach(entry => {
        if (entry.status === 'Pending') {
            const entryDiv = document.createElement('div');
            entryDiv.classList.add('waste-entry');
            entryDiv.innerHTML = `
                <h3>${entry.description}</h3>
                <p>Status: ${entry.status}</p>
                <button class="btn-request" onclick="requestCollection(${entry.id})">Request Collection</button>
            `;
            listContainer.appendChild(entryDiv);
        }
    });
}

async function requestCollection(entryId) {
    const token = localStorage.getItem('authToken');
    
    try {
        const response = await fetch('/api/waste-collection/request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ waste_entry_id: entryId })
        });

        const result = await response.json();
        if (response.ok) {
            document.getElementById('statusMsg').textContent = result.message;
            document.getElementById('statusMsg').style.color = 'green';
            // Optionally, refresh the list of waste entries
        } else {
            document.getElementById('statusMsg').textContent = result.message;
            document.getElementById('statusMsg').style.color = 'red';
        }
    } catch (error) {
        console.error('Error requesting collection:', error);
        document.getElementById('statusMsg').textContent = 'An error occurred. Please try again.';
        document.getElementById('statusMsg').style.color = 'red';
    }
}
