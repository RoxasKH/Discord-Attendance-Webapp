export class UserAttendanceRepositoryError extends Error {

  constructor(status, error, description) {
    this.status = status;
    this.error = error;
    this.description = description;
  }

}