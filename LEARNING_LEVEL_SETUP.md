# LearnAble learning level update

`learningLevel` is the LearnAble difficulty level: `Not Assessed`, `Beginner`, `Intermediate`, or `Advanced`.

## For an individual student
Use **Student Management -> Learning Level** and select the level. The page calls:
`PATCH /api/students/:id/learning-level`

The same operation can be done from Edit Student.

## From PowerShell
From `backend`:

```powershell
node setStudentLearningLevel.js STU-0001 Beginner
node setStudentLearningLevel.js STU-0002 Intermediate
node setStudentLearningLevel.js STU-0003 Advanced
```

Or through the npm script:

```powershell
npm run student:level -- STU-0001 Beginner
```

## Important
Do not infer a student's FACP functional level from age or disability level unless GIID has provided that mapping. FACP functional level and LearnAble learning level are different fields.

The existing `backfill:levels` command now derives Beginner/Intermediate/Advanced only when `facpAssessmentComplete` is true; otherwise it keeps the student as `Not Assessed`.
