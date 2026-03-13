# Book Reviews & Ratings Synchronization

## Overview

This project enhances a **book catalogue and review system** by synchronizing **ratings and comments** across backend and frontend, while significantly refining the **Book user experience (UX)**.

The objective is to ensure that reviews (ratings and comments) remain consistent, aggregated metrics are accurate, and the overall interaction with books feels modern and intuitive.

---

## Backend Enhancements

### Ratings & Aggregation
- Compute per-book **average rating**, floored to **1 decimal**
- Include aggregated fields in book details:
  - `global_rating`
  - `total_comments`
- Update `evaluates.note` from integer to **float** to support fractional ratings

### Reviews & Data Model
- Merge reviews with **usernames and evaluate IDs** in the book review endpoint
- Store or update reviews uniquely by **(user_id, book_id)** in both:
  - `evaluates`
  - `comments`
- Add a `comment` field to the `Evaluate` model
- Backfill `evaluates` records from existing comments
- Seed evaluate comments for data consistency

### Validation & API Responses
- Validate review creation and updates
- Return structured response payloads to refresh:
  - Book rating
  - Review list

---

## Frontend Improvements

### Review APIs & State Sync
- Add APIs for **review creation and update**
- Connect Book view to:
  - Submit or edit a review
  - Refresh the review list
  - Refresh the global rating
- Prefill user rating when a review already exists

### Rating UI & UX
- Rebuild Book rating interface with:
  - Layered stars
  - Fractional star fills
  - Tooltips
  - Modal-based review flow
- Support separate star displays for:
  - Global rating
  - User rating
  - Individual comment ratings
- Improve star sizing and visual hierarchy

### Book & Catalogue UX
- Add delete confirmation to **BookCard**
- Rework **EditBook** form:
  - Fetch categories and writers dynamically
  - Support writer creation
  - Improve validation and payload mapping
- Redirect to the new book after creation
- Refresh catalogue after deletion
- Handle empty categories state

---

## Outcome

The system now provides:
- Consistent synchronization between reviews and ratings
- Accurate book-level aggregates
- Fractional rating support end-to-end
- A cleaner, more intuitive Book experience
