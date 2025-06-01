// Types for the Checklist Application
export interface JefeDeGrupo {
  id: string;
  nombre: string;
  email?: string;
}
export interface Obra {
  id: string;                 // Identificador único de la obra en la app (ej: "ObraID001M")
  nombre: string;             // Nombre legible de la obra (ej: "Centro Los Mayores Los Almendros")
  spreadsheetId: string;      // EL ID REAL DE LA HOJA DE GOOGLE SHEETS
  // realSpreadsheetId?: string; // Campo que se reconciliará/eliminará. La fuente de verdad será spreadsheetId.
  ubicacion?: string;
  fechaInicio?: string;
  estado?: string;
}
export interface Instalacion {
  id: string;  // nombre de la pestaña
  nombre: string;  // nombre de la pestaña
  tipo?: string;
  estado?: string;
}
export interface ChecklistItem {
  id: string;
  descripcion: string;
  unidad?: string;
  cantidad?: number;
  completado: boolean;  // basado en s_contrato (√ = true)
  observaciones?: string;
  fechaCompletado?: string;  // fechapp
  rowIndex?: number;  // para guardarChecks
}
export interface Checklist {
  instalacionId: string;
  items: ChecklistItem[];
  fechaActualizacion?: string;
}
// Tipos para usuario y login
export interface Usuario {
  nombre: string;
  cargo: string;
}
export interface LoginCredentials {
  usuario: string;
  cargo: string;
}
// Navigation types
export type RootStackParamList = {
  LoginScreen: undefined;
  JefesScreen: { usuario: Usuario };
  ObrasScreen: { jefeId: string; jefeNombre: string; usuario: Usuario };
  InstalacionesScreen: {
    obraId: string;
    obraNombre: string;
    jefeNombre: string;
    usuario: Usuario;
  };
  ChecklistScreen: {
    instalacionId: string;
    instalacionNombre: string;
    spreadsheetId: string;
    usuario: Usuario;
    obraNombre: string; // Added obraNombre
  };
  EditChecklistScreen: {
    instalacionId: string;
    instalacionNombre: string;
    checklist: Checklist;
    spreadsheetId: string;
    usuario: Usuario;
  };
};
