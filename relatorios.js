import { calcularPontuacaoDeRespostas } from './scoring.js';

const CONFIG = window.QUESTIONARIO_CONFIG || {};

// ============================================================================
// LÓGICA DE NEGÓCIO - Cópia Fiel do app.js para Garantia de Integridade
// ============================================================================

function classificarEstagio(percentual) {
    if (percentual >= 75) return 'Alto';
    if (percentual >= 60) return 'Médio/Alto';
    if (percentual >= 45) return 'Médio';
    if (percentual >= 30) return 'Baixo/Médio';
    return 'Baixo';
}

function gerarRecomendacoes(r) {
    const rec = {
        INPUT: [], RESIDUOS: [], OUTPUT: [], VIDA: [], MONITORAMENTO: []
    };
    // INPUT (Q1)
    if (r[1] === 1) {
        rec.INPUT.push('Migrar gradualmente para matérias recicladas ou renováveis (metas trimestrais).');
        rec.INPUT.push('Mapear fornecedores com certificações e rastreabilidade de insumos.');
    } else if (r[1] === 5) {
        rec.INPUT.push('Realizar auditoria de materiais e origem dos insumos.');
        rec.INPUT.push('Implantar rastreio básico de fornecedores (contratos e comprovantes).');
    } else {
        rec.INPUT.push('Manter nível atual e ampliar participação de materiais com menor impacto.');
    }
    // RESÍDUOS (Q2)
    if (r[2] === 1) {
        rec.RESIDUOS.push('Redirecionar fluxos de resíduos para reciclagem e reuso.');
        rec.RESIDUOS.push('Firmar parceria com recicladores locais e cooperativas.');
    } else if (r[2] === 3) {
        rec.RESIDUOS.push('Avançar para recuperação material antes da energética quando possível.');
        rec.RESIDUOS.push('Aprimorar segregação e triagem para aumentar reciclabilidade.');
    } else {
        rec.RESIDUOS.push('Otimizar triagem, documentação e rastreabilidade de resíduos.');
    }
    // OUTPUT (Q3..Q6)
    if (r[3] !== 1) rec.OUTPUT.push('Aplicar design para desmonte e facilitar separação de materiais.');
    if (r[4] !== 1) rec.OUTPUT.push('Aumentar reciclabilidade dos materiais e simplificar composições.');
    if (r[5] === 1) rec.OUTPUT.push('Evitar descarte em aterro, planejar reuso e reciclagem.');
    if (r[6] === 1) rec.OUTPUT.push('Avaliar alternativas à recuperação energética priorizando reciclagem.');
    if (rec.OUTPUT.length === 0) rec.OUTPUT.push('Manter práticas e validar reciclabilidade com testes periódicos.');
    // VIDA (Q7..Q9)
    if (r[7] !== 1) rec.VIDA.push('Testar durabilidade e estabelecer garantias claras.');
    if (r[8] !== 1) rec.VIDA.push('Projetar para reparo e disponibilizar peças/guia de manutenção.');
    if (r[9] !== 1) rec.VIDA.push('Criar programas de reuso e reaproveitamento pós-uso.');
    if (rec.VIDA.length === 0) rec.VIDA.push('Fortalecer comunicação de durabilidade e reparabilidade ao cliente.');
    // MONITORAMENTO (Q10..Q12)
    if (r[10] !== 1) rec.MONITORAMENTO.push('Oferecer serviços pós-venda (limpeza, manutenção, recolhimento).');
    if (r[11] !== 1) rec.MONITORAMENTO.push('Implementar rastreio (QR Code, passaporte digital) para ciclo de vida.');
    if (r[12] !== 1) rec.MONITORAMENTO.push('Disponibilizar documentação clara ao consumidor (materiais, certificações).');
    if (rec.MONITORAMENTO.length === 0) rec.MONITORAMENTO.push('Integrar dados de ciclo de vida ao CRM e suporte técnico.');
    return rec;
}

