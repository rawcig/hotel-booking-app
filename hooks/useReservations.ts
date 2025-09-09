// hooks/useReservations.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationsService, CreateReservationRequest } from '@/api/services/reservations';

export const useGuestReservations = (guest_id: number) => {
  return useQuery({
    queryKey: ['reservations', guest_id],
    queryFn: () => reservationsService.getGuestReservations(guest_id),
    enabled: !!guest_id,
  });
};

export const useReservation = (id: number) => {
  return useQuery({
    queryKey: ['reservation', id],
    queryFn: () => reservationsService.getReservationById(id),
    enabled: !!id,
  });
};

export const useCreateReservation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateReservationRequest) => reservationsService.createReservation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
};

export const useCancelReservation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => reservationsService.cancelReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservation'] });
    },
  });
};