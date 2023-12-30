import { config } from '../utils/Config.js'
import { UserAttendanceRepositoryError } from './UserAttendanceRepositoryError.js'

export class UserAttendanceRepository {
  
  constructor() {
    this.BASE_URL = config.HOST_APP_URL
  }


  updateDatabaseEntry(data, month, attendanceArray) {
    const url = `${this.BASE_URL}/api/table/${data.username}`;
    const headers = {
      'Authorization-ID': data.id,
      'Content-Type': 'application/json'
    };
    const payload = JSON.stringify({
      'month': month, 
      'attendance': attendanceArray
    });

    return fetch(url, {
      method: 'PUT',
      headers: headers,
      body: payload
    })
      .then(response => {
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