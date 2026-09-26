import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AppShell } from '../../layout/app-shell/app-shell';
import { InterviewApiService } from '../../api/interview-api.service';
import { InterviewSessionResponse } from '../../models/interview/interview-session-response.model';
import { QuestionResponse } from '../../models/interview/question-response.model';
import { DIFFICULTY_LABELS, TOPIC_LABELS } from '../../models/interview/interview-labels';
import { MarkdownPipe } from '../../pipes/markdown-pipe';

@Component({
  selector: 'app-interview-results',
  standalone: true,
  imports: [DatePipe, RouterLink, MatIconModule, MatButtonModule, AppShell, MarkdownPipe],
  template: `
    <app-shell pageTitle="Results">

      @if (loading()) {
        <div class="state-card">
          <p>Loading your results…</p>
        </div>
      } @else if (loadError() || !interview()) {
        <div class="state-card">
          <p>Couldn't load this interview.</p>
          <a routerLink="/my-interviews" mat-stroked-button class="pm-button-secondary mt-4 !py-1">
            Back to my interviews
          </a>
        </div>
      } @else {

        <!-- Header -->
        <div class="results-head">
          <div>
            <div class="results-head__tags">
              <span class="topic-tag">{{ topicLabel() }}</span>
              <span class="difficulty-tag">{{ difficultyLabel() }}</span>
            </div>
            <p class="results-head__date">
              {{ interview()!.startedAt | date: 'MMM d, y · HH:mm' }}
              @if (interview()!.completedAt) {
                &middot; completed {{ interview()!.completedAt | date: 'MMM d, y · HH:mm' }}
              }
            </p>
          </div>

          <div class="final-score" [class]="'final-score--' + band(interview()!.finalScore)">
            <strong>{{ interview()!.finalScore }}%</strong>
            <span>final score</span>
          </div>
        </div>

        <!-- Per-question breakdown -->
        <div class="qa-list">
          @for (question of answeredQuestions(); track question.id) {
            <article class="qa-card">
              <div class="qa-card__head">
                <span class="qa-card__number">Question {{ question.orderNumber }}</span>
                <span class="qa-card__score" [class]="'qa-card__score--' + band(question.answer.score)">
                  {{ question.answer.score }}%
                </span>
              </div>

              <div class="qa-card__question" [innerHTML]="question.content | markdown"></div>

              <div class="qa-card__answer">
                <span class="qa-card__answer-label">Your answer</span>
                <p>{{ question.answer.content }}</p>
              </div>

              <div class="qa-card__feedback" [innerHTML]="question.answer.feedback | markdown"></div>

              @if (question.answer.strengths?.length) {
                <div class="qa-card__group">
                  <h4>Strengths</h4>
                  <ul>
                    @for (point of question.answer.strengths; track point) {
                      <li [innerHTML]="point | markdown:'inline'"></li>
                    }
                  </ul>
                </div>
              }

              @if (question.answer.weaknesses?.length) {
                <div class="qa-card__group">
                  <h4>Could be better</h4>
                  <ul>
                    @for (point of question.answer.weaknesses; track point) {
                      <li [innerHTML]="point | markdown:'inline'"></li>
                    }
                  </ul>
                </div>
              }

              @if (question.answer.suggestedAnswer) {
                <div class="qa-card__group">
                  <h4>A stronger answer</h4>
                  <div [innerHTML]="question.answer.suggestedAnswer | markdown"></div>
                </div>
              }
            </article>
          }
        </div>

        <div class="results-actions">
          <a routerLink="/my-interviews" mat-stroked-button class="pm-button-secondary !py-1">
            Back to my interviews
          </a>
          <a routerLink="/interview-setup" mat-flat-button class="pm-button-primary !py-1">
            Run another interview
          </a>
        </div>

      }

    </app-shell>
  `,
  styleUrl: './interview-results.scss',
})
export class InterviewResults implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly interviews = inject(InterviewApiService);

  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly interview = signal<InterviewSessionResponse | null>(null);

  protected readonly answeredQuestions = computed<QuestionResponse[]>(() => {
    const session = this.interview();
    if (!session) return [];
    return [...session.questions]
      .filter((q) => q.answer != null)
      .sort((a, b) => a.orderNumber - b.orderNumber);
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.interviews.getInterviewById(id).subscribe({
      next: (session) => {
        this.interview.set(session);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }

  protected topicLabel(): string {
    const session = this.interview();
    return session ? TOPIC_LABELS[session.topic] : '';
  }

  protected difficultyLabel(): string {
    const session = this.interview();
    return session ? DIFFICULTY_LABELS[session.difficulty] : '';
  }

  protected band(score: number): 'strong' | 'fair' | 'weak' {
    if (score >= 80) return 'strong';
    if (score >= 60) return 'fair';
    return 'weak';
  }
}