// Mapeamento inverso para converter colunas do DB (materia_prima, etc) para IDs de questão (1, 2...)
// Necessário porque scoring.js espera {1: val, 2: val...}
const DB_TO_QID = {
    'materia_prima': 1,
    'residuos': 2,
    'desmonte': 3,
    'descarte': 4,
    'recuperacao': 5,
    'reciclagem': 6,
    'durabilidade': 7,
    'reparavel': 8,
    'reaproveitavel': 9,
    'ciclo_estendido': 10,
    'ciclo_rastreado': 11,
    'documentacao': 12
};

function converterLinhaParaRespostas(row) {
    const respostas = {};
    for (const [col, id] of Object.entries(DB_TO_QID)) {
        if (row[col] !== undefined) {
            respostas[id] = row[col];
        }
    }
    return respostas;
}

// ============================================================================
// FUNCIONALIDADES DA PÁGINA
// ============================================================================

let allReports = [];

async function inicializar() {
    if (!window.supabase) {
        mostrarStatus('Erro: Supabase SDK não encontrado.', true);
        return;
    }

    const { createClient } = window.supabase;
    const client = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

    mostrarStatus('Carregando relatórios...', false);

    try {
        // Buscar questionários com dados da empresa (JOIN)
        // Isso requer que a Foreign Key esteja configurada corretamente no Supabase
        const { data, error } = await client
            .from('questionarios')
            .select(`
                *,
                empresas (
                    id, nome_empresa, cnpj, nome_responsavel, email, setor_economico, produto_avaliado
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        allReports = data || [];
        renderizarTabela(allReports);
        mostrarStatus('', false); // Limpa msg

        // Setup search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allReports.filter(r =>
                (r.empresas?.nome_empresa || '').toLowerCase().includes(term) ||
                (r.empresas?.cnpj || '').includes(term)
            );
            renderizarTabela(filtered);
        });

    } catch (err) {
        console.error(err);
        mostrarStatus(`Erro ao carregar dados: ${err.message}. Verifique se executou o script SQL de permissões.`, true);
    }
}

function mostrarStatus(msg, isError) {
    const el = document.getElementById('statusMessage');
    if (!msg) {
        el.classList.add('hidden');
        return;
    }
    el.classList.remove('hidden', 'bg-red-50', 'text-red-700', 'bg-blue-50', 'text-blue-700');
    el.textContent = msg;
    if (isError) {
        el.classList.add('bg-red-50', 'text-red-700');
    } else {
        el.classList.add('bg-blue-50', 'text-blue-700');
    }
}

function renderizarTabela(lista) {
    const tbody = document.getElementById('reportsTableBody');
    const footer = document.getElementById('footerInfo');
    tbody.innerHTML = '';

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-gray-400">Nenhum relatório encontrado.</td></tr>`;
        footer.textContent = '0 registros';
        return;
    }

    footer.textContent = `${lista.length} relatórios encontrados`;

    lista.forEach(item => {
        const empresa = item.empresas || {};
        const dataCriacao = new Date(item.created_at).toLocaleString('pt-BR');

        // Recalcular índices para garantir precisão visual
        const respostas = converterLinhaParaRespostas(item);
        const calculo = calcularPontuacaoDeRespostas(respostas);
        const estagio = classificarEstagio(calculo.percentual);

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 border-b border-gray-50 transition-colors';
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-gray-500">${dataCriacao}</td>
            <td class="px-6 py-4 font-medium text-gray-900">${empresa.nome_empresa || 'Sem Nome'}</td>
            <td class="px-6 py-4 text-gray-500">${empresa.cnpj || '-'}</td>
            <td class="px-6 py-4 text-center">
                <span class="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                    ${calculo.percentual}%
                </span>
            </td>
            <td class="px-6 py-4 text-center">
                <span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    ${calculo.maturidade}%
                </span>
            </td>
            <td class="px-6 py-4 text-right">
                <button class="btn-visualizar text-emerald-600 hover:text-emerald-800 font-medium text-sm flex items-center justify-end gap-1 ml-auto" data-id="${item.id}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    Visualizar
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Add events
    document.querySelectorAll('.btn-visualizar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id'); // currentTarget pega o botão mesmo clicando no icone
            abrirRelatorio(id);
        });
    });
}

// ============================================================================
// VISUALIZAÇÃO E DOWNLOAD
// ============================================================================

