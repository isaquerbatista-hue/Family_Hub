// Aguarda o HTML da página carregar completamente antes de rodar o script
document.addEventListener('DOMContentLoaded', function() {
    
    // Procura a div do calendário na página atual
    var calendarEl = document.getElementById('calendario-familia');
    
    // Só tenta criar o calendário se a div existir (evita erros nas outras páginas)
    if (calendarEl) {
        var calendar = new FullCalendar.Calendar(calendarEl, {
            // Configurações iniciais
            initialView: 'dayGridMonth', // Mostra a visão mensal padrão
            locale: 'pt-br', // Traduz tudo para Português do Brasil
            height: 650, // Trava a altura para não quebrar o layout
            
            // Botões do cabeçalho do calendário
            headerToolbar: {
                left: 'prev,next today', // Setas e botão "Hoje"
                center: 'title', // Nome do mês
                right: 'dayGridMonth,timeGridWeek,listWeek' // Opções de visualização (Mês, Semana, Lista)
            },

            // As tarefas da sua família (Eventos)
            // No futuro, isso virá de um banco de dados
            events: [
                {
                    title: 'Lavar Louça (Filho 1)',
                    start: '2026-04-10',
                    color: '#FF9F89' // Cor salmão/laranja
                },
                {
                    title: 'Supermercado (Mãe)',
                    start: '2026-04-12',
                    color: '#3788D8' // Cor azul
                },
                {
                    title: 'Reunião de Família',
                    start: '2026-04-15T19:00:00', // Evento com horário específico
                    color: '#28A745' // Cor verde
                }
            ]
        });
        
        // Desenha o calendário na tela
        calendar.render();
    }

});

