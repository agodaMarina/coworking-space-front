// DTOs pour les Équipements — Flask ShareRoom API

export interface Equipment {
  id: string;
  name: string;
}

export interface EquipmentWritePayload {
  name: string;
}

export interface EquipmentListParams {
  cursor?: string;
  limit?: number;
}
