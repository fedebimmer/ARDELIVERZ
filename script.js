(function() {
  const driverForm = document.getElementById('driver-form');
  const driverNameInput = document.getElementById('driver-name');
  const saveDriverBtn = document.getElementById('save-driver');
  const driverSaved = document.getElementById('driver-saved');
  const driverDisplay = document.getElementById('driver-display');
  const editDriverBtn = document.getElementById('edit-driver');

  const clientsList = document.getElementById('clients-list');
  const addClientBtn = document.getElementById('add-client');
  const startDeliveryBtn = document.getElementById('start-delivery');

  const activeRun = document.getElementById('active-run');
  const runInfo = document.getElementById('run-info');
  const runClients = document.getElementById('run-clients');
  const endDeliveryBtn = document.getElementById('end-delivery');

  const historyList = document.getElementById('history-list');
  const toast = document.getElementById('toast');

  let currentRun = null;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
  }

  function loadDriver() {
    const name = localStorage.getItem('driverName');
    if(name) {
      driverDisplay.textContent = name;
      driverForm.classList.add('hidden');
      driverSaved.classList.remove('hidden');
    }
  }

  function saveDriver() {
    const name = driverNameInput.value.trim();
    if(!name) return;
    localStorage.setItem('driverName', name);
    driverDisplay.textContent = name;
    driverForm.classList.add('hidden');
    driverSaved.classList.remove('hidden');
  }

  function editDriver() {
    driverForm.classList.remove('hidden');
    driverSaved.classList.add('hidden');
  }

  function addClientInput() {
    const count = clientsList.querySelectorAll('.client-input').length + 1;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'client-input text-input';
    input.placeholder = 'Cliente ' + count;
    clientsList.appendChild(input);
  }

  function startDelivery() {
    const name = localStorage.getItem('driverName');
    if(!name) {
      showToast('Inserisci il nome del fattorino');
      return;
    }
    const clientInputs = Array.from(clientsList.querySelectorAll('.client-input'));
    const clients = clientInputs.map(i => i.value.trim()).filter(i => i);
    if(clients.length === 0) {
      showToast('Inserisci almeno un cliente');
      return;
    }
    const startTime = new Date();
    currentRun = {
      driver: name,
      clients,
      start: startTime.toISOString()
    };
    localStorage.setItem('currentRun', JSON.stringify(currentRun));
    updateActiveRun();
    openWhatsApp('INIZIO GIRO CONSEGNE', currentRun);
    showToast('Giro consegne iniziato!');
  }

  function updateActiveRun() {
    const runData = currentRun || JSON.parse(localStorage.getItem('currentRun'));
    if(runData) {
      activeRun.classList.remove('hidden');
      runInfo.textContent = `Fattorino: ${runData.driver} - Iniziato il: ${new Date(runData.start).toLocaleString()}`;
      runClients.innerHTML = '';
      runData.clients.forEach(c => {
        const li = document.createElement('li');
        li.textContent = c;
        runClients.appendChild(li);
      });
      clientsList.querySelectorAll('.client-input').forEach(i => i.disabled = true);
      addClientBtn.disabled = true;
      startDeliveryBtn.disabled = true;
    } else {
      activeRun.classList.add('hidden');
      clientsList.querySelectorAll('.client-input').forEach(i => i.disabled = false);
      addClientBtn.disabled = false;
      startDeliveryBtn.disabled = false;
    }
  }

  function endDelivery() {
    if(!currentRun) currentRun = JSON.parse(localStorage.getItem('currentRun'));
    if(!currentRun) return;
    currentRun.end = new Date().toISOString();
    const history = JSON.parse(localStorage.getItem('history') || '[]');
    history.unshift(currentRun);
    localStorage.setItem('history', JSON.stringify(history));
    localStorage.removeItem('currentRun');
    updateActiveRun();
    loadHistory();
    openWhatsApp('RIEPILOGO GIRO CONSEGNE', currentRun);
    currentRun = null;
    showToast('Giro consegne concluso');
    clientsList.innerHTML = '';
    addClientInput();
    addClientInput();
  }

  function loadHistory() {
    historyList.innerHTML = '';
    const history = JSON.parse(localStorage.getItem('history') || '[]');
    if(history.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Nessuna consegna registrata';
      historyList.appendChild(li);
      return;
    }
    history.forEach(run => {
      const li = document.createElement('li');
      const start = new Date(run.start).toLocaleString();
      const end = run.end ? new Date(run.end).toLocaleString() : '';
      li.textContent = `${start} - ${run.driver} (${run.clients.join(', ')})` + (end ? ` fine: ${end}` : '');
      historyList.appendChild(li);
    });
  }

  function openWhatsApp(title, run) {
    const phone = '399399393799';
    const body = `${title}\nFattorino: ${run.driver}\nData e Ora Partenza: ${new Date(run.start).toLocaleString()}${run.end ? `\nData e Ora Fine: ${new Date(run.end).toLocaleString()}` : ''}\nClienti:\n- ${run.clients.join('\n- ')}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
  }

  saveDriverBtn.addEventListener('click', saveDriver);
  editDriverBtn.addEventListener('click', editDriver);
  addClientBtn.addEventListener('click', addClientInput);
  startDeliveryBtn.addEventListener('click', startDelivery);
  endDeliveryBtn.addEventListener('click', endDelivery);

  loadDriver();
  updateActiveRun();
  loadHistory();
})();
