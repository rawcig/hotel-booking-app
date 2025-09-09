
-- Grant access to tables
GRANT ALL ON TABLE public.hotels TO authenticated;
GRANT ALL ON TABLE public.rooms TO authenticated;
GRANT ALL ON TABLE public.room_types TO authenticated;
GRANT ALL ON TABLE public.guests TO authenticated;
GRANT ALL ON TABLE public.user_roles TO authenticated;
GRANT ALL ON TABLE public.staff TO authenticated;
GRANT ALL ON TABLE public.reservations TO authenticated;
GRANT ALL ON TABLE public.payments TO authenticated;
GRANT ALL ON TABLE public.notifications TO authenticated;

-- Grant access to sequences
GRANT ALL ON SEQUENCE public.hotels_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.rooms_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.room_types_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.guests_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.user_roles_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.staff_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.reservations_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.payments_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.notifications_id_seq TO authenticated;