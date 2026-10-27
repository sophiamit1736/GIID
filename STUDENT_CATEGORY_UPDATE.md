# Student Category / GIID Group Update

The Add Student and Edit Student screens now collect the student's broad GIID category/group:

- Pre-Primary
- Primary
- Secondary
- Pre-Vocational-1
- Pre-Vocational-2
- Vocational
- Care Group

The backend stores this value in the existing `Student.group` field and derives the FACP functional level using `normalizeGroupToFACPLevel(group, age)`. For Primary students, age determines Primary-I vs Primary-II according to the existing application crosswalk.

This keeps three concepts separate:

1. Student Category / GIID Group = placement/category entered at admission.
2. FACP Functional Level = derived curriculum eligibility level.
3. LearnAble Learning Level = Not Assessed / Beginner / Intermediate / Advanced, determined from assessment/adaptive evidence.
