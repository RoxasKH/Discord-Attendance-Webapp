import { config } from '../utils/Config.js';
import { UserAttendanceRepositoryError } from './UserAttendanceRepositoryError.js';

export class UserAttendanceRepository {

  BASE_URL = config.HOST_APP_URL;

  async updateDatabaseEntry(id, month, attendanceArray) {
    const url = `${this.BASE_URL}/api/table/${id}`;
    const headers = {
      'Authorization-ID': id,
      'Content-Type': 'application/json'
    };
    const payload = JSON.stringify({
      'month': month, 
      'attendance': attendanceArray
    });

    const response = await fetch(url, {
      method: 'PUT',
      headers: headers,
      body: payload
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new UserAttendanceRepositoryError(
        response.status,
        errorData.error,
        response.statusText
      );
    }

    return await response.json();

  }

  getAttendanceData(id) {
    const url = `${this.BASE_URL}/api/table`;
    const headers = {
      'Authorization-ID': id
    };

    return fetch(url, {
      method: 'GET',
      headers: headers
    })
      .then(response => {
        console.log('RESPONSEOK'+response.ok);
        console.log('RESPONSESTATUS'+response.status);
        if (!response.ok) {
          return response.json().then(errorData => {
            throw new UserAttendanceRepositoryError(
              response.status,
              errorData.error,
              response.statusText
            );
          });
        }
        return response.json();
      })

  }

}