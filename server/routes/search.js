import { Router } from 'express';
import { authenticateToken } from './auth.js';

const router = Router();
router.use(authenticateToken);

const PORTE_CONFIGS = {
  PEQUENO: {
    label: 'Pequeno Porte (15 a 1.000 clientes)',
    subscribersRange: '15 - 1.000',
    description: 'Provedores a partir de 15 clientes, início de rede, redes de bairro ou FTTH local',
    suggestedMaterials: 'Cabos Drop 1 FO (bobinas 1km), Conectores SC/APC, Caixas CTO 8/16FO e ONUs GPON de entrada'
  },
  MEDIO: {
    label: 'Médio Porte (1.000 a 10.000 clientes)',
    subscribersRange: '1.000 - 10.000',
    description: 'Provedores regionais consolidados, anéis ópticos e múltiplas cidades',
    suggestedMaterials: 'Cabos AS 12/24 FO, Caixas de Emenda 96FO, Roteadores Wi-Fi 6 Gigabit, ONUs Dual-Band e OLTs 8/16 portas'
  },
  GRANDE: {
    label: 'Grande Porte (+10.000 clientes)',
    subscribersRange: '+10.000',
    description: 'Grandes operadoras regionais, backbones de alta capacidade e ASN próprio',
    suggestedMaterials: 'Cabos AS/DDR 48/72 FO, Transceivers SFP+ 10G/40G, Splitters PLC desbalanceados e compras em escala de ONUs AX3000'
  }
};

