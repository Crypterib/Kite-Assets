
'use client'

import type { User } from './types';

const LOGGED_IN_USER_KEY = 'kite_assets_logged_in_user';

let currentUser: User | null = null;

// Immediately invoked function to hydrate currentUser from sessionStorage on client load
(async () => {
    if (typeof window !== 'undefined') {
        const storedUser = sessionStorage.getItem(LOGGED_IN_USER_KEY);
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
        }
    }
})();

export function login(user: User): void {
  currentUser = user;
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(user));
  }
}

export function logout(): void {
  currentUser = null;
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(LOGGED_IN_USER_KEY);
  }
}

export function getCurrentUser(): User | null {
  if (typeof window !== 'undefined' && !currentUser) {
    const storedUser = sessionStorage.getItem(LOGGED_IN_USER_KEY);
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
    }
  }
  return currentUser;
}

export function updateUserInSession(user: User): void {
  currentUser = user;
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(user));
  }
}
