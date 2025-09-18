# Database Schema Diagram

This document shows the relationships between tables in the hotel booking application database.

## Entity Relationship Diagram

```
                    ┌─────────────────┐
                    │   user_roles    │
                    │                 │
                    │ id (PK)         │◄─────────────────────┐
                    │ name            │                      │
                    │ description     │                      │
                    │ created_at      │                      │
                    └─────────────────┘                      │
                             ▲                               │
                             │                               │
                    ┌─────────────────┐                      │
                    │     users       │                      │
                    │                 │                      │
                    │ id (PK)         │                      │
                    │ name            │                      │
                    │ email           │                      │
                    │ phone           │                      │
                    │ role_id (FK)    │──────────────────────┘
                    │ created_at      │
                    │ updated_at      │
                    └─────────────────┘
                             ▲
                             │
                    ┌─────────────────┐
                    │     guests      │
                    │                 │
                    │ id (PK)         │◄─────────────────────┐
                    │ first_name      │                      │
                    │ last_name       │                      │
                    │ phone_number    │                      │
                    │ email           │                      │
                    │ date_of_birth   │                      │
                    │ nationality     │                      │
                    │ created_at      │                      │
                    │ updated_at      │                      │
                    └─────────────────┘                      │
                             ▲                               │
                             │                               │
                    ┌─────────────────┐                      │
                    │  reservations   │                      │
                    │                 │                      │
                    │ id (PK)         │                      │
                    │ guest_id (FK)   │──────────────────────┘
                    │ room_id (FK)    │◄─────────────────────┐
                    │ check_in_date   │                      │
                    │ check_out_date  │                      │
                    │ number_of_guests│                      │
                    │ special_requests│                      │
                    │ status          │                      │
                    │ staff_id (FK)   │                      │
                    │ checked_in_at   │                      │
                    │ checked_out_at  │                      │
                    │ total_price     │                      │
                    │ created_at      │                      │
                    │ updated_at      │                      │
                    └─────────────────┘                      │
                             ▲                               │
                             │                               │
                    ┌─────────────────┐                      │
                    │   payments      │                      │
                    │                 │                      │
                    │ id (PK)         │                      │
                    │ reservation_id  │──────────────────────┘
                    │ amount_paid     │
                    │ payment_date    │
                    │ payment_method  │
                    │ payment_channel │
                    │ payment_status  │
                    │ transaction_id  │
                    │ staff_id (FK)   │
                    │ notes           │
                    │ created_at      │
                    │ updated_at      │
                    └─────────────────┘
                             ▲
                             │
                    ┌─────────────────┐
                    │ notifications   │
                    │                 │
                    │ id (PK)         │
                    │ guest_id (FK)   │──────────────────────┐
                    │ type            │                      │
                    │ subject         │                      │
                    │ message         │                      │
                    │ sent_at         │                      │
                    │ status          │                      │
                    │ created_at      │                      │
                    │ updated_at      │                      │
                    └─────────────────┘                      │
                                                             │
                    ┌─────────────────┐                      │
                    │     hotels      │                      │
                    │                 │                      │
                    │ id (PK)         │◄─────────────────────┤
                    │ name            │                      │
                    │ location        │                      │
                    │ distance        │                      │
                    │ rating          │                      │
                    │ price           │                      │
                    │ image           │                      │
                    │ gallery         │                      │
                    │ description     │                      │
                    │ amenities       │                      │
                    │ coordinates     │                      │
                    │ created_at      │                      │
                    └─────────────────┘                      │
                             ▲                               │
                             │                               │
                    ┌─────────────────┐                      │
                    │   room_types    │                      │
                    │                 │                      │
                    │ id (PK)         │                      │
                    │ name            │                      │
                    │ description     │                      │
                    │ default_price   │                      │
                    │ default_capacity│                      │
                    │ created_at      │                      │
                    │ updated_at      │                      │
                    └─────────────────┘                      │
                             ▲                               │
                             │                               │
                    ┌─────────────────┐                      │
                    │     rooms       │                      │
                    │                 │                      │
                    │ id (PK)         │                      │
                    │ room_type_id(FK)│──────────────────────┤
                    │ room_number     │                      │
                    │ floor_number    │                      │
                    │ view_type       │                      │
                    │ price_per_night │                      │
                    │ capacity        │                      │
                    │ is_active       │                      │
                    │ hotel_id (FK)   │──────────────────────┘
                    │ created_at      │
                    │ updated_at      │
                    └─────────────────┘
                             ▲
                             │
                    ┌─────────────────┐
                    │     staff       │
                    │                 │
                    │ id (PK)         │
                    │ first_name      │
                    │ last_name       │
                    │ phone_number    │
                    │ email           │
                    │ role_id (FK)    │
                    │ hire_date       │
                    │ is_active       │
                    │ hotel_id (FK)   │
                    │ created_at      │
                    │ updated_at      │
                    └─────────────────┘
                             ▲
                             │
                    ┌─────────────────┐
                    │   bookings      │ (Legacy table)
                    │                 │
                    │ id (PK)         │
                    │ hotel_id (FK)   │
                    │ user_id         │
                    │ check_in        │
                    │ check_out       │
                    │ guests          │
                    │ rooms           │
                    │ guest_name      │
                    │ guest_email     │
                    │ guest_phone     │
                    │ total_price     │
                    │ status          │
                    │ hotel_name      │
                    │ location        │
                    │ image           │
                    │ created_at      │
                    │ updated_at      │
                    └─────────────────┘
```

## Relationship Explanations

1. **Users and User Roles**: Users have a role (admin, user, staff, manager)
2. **Users and Guests**: Guests are linked to users through email
3. **Guests and Reservations**: Each reservation belongs to one guest
4. **Rooms and Reservations**: Each reservation is for one room
5. **Rooms and Hotels**: Each room belongs to one hotel
6. **Rooms and Room Types**: Each room has one room type
7. **Reservations and Payments**: Each payment is for one reservation
8. **Staff and Reservations**: Staff can be associated with reservations
9. **Staff and Payments**: Staff can be associated with payments
10. **Guests and Notifications**: Each notification is for one guest
11. **Staff and Hotels**: Staff members work at hotels
12. **Bookings**: Legacy table for backward compatibility