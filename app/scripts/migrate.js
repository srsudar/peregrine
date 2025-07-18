// Migration script to move data from localStorage to chrome.storage
// This should be run once after upgrading from Manifest V2 to V3

async function migrateData() {
  // Check if migration has already been done
  const migrationStatus = await chrome.storage.local.get('migrationCompleted');
  
  if (migrationStatus.migrationCompleted) {
    console.log('Migration already completed');
    return;
  }

  // Get all localStorage data
  const localStorageData = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    localStorageData[key] = localStorage.getItem(key);
  }

  // Save to chrome.storage.local
  if (Object.keys(localStorageData).length > 0) {
    await chrome.storage.local.set(localStorageData);
    console.log('Migrated data:', localStorageData);
    
    // Clear localStorage after successful migration
    localStorage.clear();
  }

  // Mark migration as complete
  await chrome.storage.local.set({ migrationCompleted: true });
  console.log('Migration completed successfully');
}

// Run migration
migrateData();