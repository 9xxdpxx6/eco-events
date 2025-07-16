export interface UserRegistrationRequestDto {
  fullName: string;
  login: string;
  password: string;
  role?: 'USER' | 'ORGANIZATION';
  phoneNumber?: string;
  email?: string;
}

export interface UserRegistrationResponseDto {
  id: number;
  fullName: string;
  login: string;
  role: 'USER' | 'ORGANIZATION';
  email?: string;
  phoneNumber?: string;
}

export interface UserShortDTO {
  id: number;
  fullName: string;
}

export interface UserMediumDTO {
  id: number;
  fullName: string;
  registeredEventsCount: number;
  totalBonusPoints: number;
  phoneNumber?: string;
  email?: string;
}

export interface UserFilterDTO {
  fullName?: string;
  login?: string;
  registeredEventsCount?: number;
  totalBonusPoints?: number;
  role?: 'USER' | 'ORGANIZATION';
  page?: number;
  size?: number;
}

export interface EventRequestDTO {
  id?: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  createdAt?: string;
  updatedAt?: string;
  conducted?: boolean;
  eventTypeId: number;
  userId: number;
}

export interface EventResponseMediumDTO {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  conducted: boolean;
  eventType: EventTypeDTO;
  preview?: string;
  totalVisitors?: number;
  owner: UserMediumDTO;
}

export interface EventShortDTO {
  id: number;
  title: string;
}

export interface EventFilterDTO {
  keyword?: string;
  eventTypeId?: number;
  startDateFrom?: string;
  startDateTo?: string;
  userId?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface EventTypeDTO {
  id?: number;
  name: string;
  description?: string;
  eventsCount?: number;
}

export interface EventParticipantDTO {
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  createdAt: string;
  membershipStatus: 'VALID' | 'INVALID';
  user: UserShortDTO;
  event: EventShortDTO;
}

// Расширенный интерфейс для страницы регистраций с полными данными о событии
export interface EventParticipantWithEventDetailsDTO {
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  createdAt: string;
  membershipStatus: 'VALID' | 'INVALID';
  user: UserShortDTO;
  event: {
    id: number;
    title: string;
    startTime: string;
    endTime: string;
    location: string;
  };
}

export interface RegisterOrUnregisterRequest {
  userId: number;
  eventId: number;
}

export interface BonusTypeDTO {
  id?: number;
  name: string;
  description?: string;
}

export interface UserBonusHistoryRequestDTO {
  id?: number;
  userId: number;
  bonusTypeId: number;
  amount?: number;
  reason?: string;
  createdAt?: string;
  active?: boolean;
}

export interface UserBonusHistoryResponseShortDTO {
  id: number;
  user: UserShortDTO;
  bonusType: BonusTypeDTO;
  amount: number;
  reason?: string;
  createdAt: string;
  active: boolean;
}

export interface AuthRequestDTO {
  login: string;
  password: string;
}

export interface AuthResponseDTO extends UserRegistrationResponseDto {
  token: string;
}

export interface SortObject {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface PageableObject {
  offset: number;
  sort: SortObject;
  pageNumber: number;
  paged: boolean;
  pageSize: number;
  unpaged: boolean;
}

export interface Page<T = any> {
  totalElements: number;
  totalPages: number;
  size: number;
  content: T[];
  number: number;
  sort: SortObject;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  pageable: PageableObject;
  empty: boolean;
}

// Новые фильтры из API схемы
export interface UserBonusHistoryFilterDTO {
  userId?: number;
  bonusTypeId?: number;
  createdAtFrom?: string;
  createdAtTo?: string;
  isActive?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface EventParticipantFilterDTO {
  userId?: number;
  eventId?: number;
  status?: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  membershipStatus?: 'VALID' | 'INVALID';
  createdAtFrom?: string;
  createdAtTo?: string;
  eventStartTimeFrom?: string;
  eventStartTimeTo?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface EventFilterForUserDTO {
  title?: string;
  description?: string;
  dateFrom?: string;
  dateTo?: string;
  userIdForEventFilter?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  size?: number;
}

export interface EventTypeFilterDTO {
  name?: string;
  description?: string;
  page?: number;
  size?: number;
}

export interface BonusTypeFilterDTO {
  name?: string;
  description?: string;
  page?: number;
  size?: number;
} 