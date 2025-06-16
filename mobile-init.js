// Check and request notification permission
async function checkNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}

// Register Service Worker and request notification permission when the page loads
document.addEventListener('DOMContentLoaded', async () => {
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  // Request notification permission
  const permission = await checkNotificationPermission();
  if (permission) {
    console.log('Notification permission granted');
    // If we just got permission, subscribe to push notifications
    if (Notification.permission === 'granted' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY' // Replace with your VAPID public key
        });
        console.log('Push subscription successful', subscription);
      } catch (error) {
        console.error('Failed to subscribe to push notifications:', error);
      }
    }
  } else {
    console.log('Notification permission denied');
  }

  // Handle app installed event
  window.addEventListener('appinstalled', () => {
    console.log('App was installed');
    // Show a welcome message
    Swal.fire({
      title: 'App Installed!',
      text: 'Thank you for installing Task Reminder App!',
      icon: 'success',
      timer: 3000,
      showConfirmButton: false
    });
  });

  // Add install prompt handling
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show install button
    showInstallPromotion();
  });

  function showInstallPromotion() {
    // Check if already shown
    if (document.querySelector('.install-button')) return;
    
    // Create install button
    const installButton = document.createElement('button');
    installButton.textContent = 'Install App';
    installButton.className = 'install-button';
    
    // Style the install button for mobile
    Object.assign(installButton.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: '1000',
      padding: '12px 24px',
      borderRadius: '25px',
      background: 'var(--primary-color, #4a90e2)',
      color: 'white',
      border: 'none',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    });
    
    installButton.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      // We've used the prompt, and can't use it again, throw it away
      deferredPrompt = null;
      // Hide the install button
      if (installButton.parentNode) {
        installButton.parentNode.removeChild(installButton);
      }
    });
    
    document.body.appendChild(installButton);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (installButton.parentNode) {
        installButton.style.opacity = '0';
        setTimeout(() => {
          if (installButton.parentNode) {
            installButton.parentNode.removeChild(installButton);
          }
        }, 500);
      }
    }, 10000);
  }
});
