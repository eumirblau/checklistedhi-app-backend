// Tipos para la aplicación ChecklistApp

export interface ChecklistItem {
  id: string;
  descripcion: string;
  completado: boolean;
  observaciones?: string;
  fechaCompletado?: string;
  responsable?: string;
  unidad?: string;
  cantidad?: number;
}

export interface Obra {
  id: string;
  nombre: string;
  ubicacion: string;
  estado: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  spreadsheetId?: string;
  obraId?: string;
  apellido?: string;
}

export interface Instalacion {
  id: string;
  nombre: string;
  tipo: string;
  estado: string;
  obraId?: string;
  spreadsheetId?: string;
}

export interface JefeDeGrupo {
  id: string;
  nombre: string;
  apellido?: string;
  email: string;
  telefono?: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  apellido?: string;
  email: string;
  rol: string;
  cargo?: string;
}

export type RootStackParamList = {
  Login: undefined;
  LoginScreen: undefined;
  JefesScreen: { usuario: Usuario };
  Jefes: undefined;
  ObrasScreen: { jefeId: string; jefeNombre: string; usuario: Usuario };
  Obras: undefined;
  InstalacionesScreen: { obraId: string; obraNombre: string; jefeNombre: string; usuario: Usuario };
  Instalaciones: { obraId: string };  ChecklistScreen: {
    instalacionId: string;
    instalacionNombre: string;
    spreadsheetId: string;
    usuario: Usuario;
    obraNombre: string;
  };
  Checklist: { instalacionId: string };
};
