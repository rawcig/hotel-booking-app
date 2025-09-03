// app/context/BookingContext.tsx
import { Booking } from '@/constants/data';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useReducer } from 'react';

type BookingAction =
  | { type: 'SET_BOOKINGS'; payload: Booking[] }
  | { type: 'ADD_BOOKING'; payload: Booking }
  | { type: 'CANCEL_BOOKING'; payload: string };

interface BookingState {
  bookings: Booking[];
}

const initialState: BookingState = {
  bookings: [],
};

const BookingContext = createContext<{
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

const bookingReducer = (
  state: BookingState,
  action: BookingAction
): BookingState => {
  switch (action.type) {
    case 'SET_BOOKINGS':
      return { ...state, bookings: action.payload };
    case 'ADD_BOOKING':
      return { ...state, bookings: [...state.bookings, action.payload] };
    case 'CANCEL_BOOKING':
      return {
        ...state,
        bookings: state.bookings.filter((b) => b.id !== Number(action.payload)),
      };
    default:
      return state;
  }
};

export const BookingProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const saved = await AsyncStorage.getItem('bookings');
        if (saved) {
          dispatch({ type: 'SET_BOOKINGS', payload: JSON.parse(saved) });
        }
      } catch (e) {
        console.log('Failed to load bookings', e);
      }
    };
    loadBookings();
  }, []);

  useEffect(() => {
    const saveBookings = async () => {
      try {
        await AsyncStorage.setItem('bookings', JSON.stringify(state.bookings));
      } catch (e) {
        console.log('Failed to save bookings', e);
      }
    };
    saveBookings();
  }, [state.bookings]);

  return (
    <BookingContext.Provider value={{ state, dispatch }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBookings = () => useContext(BookingContext);