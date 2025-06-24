export interface UserRegistrationRequestDto {
  firstName: string;
  lastName: string;
  patronymic?: string;
  login: string;
  password: string;
  role?: 'USER' | 'ADMIN';
}

export interface UserRegistrationResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  patronymic?: string;
  login: string;
  role: 'USER' | 'ADMIN';
}

export interface UserBonusHistoryDTO {
  id?: number;
  userId: number;
  bonusTypeId: number;
  amount: number;
  reason?: string;
  createdAt?: string;
  active?: boolean;
}

export interface EventParticipantDTO {
  userId: number;
  firstName: string;
  lastName: string;
  eventId: number;
  eventName: string;
  status: string;
  createdAt: string;
}

export interface EventDTO {
  id?: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  createdAt?: string;
  updatedAt?: string;
  conducted: boolean;
  eventType: EventTypeDTO;
}

export interface EventTypeDTO {
  id?: number;
  name: string;
  description?: string;
}

export interface BonusTypeDTO {
  id?: number;
  name: string;
  description?: string;
}

export interface AuthRequestDTO {
  login: string;
  password: string;
}

export interface AuthResponseDTO extends UserRegistrationResponseDto {
  token: string;
} 