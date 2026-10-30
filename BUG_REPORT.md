# CourseMaster Frontend — Bug Report & Debugging Documentation

**Project:** CourseMaster Frontend SPA (`courseMaster_frontEnd`)  
**Technology Stack:** React 19, Vite, Redux Toolkit, React Router DOM v7, Tailwind CSS, DaisyUI, Axios  
**Repository:** [https://github.com/myunus-info/bug-report-frontend/](https://github.com/myunus-info/bug-report-frontend/)  
**Total Identified Bugs:** 14  
**Status:** All 14 Bugs Fixed & Verified (100% Resolved)

---

## 1. Frontend Bug Summary Table

| Bug ID         | Title                                                                                    | Severity | Priority | Status           |
| :------------- | :--------------------------------------------------------------------------------------- | :------- | :------- | :--------------- |
| **BUG-FE-001** | LocalStorage Token Key Mismatch (`saveToken` uses `user_token`, `getToken` uses `token`) | Critical | P1       | Fixed & Verified |
| **BUG-FE-002** | Redux `fetchMyEnrollments` Fails with `undefined` Accessing `action.payload.data`        | Critical | P1       | Fixed & Verified |
| **BUG-FE-003** | Inverted / Object Reference Check in Course Player "Mark as Complete" Button             | High     | P2       | Fixed & Verified |
| **BUG-FE-004** | Hardcoded Shared Radio Button Name `quiz-option` Cross-Contaminates All Questions        | High     | P1       | Fixed & Verified |
| **BUG-FE-005** | 100x Price Multiplication Discrepancy on Course Details Page (`price * 100`)             | High     | P2       | Fixed & Verified |
| **BUG-FE-006** | Distorted Video Iframe Dimensions (`height: 700px, width: 300px`) Breaking Player Layout | High     | P2       | Fixed & Verified |
| **BUG-FE-007** | Active NavLink Selector Logic Highlights All Navigation Links Simultaneously             | Medium   | P3       | Fixed & Verified |
| **BUG-FE-008** | Mobile Dropdown Navigation Menu Clipped by `max-h-32 overflow-hidden`                    | High     | P2       | Fixed & Verified |
| **BUG-FE-009** | Student Dashboard Displays `NaN%` When Course Syllabus Data Is Uncached                  | Medium   | P3       | Fixed & Verified |
| **BUG-FE-010** | Course Card Title Horizontal Overflow with `whitespace-nowrap overflow-visible`          | Medium   | P3       | Fixed & Verified |
| **BUG-FE-011** | Illegible Hardcoded Dark User Email in Dark Theme User Management Table                  | Low      | P4       | Fixed & Verified |
| **BUG-FE-012** | Insecure `dev_bypass` and Fallback Token Verification in `ProtectedRoute`                | High     | P1       | Fixed & Verified |
| **BUG-FE-013** | Missing Standard `Bearer ` Scheme Prefix in Axios Request Interceptor                    | Medium   | P3       | Fixed & Verified |
| **BUG-FE-014** | Admin Routes Protected Only by Generic `ProtectedRoute` Without Role Guard               | Medium   | P2       | Fixed & Verified |

---

## 2. Severity & Priority Guidelines

### Severity Guidelines

- **Critical:** A major feature is unusable, the application crashes, or there is a severe security issue.
- **High:** An important feature fails or produces significantly incorrect behavior.
- **Medium:** A feature works incorrectly, but a workaround exists.
- **Low:** A minor UI issue or a low-impact functional inconsistency.

### Priority Guidelines

- **P1:** Fix immediately.
- **P2:** Fix as soon as possible.
- **P3:** Fix when higher-priority issues are resolved.
- **P4:** Low urgency; fix when appropriate.

---

## 3. Detailed Frontend Bug Reports

### Bug ID & Title: BUG-FE-001 — LocalStorage token key mismatch between saveToken and getToken

**Location & Steps to Reproduce:** `courseMaster_frontEnd/src/utils/auth.js` (lines 1-3) → Go to `/login` → Submit valid user credentials → Check browser localStorage and navigation.

**Expected vs. Actual Result:** The user should be authenticated, the token saved and read from localStorage, and the user redirected to their dashboard with navbar reflecting logged-in state. Instead, `saveToken` saved under `"user_token"`, while `getToken` read `"token"`. Immediately after login, `getToken()` returned `null`, treating the user as logged out and redirecting back to `/login`.

**Severity & Evidence:** Critical (Priority: P1) — Console / LocalStorage evidence: `localStorage.getItem("token") === null` while `localStorage.getItem("user_token")` had value.

**Fix & Verification Status:** Aligned `saveToken`, `getToken`, and `clearToken` to operate on `"token"` (with fallback compatibility for `"user_token"`). Verified seamless user login and persistent session state. Status: Fixed & Verified.

---

### Bug ID & Title: BUG-FE-002 — Redux fetchMyEnrollments fails with undefined accessing action.payload.data

**Location & Steps to Reproduce:** `courseMaster_frontEnd/src/store/slices/enrollmentSlice.js` (line 85) → Log in as student → Navigate to Student Dashboard (`/student`).

**Expected vs. Actual Result:** The dashboard should display enrolled courses. Instead, in `fetchMyEnrollments.fulfilled`, `action.payload` is the array itself (`res.data`). The reducer assigned `state.enrollments = action.payload.data` (which is `undefined`). This caused `enrollments` state to be `undefined`, breaking dashboard rendering.

**Severity & Evidence:** Critical (Priority: P1) — Redux DevTools state: `enrollment.enrollments` set to `undefined`. Console error: `TypeError: Cannot read properties of undefined (reading 'length')`.

**Fix & Verification Status:** Updated reducer to `state.enrollments = Array.isArray(action.payload) ? action.payload : (action.payload?.data || [])`. Verified enrolled courses list displays properly on the dashboard. Status: Fixed & Verified.

---

### Bug ID & Title: BUG-FE-003 — Inverted object reference check in Course Player "Mark as Complete" button

**Location & Steps to Reproduce:** `courseMaster_frontEnd/src/pages/CoursePlayer/CoursePlayer.jsx` (lines 155-158) → Open `/courses/:id/player` → Click "✓ Mark as Complete".

**Expected vs. Actual Result:** After clicking, the button should display "Completed ✓" and disable to prevent duplicate submissions. Instead, the check evaluated `enrollment?.progress?.completedLessons?.includes(lesson)`. Because `completedLessons` holds lesson ID strings and `lesson` is an object reference, `includes(lesson)` was always `false`, leaving the button enabled as "✓ Mark as Complete".

**Severity & Evidence:** High (Priority: P2) — UI behavior: Clicking the button marks the lesson complete on backend, but button text never switches to "Completed ✓".

**Fix & Verification Status:** Changed check to `enrollment?.progress?.completedLessons?.some((id) => String(id) === String(lesson?._id))`. Verified button toggles to "Completed ✓" and disables immediately. Status: Fixed & Verified.

---

### Bug ID & Title: BUG-FE-004 — Hardcoded shared radio button name quiz-option cross-contaminates all questions

**Location & Steps to Reproduce:** `courseMaster_frontEnd/src/pages/CoursePlayer/CoursePlayer.jsx` (line 771) → Open Course Player lesson with a quiz (e.g. Lesson 1 with 2 questions) → Select option for Question 1 → Select option for Question 2.

**Expected vs. Actual Result:** Each question should maintain its own independent selected radio option. Instead, all radio inputs across every question had `name="quiz-option"`. Selecting Question 2 unselected Question 1, restricting students to only submitting one answer across the entire quiz.

**Severity & Evidence:** High (Priority: P1) — Form behavior: Selecting any option in Question 2 immediately unchecks Question 1.

**Fix & Verification Status:** Scoped radio names by question index: `name={`quiz-option-${qIdx}`}`. Verified all questions retain independent selections. Status: Fixed & Verified.

---

### Bug ID & Title: BUG-FE-005 — 100x price multiplication discrepancy on course details page

**Location & Steps to Reproduce:** `courseMaster_frontEnd/src/pages/CousrseDetails/CourseDetails.jsx` (line 116) → Go to `/courses` (price shows ৳ 5,000) → Click "Details" to open `/courses/:id`.

**Expected vs. Actual Result:** Price should display as ৳ 5,000 matching the course fee. Instead, the details page multiplied price by 100: `<p>৳ {course.price * 100}</p>`, displaying ৳ 500,000 and conflicting with catalog pricing.

**Severity & Evidence:** High (Priority: P2) — UI display: `৳ 500000` on details page vs `৳ 5,000` on catalog cards.

**Fix & Verification Status:** Removed the `* 100` multiplier and formatted properly: `<p>৳ {course.price?.toLocaleString()}</p>`. Verified consistent pricing across all views. Status: Fixed & Verified.

---

### Bug ID & Title: BUG-FE-006 — Distorted video iframe dimensions breaking Course Player layout

**Location & Steps to Reproduce:** `courseMaster_frontEnd/src/pages/CoursePlayer/CoursePlayer.jsx` (line 144) → Navigate to `/courses/:id/player` on desktop or mobile.

**Expected vs. Actual Result:** The video iframe should scale responsively in 16:9 widescreen format within the player card. Instead, hardcoded inline styles `style={{ height: '700px', width: '300px' }}` forced the video into a 300px narrow vertical slit, cutting off video controls and breaking page layout.

**Severity & Evidence:** High (Priority: P2) — Visual defect: Video player rendered as a narrow 300px vertical rectangle.

**Fix & Verification Status:** Removed inline fixed dimensions and applied responsive classes: `<div className="aspect-video bg-base-300 rounded overflow-hidden mt-2 sm:mt-4"><iframe className="w-full h-full" ...>`. Verified responsive 16:9 widescreen playback on all viewports. Status: Fixed & Verified.

---

### Bug ID & Title: BUG-FE-007 — Active NavLink selector logic highlights all navigation links simultaneously

**Location & Steps to Reproduce:** `courseMaster_frontEnd/src/components/shared/Navbar.jsx` (lines 14-16) → Navigate to Home (`/`) or Courses (`/courses`) → Observe top navigation bar.

**Expected vs. Actual Result:** Only the current active route link should be highlighted with `text-primary font-semibold`. Instead, the logic checked `(isActive || window.location.pathname.startsWith("/"))`. Since every path starts with `/`, every navigation link (Home, Courses, Dashboard) was simultaneously highlighted as active.

**Severity & Evidence:** Medium (Priority: P3) — UI defect: All links in Navbar rendered with active styling at the same time.

**Fix & Verification Status:** Corrected logic to `const navLinkClass = ({ isActive }) => isActive ? "text-primary font-semibold" : "text-base-content/80 hover:text-primary";`. Verified only the active link is highlighted. Status: Fixed & Verified.

---

### Bug ID & Title: BUG-FE-008 — Mobile dropdown navigation menu clipped by max-h-32 overflow-hidden

**Location & Steps to Reproduce:** `courseMaster_frontEnd/src/components/shared/Navbar.jsx` (line 142) → Resize browser to mobile (< 768px) → Click hamburger menu button in navbar.

**Expected vs. Actual Result:** All navigation links (Home, Courses, Dashboard, Login, Enroll Now) should be visible and accessible. Instead, container class `max-h-32 overflow-hidden` restricted height to 128px, clipping items below the fold and rendering them unreachable.

**Severity & Evidence:** High (Priority: P2) — UI defect: Mobile menu links clipped off screen; unable to access Login or Enroll buttons on mobile.

**Fix & Verification Status:** Replaced `max-h-32 overflow-hidden` with `max-h-[80vh] overflow-y-auto`. Verified all mobile menu items are fully visible and scrollable. Status: Fixed & Verified.

---

### Bug ID & Title: BUG-FE-009 — Student dashboard displays NaN% when course syllabus data is uncached

**Location & Steps to Reproduce:** `courseMaster_frontEnd/src/pages/student/StudentDashboard.jsx` (lines 261-262) → Log in as student with enrolled courses → Navigate to Student Dashboard (`/student`).

**Expected vs. Actual Result:** Progress percentage should display a clean integer like `0%` or `50%`. Instead, the code calculated progress by dividing by `stats?.courseData?.syllabus?.reduce(...)`. While course data is loading or uncached, division by undefined resulted in `NaN%` displayed in large text.

**Severity & Evidence:** Medium (Priority: P3) — UI display: Large text shows `NaN%` above the progress bar.

**Fix & Verification Status:** Used the authoritative stored enrollment percentage: `<p className="text-2xl sm:text-3xl font-bold text-primary">{enrollment.progress?.percent ?? 0}%</p>`. Verified valid numeric progress displays at all times. Status: Fixed & Verified.

---

### Bug ID & Title: BUG-FE-010 — Course card title horizontal overflow with whitespace-nowrap overflow-visible

**Location & Steps to Reproduce:** `courseMaster_frontEnd/src/components/CourseCard/CourseCard.jsx` (line 35) → Navigate to `/courses` or Home page → View courses with long titles.

**Expected vs. Actual Result:** Long course titles should wrap naturally or clamp to 2 lines within card boundaries. Instead, classes `whitespace-nowrap overflow-visible` forced titles onto a single unbroken horizontal line that overflowed into adjacent cards and broke grid alignment.

**Severity & Evidence:** Medium (Priority: P3) — UI defect: Long title extends horizontally outside card boundary and collides with adjacent cards.

**Fix & Verification Status:** Replaced with `line-clamp-2` for multi-line clamping without horizontal overflow. Verified all course cards maintain clean grid alignment. Status: Fixed & Verified.

---

### Bug ID & Title: BUG-FE-011 — Illegible hardcoded dark user email in dark theme user management table

**Location & Steps to Reproduce:** `courseMaster_frontEnd/src/pages/admin/pages/ManageUsers.jsx` (line 216) → Toggle theme to Dark → Go to Admin Dashboard → User Management (`/admin/users`).

**Expected vs. Actual Result:** Table text should adapt dynamically to theme contrast. Instead, the email column had inline style `style={{ color: '#1e293b' }}`. On dark backgrounds, navy text was virtually invisible and impossible to read.

**Severity & Evidence:** Low (Priority: P4) — Accessibility/UI defect: User email text invisible against dark background in dark theme.

**Fix & Verification Status:** Removed hardcoded hex style and applied responsive DaisyUI class `className="text-base-content/80"`. Verified high-contrast readability in both light and dark themes. Status: Fixed & Verified.

---

### Bug ID & Title: BUG-FE-012 — Insecure dev_bypass and fallback token verification in ProtectedRoute

**Location & Steps to Reproduce:** `courseMaster_frontEnd/src/routes/ProtectedRoute.jsx` (lines 12-16, 26-29) → Navigate to `/admin` or `/student` appending `?bypass=true` without logging in.

**Expected vs. Actual Result:** Protected routes must require valid authentication verified with the backend. Instead, `ProtectedRoute` allowed access if `?bypass=true` or `localStorage.dev_bypass` was present, and accepted any arbitrary string as valid if `getMe()` failed.

**Severity & Evidence:** High (Priority: P1) — Security vulnerability: Unauthenticated users bypassed route protection by adding URL parameters.

**Fix & Verification Status:** Removed `dev_bypass` backdoor and ensured failed token verification clears credentials and redirects to `/login`. Status: Fixed & Verified.

---

### Bug ID & Title: BUG-FE-013 — Missing standard Bearer scheme prefix in Axios request interceptor

**Location & Steps to Reproduce:** `courseMaster_frontEnd/src/services/api.js` (line 13) → Inspect Network tab request headers for authenticated requests.

**Expected vs. Actual Result:** The request header should conform to RFC 6750: `Authorization: Bearer <token>`. Instead, the interceptor sent raw token `Authorization: <token>`, violating standard HTTP authorization formatting.

**Severity & Evidence:** Medium (Priority: P3) — Network header evidence: `Authorization: eyJhbGciOi...` without `Bearer ` prefix.

**Fix & Verification Status:** Updated interceptor: `config.headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;`. Verified standard header formatting on all authenticated requests. Status: Fixed & Verified.

---

### Bug ID & Title: BUG-FE-014 — Admin routes protected only by generic ProtectedRoute without role guard

**Location & Steps to Reproduce:** `courseMaster_frontEnd/src/routes/AdminRoute.jsx` & `src/App.jsx` → Log in as a student (`role: "student"`) → Navigate to `/admin` in address bar.

**Expected vs. Actual Result:** The application should display a centered loading spinner while verifying profile and cleanly redirect students to `/student`. Instead, `AdminRoute` returned `null` while profile was loading, causing a blank screen flash before redirect.

**Severity & Evidence:** Medium (Priority: P2) — UI defect: Blank screen flash when navigating to admin routes.

**Fix & Verification Status:** Enhanced `AdminRoute` to render a centered DaisyUI loading spinner while profile loads, and seamlessly redirect non-admins. Status: Fixed & Verified.

---
