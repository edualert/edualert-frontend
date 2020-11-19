import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  static getAccessToken(): string {
    return localStorage.getItem('access_token');
  }

  static getRefreshToken(): string {
    return localStorage.getItem('refresh_token');
  }

  static setAccessToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem('refresh_token', token);
  }

  static removeAccessToken(): void {
    localStorage.removeItem('access_token');
  }

  static removeRefreshToken(): void {
    localStorage.removeItem('refresh_token');
  }

  static setIsFaculty(isFaculty: boolean): void {
    localStorage.setItem('isFaculty', isFaculty.toString())
  }

  static getIsFaculty(): boolean {
    const isFaculty = localStorage.getItem('isFaculty');
    return isFaculty === null || isFaculty === 'true';
  }

  static setSchoolId(id: string): void {
    localStorage.setItem('schoolId', id);
  }

  static getSchoolId(): string {
    return localStorage.getItem('schoolId');
  }

  static removeSchoolId(): void {
    return localStorage.removeItem('schoolId');
  }
}
