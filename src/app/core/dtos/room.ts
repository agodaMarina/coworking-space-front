// DTOs pour les Salles (Rooms) — Flask ShareRoom API
import { Equipment } from './equipment';

// Réservation telle qu'elle est imbriquée dans la réponse d'une room
export interface RoomReservation {
  id: string;
  start_time: string;  // ISO 8601 UTC
  end_time: string;    // ISO 8601 UTC
  created_by: string;  // user_id
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  version: number;
  cancellation_allowed: boolean;
  cancellation_deadline_hours: number;
  gap_minutes: number;
  equipments: Equipment[];
  reservations: RoomReservation[];
}

export interface RoomWritePayload {
  name: string;
  capacity: number;
  gap_minutes?: number;
  cancellation_allowed?: boolean;
  cancellation_deadline_hours?: number;
}

export interface RoomListParams {
  name?: string;
  min_capacity?: number;
  max_capacity?: number;
  // IDs séparés par virgule : "eq-id-1,eq-id-2"
  equipment_ids?: string;
  available_from?: string;  // ISO 8601 UTC
  available_to?: string;    // ISO 8601 UTC
  cursor?: string;
  limit?: number;
}
