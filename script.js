document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const addDestinationBtn = document.getElementById('add-destination-btn');
    const destinationList = document.getElementById('destination-list');
    const randomDestinationBtn = document.getElementById('random-destination-btn'); // Get random button here

    // Modals
    const addModal = document.getElementById('add-modal');
    const editModal = document.getElementById('edit-modal');
    const deleteModal = document.getElementById('delete-modal');
    const achievementModal = document.getElementById('achievement-modal');
    const recommendModal = document.getElementById('recommend-modal');

    // Forms
    const addForm = document.getElementById('add-form');
    const editForm = document.getElementById('edit-form');
    const achievementForm = document.getElementById('achievement-form');

    // Form Inputs (Add)
    const destNameInput = document.getElementById('dest-name');
    const destNotesInput = document.getElementById('dest-notes');

    // Form Inputs (Edit)
    const editDestIdInput = document.getElementById('edit-dest-id');
    const editDestNameInput = document.getElementById('edit-dest-name');
    const editDestNotesInput = document.getElementById('edit-dest-notes');
    const editSaveChangesBtn = document.getElementById('edit-save-changes-btn');
    const editMarkReachedBtn = document.getElementById('edit-mark-reached-btn');
    const editViewDetailsBtn = document.getElementById('edit-view-details-btn');
    const editDeleteBtn = document.getElementById('edit-delete-btn');
    const editRecommendBtn = document.getElementById('edit-recommend-btn');

    // Form Inputs (Delete)
    const deleteDestIdInput = document.getElementById('delete-dest-id');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

    // Form Inputs (Achievement)
    const achievementDestIdInput = document.getElementById('achievement-dest-id');
    const achievementDestNameInput = document.getElementById('achievement-dest-name');
    const achievementDestNameDisplay = document.getElementById('achievement-dest-name-display');
    const arrivalDateInput = document.getElementById('arrival-date');
    const companionsInput = document.getElementById('companions');
    const reflectionsInput = document.getElementById('reflections');
    const editingAchievementIdInput = document.getElementById('editing-achievement-id');
    const achievementSaveBtn = document.getElementById('achievement-save-btn');
    const achievementCancelBtn = document.getElementById('achievement-cancel-btn');
    const achievementModalTitleH2 = document.getElementById('achievement-modal-title-h2');

    // Recommendation Modal Elements
    const recommendModalTitle = document.getElementById('recommend-modal-title');
    const recommendList = document.getElementById('recommend-list');
    const recommendLoading = document.getElementById('recommend-loading');
    const recommendError = document.getElementById('recommend-error');
    const recommendEmpty = document.getElementById('recommend-empty');

    // Ranking Elements
    const tabsContainer = document.querySelector('.ranking-section .tabs');
    const tabLinks = document.querySelectorAll('.ranking-section .tab-link');
    const tabContents = document.querySelectorAll('.ranking-section .tab-content');
    const dailyRankingList = document.getElementById('daily-ranking-list');
    const monthlyRankingList = document.getElementById('monthly-ranking-list');

    // --- Helper Functions ---
    const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

    const loadDestinations = () => {
        try {
            const storedDestinations = localStorage.getItem('destinations');
            return storedDestinations ? JSON.parse(storedDestinations) : [];
        } catch (e) {
            console.error("Error loading or parsing destinations from localStorage:", e);
            return []; // Return empty array on error
        }
    };

    const loadAchievements = () => {
        try {
            const storedAchievements = localStorage.getItem('achievements');
            return storedAchievements ? JSON.parse(storedAchievements) : [];
        } catch (e) {
            console.error("Error loading or parsing achievements from localStorage:", e);
            return []; // Return empty array on error
        }
    };

    // --- Data Storage ---
    let destinations = loadDestinations();
    let achievements = loadAchievements();

    const saveDestinations = () => {
        try {
            localStorage.setItem('destinations', JSON.stringify(destinations));
        } catch (e) {
            console.error("Error saving destinations to localStorage:", e);
            alert("Could not save destinations. LocalStorage might be full or disabled.");
        }
    };

     const saveAchievements = () => {
        try {
            localStorage.setItem('achievements', JSON.stringify(achievements));
        } catch (e) {
            console.error("Error saving achievements to localStorage:", e);
             alert("Could not save achievements. LocalStorage might be full or disabled.");
        }
    };


    // --- Modal Handling ---
    window.openModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        } else {
            console.error(`Modal with ID "${modalId}" not found.`);
        }
    };

    window.closeModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
             modal.style.display = 'none';
             // Reset achievement modal form/title when closing it specifically
             if (modalId === 'achievement-modal') {
                if (achievementForm) achievementForm.reset();
                if (editingAchievementIdInput) editingAchievementIdInput.value = '';
                if (achievementModalTitleH2) { // Check if element exists
                    achievementModalTitleH2.textContent = 'Record Achievement';
                }
                if (achievementSaveBtn) achievementSaveBtn.textContent = 'Save Achievement';
             }
             // Optionally clear recommendation modal on close too
             if (modalId === 'recommend-modal') {
                 if (recommendList) recommendList.innerHTML = '';
                 if (recommendLoading) recommendLoading.style.display = 'none';
                 if (recommendError) recommendError.style.display = 'none';
                 if (recommendEmpty) recommendEmpty.style.display = 'none';
                 if (recommendModalTitle) {
                     recommendModalTitle.textContent = 'Recommended Places';
                 }
             }
        } else {
             console.error(`Modal with ID "${modalId}" not found for closing.`);
        }
    };

    // Close modal if clicking outside content
    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    };

    // --- Destination Rendering (Added data-reached attribute) ---
    const renderDestinations = () => {
        if (!destinationList) {
            console.error("Destination list element not found.");
            return;
        }
        destinationList.innerHTML = ''; // Clear existing list

        if (!Array.isArray(destinations)) {
            console.error("Destinations data is not an array:", destinations);
            destinations = [];
        }

        const sortedDestinations = [...destinations].sort((a, b) => {
            const aReached = typeof a?.reached === 'boolean' ? a.reached : false;
            const bReached = typeof b?.reached === 'boolean' ? b.reached : false;
            if (aReached === bReached) return 0;
            return aReached ? 1 : -1;
        });

        if (sortedDestinations.length === 0) {
             destinationList.innerHTML = '<li class="empty-list-placeholder">No destinations added yet. Click the "+" button to add one!</li>';
             return;
        }


        sortedDestinations.forEach(dest => {
            if (!dest || typeof dest.id === 'undefined' || typeof dest.name === 'undefined') {
                console.warn("Skipping invalid destination object:", dest);
                return;
            }
            const isReached = typeof dest?.reached === 'boolean' ? dest.reached : false; // Safe check

            const listItem = document.createElement('li');
            listItem.classList.add('destination-item');
            listItem.classList.add(isReached ? 'reached' : 'not-reached');
            listItem.dataset.id = dest.id;
            listItem.dataset.reached = isReached; // <<<--- ADDED THIS LINE

            const cardContentDiv = document.createElement('div');
            cardContentDiv.className = 'card-content';

            const title = document.createElement('h3');
            title.textContent = dest.name;
            cardContentDiv.appendChild(title);

            if (dest.notes) {
                 const notesP = document.createElement('p');
                 notesP.textContent = dest.notes;
                 cardContentDiv.appendChild(notesP);
            }
            listItem.appendChild(cardContentDiv);


            // Actions Div
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'card-actions';

            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.title = 'Edit / View Details';
            editBtn.innerHTML = '<i class="material-icons">edit</i>';
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openEditModal(dest.id);
            });
            actionsDiv.appendChild(editBtn);

            if (!isReached) { // Only show delete/reach if not reached
                 const deleteBtn = document.createElement('button');
                 deleteBtn.className = 'delete-btn';
                 deleteBtn.title = 'Mark Reached / Delete';
                 deleteBtn.innerHTML = '<i class="material-icons">delete</i>';
                 deleteBtn.addEventListener('click', (e) => {
                     e.stopPropagation();
                     openDeleteModal(dest.id);
                 });
                 actionsDiv.appendChild(deleteBtn);

                 // Optional: Long-press (commented out for brevity, original code was correct)
                 // let pressTimer;
                 // listItem.addEventListener('touchstart', ...);
                 // listItem.addEventListener('touchend', ...);
                 // listItem.addEventListener('touchmove', ...);
            }

            listItem.appendChild(actionsDiv);
            destinationList.appendChild(listItem);
        });
    };


    // --- Destination CRUD Functions ---
    const addDestination = (name, notes) => {
        const newDestination = {
            id: generateId(),
            name: name,
            notes: notes,
            reached: false
        };
        destinations.push(newDestination);
        saveDestinations();
        renderDestinations();
    };

    const updateDestination = (id, name, notes) => {
        const index = destinations.findIndex(dest => dest.id === id);
        if (index !== -1) {
            destinations[index].name = name;
            destinations[index].notes = notes;
            saveDestinations();
            renderDestinations();
        } else {
            console.warn(`Destination with ID ${id} not found for update.`);
        }
    };

    const initiateMarkAsReached = (id) => {
         const destination = destinations.find(dest => dest.id === id);
         if (destination && !destination.reached) {
             openAchievementModal(id);
         } else if (destination && destination.reached) {
             console.log("Destination already marked as reached.");
         } else {
             console.error("Destination not found for marking as reached:", id);
         }
         // Close the modal that triggered this action
         if (deleteModal && deleteModal.style.display === 'block') {
            closeModal('delete-modal');
         }
          if (editModal && editModal.style.display === 'block') {
            closeModal('edit-modal');
         }
    };

    const deleteDestinationPermanently = (id) => {
        const destName = destinations.find(d=>d.id === id)?.name || 'this destination';
        if (window.confirm(`Are you sure you want to permanently delete "${destName}"? Associated achievements will also be deleted. This cannot be undone.`)) {
            destinations = destinations.filter(dest => dest.id !== id);
            achievements = achievements.filter(ach => ach.destinationId !== id);
            saveAchievements();
            saveDestinations();

            const itemToRemove = destinationList?.querySelector(`.destination-item[data-id="${id}"]`); // Safety check
            if (itemToRemove) {
                itemToRemove.classList.add('shrinking');
                itemToRemove.addEventListener('animationend', () => {
                    renderDestinations();
                    displayRankings('daily'); // Update rankings
                    displayRankings('monthly');
                }, { once: true });
            } else {
                 renderDestinations(); // Re-render anyway
                 displayRankings('daily');
                 displayRankings('monthly');
            }
        }
    };


    // --- Modal Opening Functions ---
    const openEditModal = (id) => {
        const destination = destinations.find(dest => dest.id === id);
        if (destination) {
            // Check if edit modal elements exist
            if (!editDestIdInput || !editDestNameInput || !editDestNotesInput || !editMarkReachedBtn || !editViewDetailsBtn || !editDeleteBtn || !editRecommendBtn || !editSaveChangesBtn ) {
                 console.error("One or more elements missing in the edit modal.");
                 return;
            }
            editDestIdInput.value = destination.id;
            editDestNameInput.value = destination.name;
            editDestNotesInput.value = destination.notes;

            const isReached = typeof destination?.reached === 'boolean' ? destination.reached : false; // Safe check

            // Control visibility of buttons based on 'reached' status
            if (isReached) {
                editMarkReachedBtn.style.display = 'none';
                editViewDetailsBtn.style.display = 'inline-block'; // Show View Details
            } else {
                editMarkReachedBtn.style.display = 'inline-block'; // Show Mark as Reached
                editViewDetailsBtn.style.display = 'none';
            }

            openModal('edit-modal');
        } else {
             console.warn(`Destination with ID ${id} not found for editing.`);
        }
    };

     const openDeleteModal = (id) => {
        const destination = destinations.find(dest => dest.id === id);
        if (destination && !destination.reached) { // Only allow if not already reached
            const markReachedRadio = document.getElementById('mark-reached');
            const deletePermRadio = document.getElementById('delete-permanently');
            if (!deleteDestIdInput || !markReachedRadio || !deletePermRadio || !confirmDeleteBtn) {
                 console.error("One or more elements missing in the delete modal.");
                 return;
            }
            deleteDestIdInput.value = id;
            markReachedRadio.checked = true;
            deletePermRadio.checked = false;
            // Reset confirm button style initially
            confirmDeleteBtn.classList.remove('btn-danger');
            confirmDeleteBtn.classList.add('btn-success'); // Default is 'Mark Reached'
            openModal('delete-modal');
        } else if (destination && destination.reached) {
             alert("This destination has already been reached. Edit it to view details.");
        } else {
             console.warn(`Destination with ID ${id} not found for delete/mark reached action.`);
        }
    };

    // Opens Achievement Modal for NEW achievement
    const openAchievementModal = (destinationId) => {
        const destination = destinations.find(dest => dest.id === destinationId);
        if (destination) {
            if (!achievementForm || !editingAchievementIdInput || !achievementDestIdInput || !achievementDestNameInput || !achievementDestNameDisplay || !arrivalDateInput || !achievementModalTitleH2 || !achievementSaveBtn || !companionsInput || !reflectionsInput) {
                 console.error("One or more elements missing in the achievement modal for new entry.");
                 return;
            }
            achievementForm.reset();
            editingAchievementIdInput.value = '';
            achievementDestIdInput.value = destination.id;
            achievementDestNameInput.value = destination.name;
            achievementDestNameDisplay.textContent = destination.name;

            const today = new Date().toISOString().split('T')[0];
            arrivalDateInput.value = today;

            achievementModalTitleH2.textContent = 'Record Achievement';
            achievementSaveBtn.textContent = 'Save Achievement';

            openModal('achievement-modal');
        } else {
            console.error("Destination not found for achievement:", destinationId);
            alert("Could not find the destination to record achievement.");
        }
    };

    // Opens Achievement Modal for EDITING existing achievement
    const openAchievementModalForEdit = (achievement) => {
        if (!achievement || !achievement.id) {
            console.warn("Invalid achievement object passed to openAchievementModalForEdit:", achievement);
            return;
        };

        if (!achievementForm || !editingAchievementIdInput || !achievementDestIdInput || !achievementDestNameInput || !achievementDestNameDisplay || !arrivalDateInput || !companionsInput || !reflectionsInput || !achievementModalTitleH2 || !achievementSaveBtn) {
            console.error("One or more elements missing in the achievement modal for editing.");
            return;
        }

        achievementForm.reset();
        editingAchievementIdInput.value = achievement.id;
        achievementDestIdInput.value = achievement.destinationId;
        achievementDestNameInput.value = achievement.destinationName || '';
        achievementDestNameDisplay.textContent = achievement.destinationName || 'N/A';

        arrivalDateInput.value = achievement.arrivalDate || '';
        companionsInput.value = achievement.companions || '';
        reflectionsInput.value = achievement.reflections || '';

        achievementModalTitleH2.textContent = 'Edit Achievement';
        achievementSaveBtn.textContent = 'Update Achievement';

        openModal('achievement-modal');
    };

    // --- Event Listeners ---
    if (addDestinationBtn) {
        addDestinationBtn.addEventListener('click', () => {
            if(addForm) addForm.reset();
            openModal('add-modal');
        });
    } else {
        console.error("Add destination button not found.");
    }

    if (addForm) {
        addForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!destNameInput || !destNotesInput) {
                console.error("Add form inputs not found.");
                return;
            }
            const name = destNameInput.value.trim();
            const notes = destNotesInput.value.trim();
            if (name) {
                addDestination(name, notes);
                closeModal('add-modal');
            } else {
                alert("Destination name cannot be empty.");
            }
        });
    } else {
         console.error("Add destination form not found.");
    }

    // --- Edit Modal Button Listeners ---
    if (editSaveChangesBtn) {
        editSaveChangesBtn.addEventListener('click', () => {
            const id = editDestIdInput?.value;
            const name = editDestNameInput?.value.trim();
            const notes = editDestNotesInput?.value.trim();
            if (id && name) {
                updateDestination(id, name, notes);
                closeModal('edit-modal');
            } else if (!id) {
                console.error("Cannot save changes: Destination ID is missing.");
                 alert("Error: Cannot save changes. Destination ID missing.");
            } else {
                 alert("Destination name cannot be empty.");
            }
        });
    } else {
        console.error("Edit save changes button not found.");
    }

     if (editMarkReachedBtn) {
         editMarkReachedBtn.addEventListener('click', () => {
            const id = editDestIdInput?.value;
            const name = editDestNameInput?.value.trim();
            const notes = editDestNotesInput?.value.trim();

            if (id && name) {
                 updateDestination(id, name, notes);
                 initiateMarkAsReached(id);
            } else if (!id) {
                 console.error("Cannot mark as reached: Destination ID is missing.");
                 alert("Error: Cannot mark as reached. Destination ID missing.");
            } else {
                 alert("Destination name cannot be empty.");
            }
        });
     } else {
         console.error("Edit mark reached button not found.");
     }


     if (editDeleteBtn) {
         editDeleteBtn.addEventListener('click', () => {
            const id = editDestIdInput?.value;
            if (id) {
                deleteDestinationPermanently(id); // This function includes confirmation
                closeModal('edit-modal'); // Close edit modal after initiating delete
            } else {
                console.error("Cannot delete: Destination ID is missing.");
                 alert("Error: Cannot delete. Destination ID missing.");
            }
        });
     } else {
        console.error("Edit delete button not found.");
     }

     if (editViewDetailsBtn) {
        editViewDetailsBtn.addEventListener('click', () => {
            const destinationId = editDestIdInput?.value;
            if (destinationId) {
                const existingAchievement = achievements.find(ach => ach && ach.destinationId === destinationId);
                if (existingAchievement) {
                    openAchievementModalForEdit(existingAchievement);
                    closeModal('edit-modal');
                } else {
                    alert('Error: Achievement details not found for this destination.');
                    console.error("No achievement found for reached destination:", destinationId);
                }
            } else {
                console.error("Cannot view details: Destination ID is missing.");
                 alert("Error: Cannot view details. Destination ID missing.");
            }
        });
     } else {
         console.error("Edit view details button not found.");
     }

    // --- Delete Confirmation Modal Listener ---

    // Add listener for radio buttons changing to update button style
    const deleteActionRadios = document.querySelectorAll('#delete-modal input[name="delete-action"]');
    deleteActionRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (confirmDeleteBtn) {
                if (radio.value === 'delete' && radio.checked) {
                    confirmDeleteBtn.classList.remove('btn-success');
                    confirmDeleteBtn.classList.add('btn-danger');
                } else if (radio.value === 'reached' && radio.checked) {
                    confirmDeleteBtn.classList.remove('btn-danger');
                    confirmDeleteBtn.classList.add('btn-success');
                }
            }
        });
    });

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            const id = deleteDestIdInput?.value;
            const selectedActionInput = document.querySelector('input[name="delete-action"]:checked');

            if (!id) {
                console.error("Cannot confirm action: Destination ID is missing from delete modal.");
                closeModal('delete-modal');
                 alert("Error: Cannot confirm action. Destination ID missing.");
                return;
            }

            if (!selectedActionInput) {
                 console.error("No action selected in delete modal.");
                 alert("Please select an action (Mark as Reached or Delete Permanently).");
                 return;
            }

            const selectedAction = selectedActionInput.value;

            if (selectedAction === 'reached') {
                initiateMarkAsReached(id);
            } else if (selectedAction === 'delete') {
                deleteDestinationPermanently(id);
                closeModal('delete-modal'); // Close after initiating delete
            }
        });
    } else {
        console.error("Confirm delete button not found.");
    }

    // --- UPDATED Achievement Form Submit Listener ---
    if (achievementForm) {
        achievementForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!achievementDestIdInput || !achievementDestNameInput || !arrivalDateInput || !companionsInput || !reflectionsInput || !editingAchievementIdInput) {
                console.error("One or more achievement form inputs are missing.");
                return;
            }

            const destinationId = achievementDestIdInput.value;
            const destinationName = achievementDestNameInput.value;
            const arrivalDate = arrivalDateInput.value;
            const companions = companionsInput.value.trim();
            const reflections = reflectionsInput.value.trim();
            const editingId = editingAchievementIdInput.value;

            if (!destinationId || !arrivalDate) {
                 alert('Destination and arrival date are required.');
                 return;
            }

            if (editingId) {
                // UPDATE EXISTING ACHIEVEMENT
                const achIndex = achievements.findIndex(ach => ach.id === editingId);
                if (achIndex !== -1) {
                    achievements[achIndex] = {
                        ...achievements[achIndex],
                        destinationName: destinationName,
                        arrivalDate: arrivalDate,
                        companions: companions,
                        reflections: reflections,
                    };
                    saveAchievements();
                    closeModal('achievement-modal');
                    displayRankings('daily');
                    displayRankings('monthly');
                    alert('Achievement updated!');
                } else {
                    alert('Error updating achievement: Original record not found.');
                    console.error("Could not find achievement to update with ID:", editingId);
                    closeModal('achievement-modal');
                }
            } else {
                // CREATE NEW ACHIEVEMENT
                const newAchievement = {
                    id: generateId(),
                    destinationId: destinationId,
                    destinationName: destinationName,
                    arrivalDate: arrivalDate,
                    companions: companions,
                    reflections: reflections,
                    timestamp: new Date().toISOString()
                };
                achievements.push(newAchievement);
                saveAchievements();

                // MARK DESTINATION AS REACHED
                const destIndex = destinations.findIndex(d => d.id === destinationId);
                if (destIndex !== -1) {
                    if (!destinations[destIndex].reached) {
                        destinations[destIndex].reached = true;
                        saveDestinations();
                    }
                } else {
                    console.error("Destination not found to mark as reached after saving achievement:", destinationId)
                }

                closeModal('achievement-modal');
                renderDestinations(); // Re-render destinations
                displayRankings('daily');
                displayRankings('monthly');
                alert('Achievement saved!');
            }
        });
    } else {
         console.error("Achievement form not found.");
    }

    // Listener for the Achievement Cancel Button
    if (achievementCancelBtn) {
        achievementCancelBtn.addEventListener('click', () => {
            closeModal('achievement-modal');
        });
    } else {
        console.error("Achievement cancel button not found.");
    }


    // --- Ranking System Logic ---
    const calculateRankings = (period) => {
        const now = new Date();
        const todayUTCString = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString().split('T')[0];
        const currentMonth = now.getUTCMonth();
        const currentYear = now.getUTCFullYear();

        let relevantAchievements = [];

        try {
            if (period === 'daily') {
                 relevantAchievements = achievements.filter(ach => ach?.timestamp?.startsWith(todayUTCString));
            } else if (period === 'monthly') {
                 relevantAchievements = achievements.filter(ach => {
                     if (!ach?.timestamp) return false;
                     try {
                        const achDate = new Date(ach.timestamp);
                        if (isNaN(achDate.getTime())) return false;
                        return achDate.getUTCMonth() === currentMonth && achDate.getUTCFullYear() === currentYear;
                     } catch (e) {
                         console.error("Error parsing achievement timestamp:", ach.timestamp, e);
                         return false;
                     }
                });
            }
        } catch (error) {
             console.error("Error filtering achievements for ranking:", error);
             return [];
        }

        const userScores = relevantAchievements.reduce((scores, ach) => {
             let user = ach.companions?.trim() || 'Solo Traveler';
             if (!scores[user]) {
                 scores[user] = { count: 0, firstTimestamp: ach.timestamp };
             }
             scores[user].count = (scores[user].count || 0) + 1;
             if (!scores[user].firstTimestamp || ach.timestamp < scores[user].firstTimestamp) {
                 scores[user].firstTimestamp = ach.timestamp;
             }
             return scores;
        }, {});

        const sortedUsers = Object.entries(userScores)
            .map(([user, data]) => ({ user, count: data.count, firstTimestamp: data.firstTimestamp }))
            .sort((a, b) => {
                if (b.count !== a.count) return b.count - a.count;
                try {
                    const dateA = new Date(a.firstTimestamp);
                    const dateB = new Date(b.firstTimestamp);
                    if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
                    if (isNaN(dateA.getTime())) return 1;
                    if (isNaN(dateB.getTime())) return -1;
                    return dateA - dateB;
                } catch(e) {
                    console.error("Error comparing achievement timestamps for sorting:", a.firstTimestamp, b.firstTimestamp, e);
                    return 0;
                }
            });

        return sortedUsers;
    };


    const displayRankings = (period) => {
        const listElement = period === 'daily' ? dailyRankingList : monthlyRankingList;
        if (!listElement) {
             console.error(`Ranking list element not found for period: ${period}`);
             return;
        }
        listElement.innerHTML = '<li>Loading...</li>';

        setTimeout(() => {
            try {
                const rankedUsers = calculateRankings(period);
                listElement.innerHTML = '';

                if (rankedUsers.length === 0) {
                    listElement.innerHTML = `<li>No achievements recorded for this period yet.</li>`;
                    return;
                }

                rankedUsers.slice(0, 10).forEach((entry, index) => {
                    const listItem = document.createElement('li');
                    const count = entry.count || 0;
                    const visitText = count === 1 ? 'visit' : 'visits';
                    listItem.textContent = `${entry.user || 'Unknown User'} (${count} ${visitText})`;
                    listItem.title = `${entry.user || 'Unknown User'} (${count} ${visitText})`;
                    listElement.appendChild(listItem);
                });
            } catch (error) {
                 console.error(`Error displaying ${period} rankings:`, error);
                 listElement.innerHTML = `<li>Error loading rankings.</li>`;
            }
        }, 0);
    };

    // --- Tab Switching Logic ---
    if (tabsContainer) {
        tabsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-link')) {
                const targetTab = e.target.dataset.tab;
                if (!targetTab) return;

                if (tabLinks) tabLinks.forEach(link => link.classList.remove('active'));
                e.target.classList.add('active');

                if (tabContents) {
                    tabContents.forEach(content => {
                        content.classList.remove('active');
                        if (content.id === targetTab) content.classList.add('active');
                    });
                }
                 displayRankings(targetTab.startsWith('daily') ? 'daily' : 'monthly');
            }
        });
    } else {
        console.error("Tabs container not found.");
    }

    // --- Recommendation Feature Logic ---
    const fetchRecommendations = (destinationName) => {
        // Call our local proxy server instead of SerpApi directly
        const proxyUrl = `http://localhost:3001/recommendations?destinationName=${encodeURIComponent(destinationName)}`;

        return new Promise((resolve, reject) => {
            fetch(proxyUrl)
                .then(response => {
                    if (!response.ok) {
                        // Try to get error message from proxy response
                        return response.json().then(errData => {
                           throw new Error(errData?.error || `Proxy error! status: ${response.status}`);
                        }).catch(() => {
                            // Fallback if parsing error response fails
                            throw new Error(`Proxy error! status: ${response.status}`);
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    // The proxy now returns the top_sights object,
                    // which should contain a 'sights' array.
                    if (data && Array.isArray(data.sights)) {
                        resolve(data.sights); // Resolve with the array of sights
                    } else {
                         // Handle cases where the proxy might return an unexpected format or no sights
                         console.warn("Received no sights or unexpected data format from proxy for:", destinationName, data);
                         resolve([]); // Resolve with empty array if no sights found
                    }
                })
                .catch(error => {
                    console.error("Error fetching recommendations via proxy:", error);
                    reject(error); // Reject the promise with the error
                });
        });
    };

    // Updated to display Top Sights
    const displayRecommendations = (destinationName, sights) => {
        if (!recommendModalTitle || !recommendList || !recommendLoading || !recommendError || !recommendEmpty) return;
        recommendModalTitle.textContent = `Top Sights for ${destinationName}`; // Updated title
        recommendList.innerHTML = '';
        recommendLoading.style.display = 'none';
        recommendError.style.display = 'none';
        recommendEmpty.style.display = 'none';

        if (!sights || sights.length === 0) {
            recommendEmpty.textContent = `No top sights found for "${destinationName}".`; // Updated message
            recommendEmpty.style.display = 'block';
            return;
        }

        sights.forEach(sight => {
            const li = document.createElement('li');
            li.classList.add('recommendation-item'); // Reuse class for styling consistency

            // Content Div - Now the main container within the li
            const contentDiv = document.createElement('div');
            contentDiv.classList.add('recommendation-content');

            // Title
            const titleSpan = document.createElement('span');
            titleSpan.classList.add('recommendation-title');
            titleSpan.textContent = sight.title || 'Unknown Sight';
            contentDiv.appendChild(titleSpan);

            // Rating & Reviews (optional)
            if (sight.rating) {
                const ratingDiv = document.createElement('div');
                ratingDiv.classList.add('recommendation-rating');
                let ratingText = `⭐ ${sight.rating}`;
                if (sight.reviews) {
                    ratingText += ` (${sight.reviews} reviews)`;
                }
                ratingDiv.textContent = ratingText;
                contentDiv.appendChild(ratingDiv);
            }

            // Description (optional)
            if (sight.description) {
                const descP = document.createElement('p');
                descP.classList.add('recommendation-description');
                descP.textContent = sight.description;
                contentDiv.appendChild(descP);
            }

            li.appendChild(contentDiv); // Add content to the list item

            // Append the list item directly to the list (no link wrapping)
            recommendList.appendChild(li);
        });
    };

    if (editRecommendBtn) {
        editRecommendBtn.addEventListener('click', () => {
            if (!editDestNameInput) {
                console.error("Destination name input not found in edit modal.");
                 alert("Error: Cannot get destination name.");
                return;
            }
            const destinationName = editDestNameInput.value.trim();
            if (!destinationName) {
                alert("Please enter a destination name first.");
                return;
            }
            if (!recommendList || !recommendLoading || !recommendError || !recommendEmpty || !recommendModalTitle) {
                 console.error("Cannot open recommendation modal: one or more elements are missing.");
                 alert("Error: Cannot display recommendations modal.");
                 return;
            }

            recommendList.innerHTML = '';
            recommendLoading.style.display = 'block';
            recommendError.style.display = 'none';
            recommendEmpty.style.display = 'none';
            recommendModalTitle.textContent = `Fetching for ${destinationName}...`;
            openModal('recommend-modal');

            fetchRecommendations(destinationName)
                .then(recommendations => displayRecommendations(destinationName, recommendations))
                .catch(error => {
                    console.error("Error fetching recommendations:", error);
                    if (!recommendLoading || !recommendError || !recommendEmpty || !recommendList || !recommendModalTitle) return;
                    recommendLoading.style.display = 'none';
                    recommendError.textContent = `Could not fetch recommendations. ${error.message || ''}`;
                    recommendError.style.display = 'block';
                    recommendEmpty.style.display = 'none';
                    recommendList.innerHTML = '';
                    recommendModalTitle.textContent = `Error`;
                });
        });
    } else {
        console.error("Recommend button (#edit-recommend-btn) not found in the DOM.");
    }

    // --- NEW Random Destination Button Logic ---
    if (randomDestinationBtn) {
        let isProcessingRandom = false; // Flag to prevent multiple clicks

        randomDestinationBtn.addEventListener('click', () => {
            if (isProcessingRandom) return; // Exit if already processing

            const allDestinationItems = destinationList?.querySelectorAll('li.destination-item'); // Select only actual items
            if (!allDestinationItems || allDestinationItems.length === 0) {
                alert('Please add some destinations first!');
                return;
            }

            // Filter for unreached destinations using the data-reached attribute
            const unreached = Array.from(allDestinationItems).filter(dest => dest.dataset.reached === 'false');

            if (unreached.length === 0) {
                alert('All destinations have been marked as reached!');
                return; // Exit if none are unreached
            }

            // --- Confirmation Dialog ---
            const proceed = window.confirm(`Randomly select an unreached destination?`);
            if (!proceed) {
                return; // Exit if user cancels
            }

            // --- Start Processing ---
            isProcessingRandom = true;
            randomDestinationBtn.disabled = true; // Optionally disable button during animation

            // Reset any previous highlights/marquees from all items
            allDestinationItems.forEach(dest => {
                dest.classList.remove('highlight', 'marquee', 'temp-marquee');
            });

            // Apply scanning effect to all unreached destinations
            unreached.forEach(dest => dest.classList.add('temp-marquee'));

            // --- Delay for Scanning Effect ---
            const scanTime = 1500; // ms - How long the scanning effect lasts
            const highlightDelay = 200; // ms - Brief delay before adding final marquee

            setTimeout(() => {
                // Remove scanning effect from all unreached
                unreached.forEach(dest => dest.classList.remove('temp-marquee'));

                // Select the random destination
                const randomIndex = Math.floor(Math.random() * unreached.length);
                const selectedDestination = unreached[randomIndex];

                // Add highlight immediately
                selectedDestination.classList.add('highlight');
                selectedDestination.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Scroll into view

                // --- Brief delay, then add final marquee ---
                setTimeout(() => {
                    selectedDestination.classList.add('marquee');

                    // --- Finish Processing ---
                    isProcessingRandom = false; // Allow clicks again
                    randomDestinationBtn.disabled = false; // Re-enable button
                }, highlightDelay);

            }, scanTime);
        });
    } else {
        console.error('Random destination button (#random-destination-btn) not found.');
    }

    // --- Initial Render ---
    try {
        renderDestinations();
        displayRankings('daily');
        displayRankings('monthly');
    } catch (error) {
        console.error("Error during initial render:", error);
        if (destinationList) {
            destinationList.innerHTML = '<li class="empty-list-placeholder">Error loading destinations. Please refresh.</li>';
        }
    }


});
