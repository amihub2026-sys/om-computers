
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ReviewService,
  ReviewType,
  ReviewRequest,
  ReviewItem
} from '../../../core/services/review.service';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-form.html',
  styleUrl: './review-form.css'
})
export class ReviewForm implements OnChanges, OnDestroy {

  @Input({ required: true }) reviewType!: ReviewType;

  @Input() orderId = '';
  @Input() bookingId = '';
  @Input() productId = '';

  @Input() existingReview: ReviewItem | null = null;

  @Output() reviewSubmitted = new EventEmitter<void>();

  rating = 0;
  hoverRating = 0;
  comment = '';

  selectedFiles: File[] = [];
  previews: string[] = [];

  existingImages: string[] = [];

  isSubmitting = false;
  message = '';
  error = '';

  readonly maxImages = 5;
  readonly maxFileSize = 5 * 1024 * 1024;

  readonly ratingLabels = [
    '',
    'Poor',
    'Fair',
    'Good',
    'Very Good',
    'Excellent'
  ];

  constructor(private reviewService: ReviewService) {}

  get isEditMode(): boolean {
    return !!this.existingReview?._id;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['existingReview']) {
      this.resetForm();

      if (this.existingReview) {
        this.rating = this.existingReview.rating;
        this.comment = this.existingReview.comment || '';
        this.existingImages = [
          ...(this.existingReview.images || [])
        ];
      }
    }
  }

  private resetForm(): void {
    this.previews.forEach(url => URL.revokeObjectURL(url));

    this.rating = 0;
    this.hoverRating = 0;
    this.comment = '';
    this.selectedFiles = [];
    this.previews = [];
    this.existingImages = [];
    this.error = '';
    this.message = '';
  }

  setRating(value: number): void {
    if (!this.isSubmitting) {
      this.rating = value;
    }
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);

    this.error = '';

    for (const file of files) {
      const total =
        this.existingImages.length +
        this.selectedFiles.length;

      if (total >= this.maxImages) {
        this.error = 'Maximum 5 images allowed.';
        break;
      }

      if (
        !['image/jpeg', 'image/png', 'image/webp']
          .includes(file.type)
      ) {
        this.error = 'Only JPG, PNG and WebP images are allowed.';
        continue;
      }

      if (file.size > this.maxFileSize) {
        this.error = 'Each image must be 5 MB or smaller.';
        continue;
      }

      this.selectedFiles.push(file);
      this.previews.push(URL.createObjectURL(file));
    }

    input.value = '';
  }

  removeImage(index: number): void {
    URL.revokeObjectURL(this.previews[index]);

    this.previews.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }

  removeExistingImage(index: number): void {
    this.existingImages.splice(index, 1);
  }

  get totalImages(): number {
    return this.existingImages.length +
      this.selectedFiles.length;
  }

  get canSubmit(): boolean {
    return (
      !this.isSubmitting &&
      Number.isInteger(this.rating) &&
      this.rating >= 1 &&
      this.rating <= 5 &&
      this.comment.trim().length > 0 &&
      this.comment.trim().length <= 2000 &&
      this.totalImages <= 5
    );
  }

  submitReview(): void {
    if (!this.canSubmit) {
      this.error = 'Please enter a valid rating and review.';
      return;
    }

    this.isSubmitting = true;
    this.error = '';
    this.message = '';

    const payload: ReviewRequest = {
      reviewType: this.reviewType,
      rating: this.rating,
      comment: this.comment.trim(),
      images: []
    };

    if (this.reviewType === 'product') {
      payload.orderId = this.orderId;
      payload.productId = this.productId;
    } else {
      payload.bookingId = this.bookingId;
    }

    const request = this.existingReview?._id
      ? this.reviewService.updateReview(
          this.existingReview._id,
          this.rating,
          this.comment.trim(),
          this.existingImages,
          this.selectedFiles
        )
      : this.reviewService.submitReview(
          payload,
          this.selectedFiles
        );

    request.subscribe({
      next: response => {
        this.isSubmitting = false;

        if (response.success) {
          this.message = this.isEditMode
            ? 'Review updated successfully!'
            : 'Review submitted successfully!';

          this.reviewSubmitted.emit();
        } else {
          this.error =
            response.message || 'Unable to save review.';
        }
      },
      error: err => {
        this.isSubmitting = false;
        this.error =
          err.error?.message || 'Unable to save review.';
      }
    });
  }

  ngOnDestroy(): void {
    this.previews.forEach(url => URL.revokeObjectURL(url));
  }
}
