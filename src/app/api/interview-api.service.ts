import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { InterviewSessionResponse } from '../models/interview/interview-session-response.model';
import { InterviewSessionRequest } from '../models/interview/interview-session-request.model';
import { SubmitRequest } from '../models/interview/submit-request.model';
import { SubmitResponse } from '../models/interview/submit-response.model';

@Injectable({
  providedIn: 'root'
})
export class InterviewApiService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/api/v1/interviews`;

  getMyInterviews(): Observable<InterviewSessionResponse[]> {
    return this.http.get<InterviewSessionResponse[]>(this.apiUrl);
  }

  getInterviewById(interviewId: number): Observable<InterviewSessionResponse> {
    return this.http.get<InterviewSessionResponse>(`${this.apiUrl}/${interviewId}`);
  }

  createInterview(request: InterviewSessionRequest): Observable<InterviewSessionResponse> {
    return this.http.post<InterviewSessionResponse>(this.apiUrl, request);
  }

  submitAnswer(interviewId: number, questionId: number, request: SubmitRequest
  ): Observable<SubmitResponse> {
    return this.http.post<SubmitResponse>(
      `${this.apiUrl}/${interviewId}/questions/${questionId}/answer`,
      request
    );
  }

  deleteInterview(interviewId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${interviewId}`);
  }
}