const BRAZIL_STATES = [
  { uf: 'SP', name: 'São Paulo', ddd: '11', cities: ['São Paulo', 'Campinas', 'São José dos Campos', 'Ribeirão Preto', 'Sorocaba', 'Santos', 'São Bernardo do Campo', 'Guarulhos', 'Bauru', 'Piracicaba', 'Franca', 'Marília', 'Presidente Prudente', 'São Carlos', 'Americana', 'Taubaté'] },
  { uf: 'RJ', name: 'Rio de Janeiro', ddd: '21', cities: ['Rio de Janeiro', 'Niterói', 'Duque de Caxias', 'Nova Iguaçu', 'São Gonçalo', 'Petrópolis', 'Volta Redonda', 'Campos dos Goytacazes', 'Macaé', 'Cabo Frio', 'Angra dos Reis', 'Teresópolis'] },
  { uf: 'MG', name: 'Minas Gerais', ddd: '31', cities: ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Uberaba', 'Governador Valadares', 'Ipatinga', 'Divinópolis', 'Poços de Caldas', 'Patos de Minas', 'Pouso Alegre'] },
  { uf: 'CE', name: 'Ceará', ddd: '85', cities: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral', 'Crato', 'Itapipoca', 'Maranguape', 'Iguatu', 'Quixadá', 'Aquiraz', 'Canindé', 'Tianguá', 'Russas'] },
  { uf: 'BA', name: 'Bahia', ddd: '71', cities: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Juazeiro', 'Itabuna', 'Lauro de Freitas', 'Ilhéus', 'Jequié', 'Teixeira de Freitas', 'Alagoinhas', 'Barreiras', 'Porto Seguro'] },
  { uf: 'PR', name: 'Paraná', ddd: '41', cities: ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo', 'Guarapuava', 'Paranaguá', 'Toledo', 'Apucarana', 'Umuarama'] },
  { uf: 'RS', name: 'Rio Grande do Sul', ddd: '51', cities: ['Porto Alegre', 'Caxias do Sul', 'Canoas', 'Pelotas', 'Santa Maria', 'Gravataí', 'Viamão', 'Novo Hamburgo', 'São Leopoldo', 'Rio Grande', 'Passo Fundo', 'Erechim', 'Bento Gonçalves'] },
  { uf: 'SC', name: 'Santa Catarina', ddd: '48', cities: ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Chapecó', 'Itajaí', 'Criciúma', 'Jaraguá do Sul', 'Palhoça', 'Lages', 'Balneário Camboriú', 'Brusque', 'Tuburão'] },
  { uf: 'GO', name: 'Goiás', ddd: '62', cities: ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia', 'Águas Lindas de Goiás', 'Valparaíso de Goiás', 'Trindade', 'Formosa', 'Itumbiara', 'Jataí', 'Catalão'] },
  { uf: 'PE', name: 'Pernambuco', ddd: '81', cities: ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina', 'Paulista', 'Cabo de Santo Agostinho', 'Camaragibe', 'Garanhuns', 'Vitória de Santo Antão', 'Igarassu'] },
  { uf: 'DF', name: 'Distrito Federal', ddd: '61', cities: ['Brasília', 'Ceilândia', 'Taguatinga', 'Samambaia', 'Plano Piloto', 'Águas Claras', 'Guará', 'Gama', 'Sobradinho'] },
  { uf: 'ES', name: 'Espírito Santo', ddd: '27', cities: ['Vitória', 'Vila Velha', 'Serra', 'Cariacica', 'Cachoeiro de Itapemirim', 'Linhares', 'São Mateus', 'Colatina', 'Guarapari', 'Aracruz'] },
  { uf: 'PA', name: 'Pará', ddd: '91', cities: ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Parauapebas', 'Castanhal', 'Abaetetuba', 'Cametá', 'Marituba'] },
  { uf: 'MA', name: 'Maranhão', ddd: '98', cities: ['São Luís', 'Imperatriz', 'São José de Ribamar', 'Timon', 'Caxias', 'Codó', 'Paço do Lumiar', 'Açailândia', 'Bacabal'] },
  { uf: 'MT', name: 'Mato Grosso', ddd: '65', cities: ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra', 'Sorriso', 'Lucas do Rio Verde', 'Primavera do Leste'] },
  { uf: 'MS', name: 'Mato Grosso do Sul', ddd: '67', cities: ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã', 'Naviraí', 'Nova Andradina'] },
  { uf: 'RN', name: 'Rio Grande do Norte', ddd: '84', cities: ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba', 'Ceará-Mirim', 'Caicó'] },
  { uf: 'PB', name: 'Paraíba', ddd: '83', cities: ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux', 'Sousa', 'Cajazeiras', 'Cabedelo'] },
  { uf: 'AL', name: 'Alagoas', ddd: '82', cities: ['Maceió', 'Arapiraca', 'Rio Largo', 'Palmeira dos Índios', 'União dos Palmares', 'Penedo'] },
  { uf: 'PI', name: 'Piauí', ddd: '86', cities: ['Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Floriano', 'Barras', 'Campo Maior'] },
  { uf: 'SE', name: 'Sergipe', ddd: '79', cities: ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'São Cristóvão', 'Estância'] },
  { uf: 'AM', name: 'Amazonas', ddd: '92', cities: ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari', 'Tabatinga', 'Tefé'] },
  { uf: 'RO', name: 'Rondônia', ddd: '69', cities: ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal', 'Rolim de Moura'] },
  { uf: 'TO', name: 'Tocantins', ddd: '63', cities: ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins'] },
  { uf: 'AC', name: 'Acre', ddd: '68', cities: ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá'] },
  { uf: 'AP', name: 'Amapá', ddd: '96', cities: ['Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque'] },
  { uf: 'RR', name: 'Roraima', ddd: '95', cities: ['Boa Vista', 'Rorainópolis', 'Caracaraí', 'Pacaraima'] }
];

const ISP_PREFIXES = [
  'Ultra', 'Maxx', 'Speed', 'Fibra', 'Conecta', 'Giga', 'Link', 'Prime', 'Turbo',
  'Vanguarda', 'Nova', 'Alfa', 'Infinity', 'Global', 'Tech', 'Forte', 'Brasil',
  'Regional', 'Master', 'Top', 'Soluções', 'Mais', 'Óptica', 'Sinal', 'Rota',
  'Ponto', 'Via', 'Multi', 'Flash', 'Wave', 'Horizonte', 'União', 'Elite'
];

const ISP_SUFFIXES = [
  'Telecom', 'Fibra', 'Internet', 'Conectividade', 'Banda Larga', 'Redes',
  'Telecomunicações', 'Fibra Óptica', 'ISP Provedor', 'Net', 'Web'
];

const DECISOR_NAMES = [
  { name: 'Carlos Eduardo Mendes', role: 'Sócio-Diretor / Compras' },
  { name: 'Roberto Alencar', role: 'Gerente de Suprimentos & Telecom' },
  { name: 'Marcelo Silveira', role: 'Diretor de Operações (COO)' },
  { name: 'Amanda Cristina Rocha', role: 'Supervisora de Compras' },
  { name: 'Bruno Henrique Guimarães', role: 'Proprietário & CTO' },
  { name: 'Leandro Pires de Castro', role: 'Coordenador de Redes FTTH' },
  { name: 'Fernando Vasconcelos', role: 'Sócio-Fundador' },
  { name: 'Juliana Meireles', role: 'Gerente Geral de Compras' },
  { name: 'Thiago Barreto', role: 'Engenheiro Chefe de Telecom' },
  { name: 'Rodrigo Fontes', role: 'Diretor Executivo' }
];

const STREET_NAMES = [
  'Av. Brasil', 'Rua das Telecomunicações', 'Av. Presidente Vargas', 'Rua São Paulo',
  'Av. Getúlio Vargas', 'Rua 15 de Novembro', 'Av. Sete de Setembro', 'Rua Marechal Deodoro',
  'Av. Industrial', 'Rua Santos Dumont', 'Av. Rio Branco', 'Rua Bahia', 'Av. Independência'
];

const NEIGHBORHOODS = [
  'Centro', 'Distrito Industrial', 'Jardim América', 'Vila Nova', 'Planalto',
  'Bela Vista', 'Parque das Nações', 'São Cristóvão', 'Setor Comercial', 'Bairro dos Estados'
];

function generateCnpj() {
  const n = (len = 8) => Math.floor(Math.random() * Math.pow(10, len)).toString().padStart(len, '0');
  const d = Math.floor(10 + Math.random() * 89);
  return `${n(2)}.${n(3)}.${n(3)}/0001-${d}`;
}

function generatePhone(ddd) {
  const num = Math.floor(30000000 + Math.random() * 69999999);
  return `(${ddd}) ${num.toString().slice(0, 4)}-${num.toString().slice(4)}`;
}

function generateWhatsApp(ddd) {
  const num = Math.floor(980000000 + Math.random() * 19999999);
  return `(${ddd}) ${num.toString().slice(0, 5)}-${num.toString().slice(5)}`;
}

// GET /api/search/states - Lista estados e cidades disponíveis
router.get('/states', (req, res) => {
  res.json(BRAZIL_STATES);
});

// GET /api/search/portes - Lista portes e detalhes de demanda
router.get('/portes', (req, res) => {
  res.json(PORTE_CONFIGS);
});

// POST /api/search/generate - Gerador Massivo de Provedores de Internet
router.post('/generate', (req, res) => {
  try {
    const { state, city, porte, count = 50 } = req.body;

    const requestedCount = Math.min(Math.max(parseInt(count, 10) || 50, 10), 2000);

    const stateObj = BRAZIL_STATES.find(s => s.uf === state) || BRAZIL_STATES[0];
    const citiesPool = city && city !== 'ALL' ? [city] : stateObj.cities;

    const portesPool = porte && porte !== 'ALL' && PORTE_CONFIGS[porte] 
      ? [porte] 
      : ['PEQUENO', 'MEDIO', 'GRANDE'];

    const generated = [];

    for (let i = 0; i < requestedCount; i++) {
      const selectedPorte = portesPool[i % portesPool.length];
      const selectedCity = citiesPool[i % citiesPool.length];
      const pConfig = PORTE_CONFIGS[selectedPorte];

      const prefix = ISP_PREFIXES[(i * 3 + Math.floor(Math.random() * 5)) % ISP_PREFIXES.length];
      const suffix = ISP_SUFFIXES[(i * 2 + Math.floor(Math.random() * 3)) % ISP_SUFFIXES.length];
      const tradeName = `${prefix}${suffix} ${selectedCity.split(' ')[0]}`;
      const companyName = `${prefix}${suffix} Telecomunicações e Internet Ltda`;

      const decisor = DECISOR_NAMES[(i + Math.floor(Math.random() * 3)) % DECISOR_NAMES.length];
      const street = STREET_NAMES[i % STREET_NAMES.length];
      const neighborhood = NEIGHBORHOODS[i % NEIGHBORHOODS.length];
      const number = String(Math.floor(100 + (i * 37) % 3800));

      let subscribersCount = 500;
      let estimatedSubscribers = '500 assinantes';
      let asn = 'Não possui (Trânsito IP / PTT)';

      if (selectedPorte === 'PEQUENO') {
        subscribersCount = Math.floor(15 + Math.random() * 985);
        estimatedSubscribers = `~${subscribersCount} assinantes ativos`;
        asn = Math.random() > 0.85 ? `AS${260000 + Math.floor(Math.random() * 9000)}` : 'Não possui (Trânsito IP / PTT)';
      } else if (selectedPorte === 'MEDIO') {
        subscribersCount = Math.floor(1200 + Math.random() * 8500);
        estimatedSubscribers = `~${subscribersCount.toLocaleString('pt-BR')} assinantes ativos`;
        asn = `AS${261000 + Math.floor(Math.random() * 8000)}`;
      } else {
        subscribersCount = Math.floor(11000 + Math.random() * 45000);
        estimatedSubscribers = `+${subscribersCount.toLocaleString('pt-BR')} assinantes ativos`;
        asn = `AS${52000 + Math.floor(Math.random() * 20000)}`;
      }

      const domain = `${prefix.toLowerCase()}${suffix.toLowerCase().replace(/\s+/g, '')}.net.br`;

      const lead = {
        id: `isp_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 6)}`,
        porte: selectedPorte,
        porteLabel: pConfig.label,
        tradeName,
        companyName,
        cnpj: generateCnpj(),
        asn,
        estimatedSubscribers,
        subscribersCount,
        contactPerson: decisor.name,
        contactRole: decisor.role,
        phone: generatePhone(stateObj.ddd),
        whatsapp: generateWhatsApp(stateObj.ddd),
        email: `compras@${domain}`,
        website: `https://www.${domain}`,
        street,
        number,
        neighborhood,
        city: selectedCity,
        state: stateObj.uf,
        cep: `${stateObj.ddd}000-${Math.floor(100 + Math.random() * 899)}`,
        materialDemand: pConfig.suggestedMaterials,
        status: 'NOVO',
        currentDistributor: null,
        callCount: 0,
        lastCallAt: null,
        notes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      generated.push(lead);
    }

    res.json({
      count: generated.length,
      state: stateObj.name,
      uf: stateObj.uf,
      leads: generated
    });
  } catch (err) {
    console.error('Erro ao gerar provedores:', err);
    res.status(500).json({ error: 'Erro ao gerar provedores.' });
  }
});

export default router;
