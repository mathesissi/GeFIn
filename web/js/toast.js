// =============== Sistema de Notificações ===============
const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container';
document.body.appendChild(toastContainer);

function showSystemNotification(message, type = 'info', duration = 4000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = message;

  const progress = document.createElement('div');
  progress.className = 'toast-progress';
  const progressBar = document.createElement('div');
  progressBar.className = 'toast-progress-bar';
  progress.appendChild(progressBar);

  toast.appendChild(progress);
  toastContainer.appendChild(toast);

  // Animação da barra de progresso
  setTimeout(() => {
    progressBar.style.transition = `width ${duration}ms linear`;
    progressBar.style.width = '0%';
  }, 100);

  // Remoção automática
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// =============== Modal de Confirmação (substitui confirm) ===============
function showSystemConfirm(message) {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'system-confirm-backdrop';

    const box = document.createElement('div');
    box.className = 'system-confirm-box';
    box.innerHTML = `<p>${message}</p>`;

    const yesBtn = document.createElement('button');
    yesBtn.className = 'confirm';
    yesBtn.textContent = 'Confirmar';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel';
    cancelBtn.textContent = 'Cancelar';

    box.appendChild(yesBtn);
    box.appendChild(cancelBtn);
    backdrop.appendChild(box);
    document.body.appendChild(backdrop);

    yesBtn.onclick = () => {
      backdrop.remove();
      resolve(true);
    };
    cancelBtn.onclick = () => {
      backdrop.remove();
      resolve(false);
    };
  });
}
