/**
 * Vista agregada de un invitado con su información de asistencia
 * Usada para mostrar la lista de invitados en el panel del anfitrión/admin
 */
export interface GuestAssistanceView {
  guestName: string;
  guestEmail: string;
  guestId: string;
  
  giftSelected?: string;          // Nombre del regalo seleccionado
  quantity: number;
  
  answersToQuestions: Record<string, string | string[]>; // { "question-id": "answer" }
  
  attendanceConfirmed: boolean;
  confirmedAt?: number;           // Timestamp de confirmación
  createdAt?: number;
}

/**
 * Resumen de regalos seleccionados
 * Usada para mostrar estado de regalos en panel del anfitrión/admin
 */
export interface GiftSelectionSummary {
  giftId: string;
  giftName: string;
  category?: string;
  maxQuantity: number;
  
  selectionCount: number;         // Cuántos invitados han seleccionado este regalo
  availableCount: number;         // Cuántos quedan disponibles
  
  selectedBy?: Array<{
    guestName: string;
    guestEmail: string;
    quantity: number;
  }>;
}
