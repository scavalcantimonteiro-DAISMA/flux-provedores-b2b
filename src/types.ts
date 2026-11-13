export type UserRole = 'admin' | 'vendedor';

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  active?: boolean;
  createdAt?: string;
  metrics?: {
    totalLeads: number;
    totalCalls: number;
    quotesSent: number;
    scheduledVisits: number;
    closedDeals: number;
  };
}

export type IspPorte = 'PEQUENO' | 'MEDIO' | 'GRANDE';

export type LeadStatus = 
  | 'NOVO' 
  | 'CONTATO_REALIZADO' 
  | 'COTACAO_ENVIADA' 
  | 'AMOSTRA_AGENDADA' 
  | 'VISITA_AGENDADA' 
  | 'OUTRO_DISTRIBUIDOR' 
  | 'FECHADO' 
  | 'SEM_INTERESSE';

export interface LeadNote {
  id: string;
  text: string;
  createdAt: string;
  userName: string;
}

export interface Lead {
  id: string;
  userId: string | null;
  userName: string | null;
  porte: IspPorte;
  porteLabel: string;
  tradeName: string;
  companyName: string;
  cnpj: string;
  asn: string;
  estimatedSubscribers: string;
  subscribersCount: number;
  contactPerson: string;
  contactRole: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  materialDemand: string;
  status: LeadStatus;
  currentDistributor?: string | null;
  visitDate: string | null;
  visitNotes: string | null;
  quoteValue?: string | null;
  callCount: number;
  lastCallAt: string | null;
  notes: LeadNote[];
  createdAt: string;
  updatedAt: string;
}

export interface StateConfig {
  uf: string;
  name: string;
  ddd: string;
  cities: string[];
}

export interface PorteConfig {
  id: IspPorte;
  label: string;
  subscribersRange: string;
  description: string;
  suggestedMaterials: string;
  unitLabel: string;
}

export interface DashboardStats {
  total: number;
  novos: number;
  contatoRealizado: number;
  cotacaoEnviada: number;
  visitasAgendadas: number;
  outroDistribuidor: number;
  fechados: number;
  semInteresse: number;
  totalLigacoes: number;
}
