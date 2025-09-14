import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Token storage functions
export const getToken = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error('Failed to get token:', error);
    return null;
  }
};

export const setToken = async (key: string, token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, token);
  } catch (error) {
    console.error('Failed to set token:', error);
  }
};

export const removeToken = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove token:', error);
  }
};

// Auth token specific functions
export const getAccessToken = (): Promise<string | null> => {
  return getToken(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): Promise<string | null> => {
  return getToken(REFRESH_TOKEN_KEY);
};

export const setAccessToken = (token: string): Promise<void> => {
  return setToken(ACCESS_TOKEN_KEY, token);
};

export const setRefreshToken = (token: string): Promise<void> => {
  return setToken(REFRESH_TOKEN_KEY, token);
};

export const clearAuthTokens = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  } catch (error) {
    console.error('Failed to clear auth tokens:', error);
  }
};