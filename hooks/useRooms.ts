// hooks/useRooms.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsService, RoomSearchParams } from '@/api/services/rooms';

export const useAvailableRooms = (params: RoomSearchParams) => {
  return useQuery({
    queryKey: ['available-rooms', params],
    queryFn: () => roomsService.getAvailableRooms(params),
    enabled: !!params.check_in_date && !!params.check_out_date,
  });
};

export const useRoomTypes = () => {
  return useQuery({
    queryKey: ['room-types'],
    queryFn: () => roomsService.getRoomTypes(),
  });
};

export const useRoom = (id: number) => {
  return useQuery({
    queryKey: ['room', id],
    queryFn: () => roomsService.getRoomById(id),
    enabled: !!id,
  });
};