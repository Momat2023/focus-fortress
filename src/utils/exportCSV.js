export const exportToCSV = (sessions, userId) => {
  if (sessions.length === 0) {
    alert('Aucune session à exporter');
    return;
  }

  // Headers
  const headers = ['Type', 'Durée (min)', 'Date', 'Heure', 'Statut', 'Interrompue'];
  
  // Données
  const rows = sessions.map(session => {
    const status = session.completed ? 'Complétée' : session.interrupted ? 'Interrompue' : 'En cours';
    const date = session.startTime ? session.startTime.toLocaleDateString('fr-FR') : 'N/A';
    const time = session.startTime ? session.startTime.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }) : 'N/A';
    
    return [
      session.type || 'pomodoro',
      session.duration || 0,
      date,
      time,
      status,
      session.interrupted ? 'Oui' : 'Non'
    ];
  });

  // Créer le CSV
  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += headers.join(',') + '\n';
  
  rows.forEach(row => {
    csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
  });

  // Télécharger
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  
  const fileName = `focus-fortress-${userId}-${new Date().toISOString().split('T')[0]}.csv`;
  link.setAttribute('download', fileName);
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  console.log('✅ CSV exporté:', fileName);
};

