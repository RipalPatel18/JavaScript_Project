

document.addEventListener('DOMContentLoaded', () => {
  // DOM elements caching
  const addItemForm = document.getElementById('addItemForm');
  const wardrobeDisplay = document.getElementById('wardrobeDisplay');
  const messageModal = document.getElementById('messageModal');
  const modalMessage = document.getElementById('modalMessage');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalConfirmBtn = document.getElementById('modalConfirmBtn');
  const modalButtonsContainer = document.getElementById('modalButtons');

  // Load wardrobe items from localStorage or initialize empty array
  let wardrobeItems = JSON.parse(localStorage.getItem('wardrobeItems')) || [];

  // Variable to hold the item to delete on confirmation
  let itemToDeleteId = null;

  /**
   * Show modal popup with message.
   * If 'confirm' parameter is true, show Confirm and Close buttons.
   * Otherwise, show only Close button.
   */
  const showModal = (message, confirm = false) => {
    modalMessage.textContent = message;

    if (confirm) {
      modalConfirmBtn.classList.remove('hidden');
      modalCloseBtn.textContent = 'Cancel';
    } else {
      modalConfirmBtn.classList.add('hidden');
      modalCloseBtn.textContent = 'Close';
    }

    messageModal.classList.remove('hidden');
    modalCloseBtn.focus();
  };

  // Hide modal popup and reset deletion state
  const hideModal = () => {
    messageModal.classList.add('hidden');
    itemToDeleteId = null;
  };

  // Save wardrobe items array to localStorage
  const saveWardrobeItems = () => {
    localStorage.setItem('wardrobeItems', JSON.stringify(wardrobeItems));
  };

  /**
   * Render a single wardrobe item card
   * Includes image, name, type, color, season, and delete button
   */
  const renderWardrobeItem = (item) => {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('wardrobe-item');
    itemDiv.dataset.id = item.id;

    // Add item card content with additional details for better UX
    itemDiv.innerHTML = `
      <img class="item-image" src="${item.image}" alt="${item.name}"/>
      <p title="${item.name}">${item.name}</p>
      <p class="item-details" title="Type">${item.type}</p>
      <p class="item-details" title="Color">${item.color}</p>
      <p class="item-details" title="Season">${item.season}</p>
      <button class="delete-item-btn" aria-label="Remove ${item.name}">Remove</button>
    `;

    // Attach delete button click listener with confirmation popup
    itemDiv.querySelector('.delete-item-btn').addEventListener('click', () => {
      itemToDeleteId = item.id;
      showModal(`Are you sure you want to remove "${item.name}" from your wardrobe?`, true);
    });

    wardrobeDisplay.appendChild(itemDiv);
  };

  // Clear and render all wardrobe items
  const renderAllWardrobeItems = () => {
    wardrobeDisplay.innerHTML = '';
    wardrobeItems.forEach(renderWardrobeItem);
  };

  /**
   * Basic form validation showing inline error messages.
   * Returns true if all fields valid, else false.
   */
  const validateForm = () => {
    let isValid = true;

    // Helper to set or clear error messages
    const setError = (input, message) => {
      const errorSpan = input.nextElementSibling;
      if (message) {
        errorSpan.textContent = message;
        isValid = false;
      } else {
        errorSpan.textContent = '';
      }
    };

    const itemNameInput = document.getElementById('itemName');
    const itemTypeSelect = document.getElementById('itemType');
    const itemColorInput = document.getElementById('itemColor');
    const itemSeasonSelect = document.getElementById('itemSeason');
    const itemImageInput = document.getElementById('itemImage');

    setError(itemNameInput, itemNameInput.value.trim() === '' ? 'Please enter an item name.' : '');
    setError(itemTypeSelect, itemTypeSelect.value === '' ? 'Please select a type.' : '');
    setError(itemColorInput, itemColorInput.value.trim() === '' ? 'Please enter a color.' : '');
    setError(itemSeasonSelect, itemSeasonSelect.value === '' ? 'Please select a season.' : '');
    setError(itemImageInput, itemImageInput.files.length === 0 ? 'Please select an image.' : '');

    return isValid;
  };

  // Handle form submission to add new item
  addItemForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate form fields before proceeding
    if (!validateForm()) {
      showModal('Please fix the errors in the form before submitting.');
      return;
    }

    const itemName = document.getElementById('itemName').value.trim();
    const itemType = document.getElementById('itemType').value;
    const itemColor = document.getElementById('itemColor').value.trim();
    const itemSeason = document.getElementById('itemSeason').value;
    const itemImageFile = document.getElementById('itemImage').files[0];

    // Read image file as Data URL for storage/display
    const reader = new FileReader();
    reader.onload = (event) => {
      const newItem = {
        id: Date.now().toString(),
        name: itemName,
        type: itemType,
        color: itemColor,
        season: itemSeason,
        image: event.target.result
      };

      wardrobeItems.push(newItem);
      saveWardrobeItems();
      renderWardrobeItem(newItem);
      addItemForm.reset();
      showModal('Item added to wardrobe successfully!');
    };

    reader.readAsDataURL(itemImageFile);
  });

  // Modal close button handler
  modalCloseBtn.addEventListener('click', () => {
    hideModal();
  });

  // Modal confirm button handler for deleting items
  modalConfirmBtn.addEventListener('click', () => {
    if (itemToDeleteId) {
      wardrobeItems = wardrobeItems.filter(item => item.id !== itemToDeleteId);
      saveWardrobeItems();
      renderAllWardrobeItems();
      showModal('Item successfully removed from your wardrobe!');
      itemToDeleteId = null;
    }
  });

  // Close modal if clicking outside modal content
  messageModal.addEventListener('click', (e) => {
    if (e.target === messageModal) {
      hideModal();
    }
  });

  // Close modal on ESC key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !messageModal.classList.contains('hidden')) {
      hideModal();
    }
  });

  // Initial render of saved wardrobe items
  renderAllWardrobeItems();
});