function abrirRelatorio(id) {
    const item = allReports.find(r => r.id === id);
    if (!item) return;

    const respostas = converterLinhaParaRespostas(item);
    const calculo = calcularPontuacaoDeRespostas(respostas);
    const recs = gerarRecomendacoes(respostas);
    const empresa = item.empresas || {};
    const estagio = classificarEstagio(calculo.percentual);
    const potencial = 100 - calculo.percentual;
    const dataStr = new Date(item.created_at).toLocaleString('pt-BR');

    // Usar o ID do banco ou um random se preferir, aqui usaremos o ID curto
    const idRelatorio = item.id.split('-')[0]; // Primeiros 8 chars do UUID

    // 1. Gerar HTML do Relatório (Baseado no app.js)
    const reportHTML = `
        <div class="p-8 max-w-4xl mx-auto" id="printableArea">
            <div class="mb-6 flex justify-between items-start">
                <div>
                    <h2 class="text-3xl font-bold text-gray-900">Relatório Completo de Circularidade</h2>
                    <p class="text-sm text-gray-500">ID do Relatório: <span class="font-mono">#${idRelatorio}</span> · Gerado em ${dataStr}</p>
                </div>
                <img src="logo.png" alt="Cosmo" class="h-12 w-auto opacity-80"> 
            </div>

            <div class="grid md:grid-cols-2 gap-6 mb-8">
                <!-- Dados da Empresa -->
                <div class="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <h3 class="font-semibold text-slate-900 mb-2">Empresa</h3>
                    <div class="text-sm text-slate-700 space-y-1">
                        <p><span class="font-semibold">Nome:</span> ${empresa.nome_empresa || '-'} </p>
                        <p><span class="font-semibold">CNPJ:</span> ${empresa.cnpj || '-'} </p>
                        <p><span class="font-semibold">Responsável:</span> ${empresa.nome_responsavel || '-'} </p>
                        <p><span class="font-semibold">E-mail:</span> ${empresa.email || '-'} </p>
                        <p><span class="font-semibold">Setor:</span> ${empresa.setor_economico || '-'} </p>
                        <p><span class="font-semibold">Produto:</span> ${empresa.produto_avaliado || '-'} </p>
                    </div>
                </div>

                <!-- Resultado -->
                <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <h3 class="font-semibold text-emerald-900 mb-2">Resultado do Diagnóstico</h3>
                    
                    <div class="flex flex-col md:flex-row gap-6 mb-4">
                        <div class="flex-1 space-y-1">
                            <p class="text-sm text-emerald-800">Pontuação Total: <span class="font-bold">${calculo.pontos}</span> de ${calculo.totalPossivel} pontos</p>
                            <p class="text-sm text-emerald-800">Índice de Circularidade: <span class="font-bold">${calculo.percentual}%</span></p>
                            <p class="text-sm text-emerald-800">Maturidade Estruturante: <span class="font-bold">${calculo.maturidade}%</span></p>
                            <p class="text-sm text-emerald-800">Estágio: <span class="font-bold">${estagio}</span></p>
                        </div>
                        <div class="flex-shrink-0 flex justify-center items-center">
                            <div style="width: 140px; height: 140px; position: relative;">
                                <canvas id="chartRelatorioModal"></canvas>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-3">
                        <div class="w-full bg-emerald-100 rounded-full h-2">
                            <div class="bg-emerald-600 h-2 rounded-full" style="width: ${calculo.percentual}%"></div>
                        </div>
                        <p class="text-xs text-emerald-700 mt-2 text-center">Circularidade: ${calculo.percentual}% · Potencial: ${potencial}%</p>
                    </div>

                    <div class="mt-4 grid grid-cols-5 gap-2">
                        ${Object.entries(calculo.grupos).map(([nome, perc]) => `
                            <div class="text-center bg-white border border-emerald-200 rounded p-1">
                                <div class="text-[10px] text-gray-500 uppercase">${nome.substring(0, 3)}</div>
                                <div class="text-sm font-bold text-emerald-700">${perc}%</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Recomendações -->
            <div class="space-y-6">
                <div>
                    <h3 class="text-lg font-semibold text-gray-900">Recomendações Personalizadas</h3>
                    <div class="mt-3 grid md:grid-cols-2 gap-4">
                        ${renderRecommendationCard('Entradas', 'blue', recs.INPUT)}
                        ${renderRecommendationCard('Resíduos', 'orange', recs.RESIDUOS)}
                        ${renderRecommendationCard('Saídas', 'indigo', recs.OUTPUT)}
                        ${renderRecommendationCard('Vida Útil', 'teal', recs.VIDA)}
                        ${renderRecommendationCard('Monitoramento', 'slate', recs.MONITORAMENTO, true)}
                    </div>
                </div>
            </div>
            
            <div class="mt-8 pt-4 border-t text-center text-xs text-gray-400">
                Documento gerado automaticamente pelo Sistema CosmoBrasil.
            </div>
        </div>
    `;

    // 2. Injetar no Modal
    document.getElementById('reportContent').innerHTML = reportHTML;
    document.getElementById('reportModal').classList.remove('hidden');

    // 3. Renderizar Gráfico
    setTimeout(() => {
        const ctx = document.getElementById('chartRelatorioModal');
        if (ctx) {
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Índice', 'Potencial'],
                    datasets: [{
                        data: [calculo.percentual, potencial],
                        backgroundColor: ['#10b981', '#e5e7eb'],
                        borderWidth: 0,
                        cutout: '70%'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                },
                plugins: [{
                    id: 'centerText',
                    beforeDraw: function (chart) {
                        const width = chart.width;
                        const height = chart.height;
                        const ctx = chart.ctx;
                        ctx.restore();

                        const fontSize = (height / 114).toFixed(2);
                        ctx.font = 'bold ' + fontSize + 'em sans-serif';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = '#10b981';

                        const text = calculo.percentual + '%';
                        const textX = Math.round((width - ctx.measureText(text).width) / 2);
                        const textY = height / 2;

                        ctx.fillText(text, textX, textY);
                        ctx.save();
                    }
                }]
            });
        }
    }, 100);

    // 4. Configurar Botões de Download

    // PDF (Imprimir para PDF do navegador)
    document.getElementById('btnDownloadPDF').onclick = () => {
        const conteudo = document.getElementById('printableArea').innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`
            <html>
                <head>
                    <title>Relatorio_${empresa.nome_empresa || 'Empresa'}</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        @page { size: A4; margin: 10mm; }
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    </style>
                </head>
                <body class="p-6">
                    ${conteudo}
                    <script>
                        // Esperar um pouco para styles carregarem (tailwind CDN)
                        setTimeout(() => { window.print(); window.close(); }, 500);
                    </script>
                </body>
            </html>
        `);
    };

    // HTML (Download do arquivo)
    document.getElementById('btnDownloadHTML').onclick = () => {
        const htmlContent = document.getElementById('printableArea').innerHTML;
        const fullHtml = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório Circularidade</title><script src="https://cdn.tailwindcss.com"></script><style>body{padding:2rem;max-width:900px;margin:0 auto;font-family:sans-serif;}</style></head><body>${htmlContent}</body></html>`;
        const blob = new Blob([fullHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Relatorio_${empresa.nome_empresa || 'Circularidade'}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
}

function renderRecommendationCard(title, color, items, fullWidth) {
    if (!items || items.length === 0) return '';
    const colorClasses = {
        blue: 'bg-blue-50 border-blue-200 text-blue-900',
        orange: 'bg-orange-50 border-orange-200 text-orange-900',
        indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
        teal: 'bg-teal-50 border-teal-200 text-teal-900',
        slate: 'bg-slate-50 border-slate-200 text-slate-900'
    };
    const bgClass = colorClasses[color] || colorClasses.slate;
    const colSpan = fullWidth ? 'md:col-span-2' : '';

    return `
        <div class="${bgClass} border rounded-lg p-4 ${colSpan}">
            <h4 class="font-bold mb-2">${title}</h4>
            <ul class="text-sm space-y-1 list-disc list-inside opacity-90">
                ${items.map(i => `<li>${i}</li>`).join('')}
            </ul>
        </div>
    `;
}

// Iniciar (Removido auto-start para aguardar login)
// window.addEventListener('load', inicializar);

// Expor para o HTML chamar após login
window.inicializarRelatorios = inicializar;
