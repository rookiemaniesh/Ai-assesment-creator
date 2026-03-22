# Data model (MongoDB / Mongoose)

## `Profile` (`profiles`)

Teacher / school account used for login.

| Field           | Type     | Notes                                      |
|----------------|----------|--------------------------------------------|
| `_id`          | ObjectId | Used as **profile id** across the app      |
| `username`     | String   | Unique, lowercased, 3–64 chars             |
| `schoolName`   | String   | Required                                   |
| `schoolAddress`| String   | Required                                   |
| `passwordHash` | String   | bcrypt hash — never returned in API        |
| `createdAt`    | Date     |                                            |
| `updatedAt`    | Date     |                                            |

## `Assignment` (`assignments`)

| Field                     | Type     | Notes                          |
|---------------------------|----------|--------------------------------|
| `profileId`               | ObjectId | Ref `Profile` — owner          |
| `title`, `subject`, …     | …        | Existing assignment fields     |
| `status`, `jobId`, …      | …        | Generation lifecycle         |

Index: `{ profileId: 1, createdAt: -1 }`

## `QuestionPaper` (`questionpapers`)

| Field          | Type     | Notes                                    |
|----------------|----------|------------------------------------------|
| `profileId`    | ObjectId | Ref `Profile` — same as assignment owner |
| `assignmentId` | ObjectId | Ref `Assignment`                         |
| `sections`     | Array    | Generated paper structure                |
| `totalMarks`   | Number   |                                          |
| `generatedAt`  | Date     |                                          |

`profileId` is stored on the paper for querying/filtering without joining through assignments.

## Auth

- **Register** / **Login** return a JWT (HS256, 7-day expiry).
- Protected routes expect: `Authorization: Bearer <token>`.
- Payload: `{ sub: <profileId>, username }`.
