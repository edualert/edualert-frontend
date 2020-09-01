export type orsTabs = 'enrolled_institutions' | 'institutions_at_risk' | 'inactive_institutions' |
  'institutions_average' | 'institutions_absences' | 'students_risk_evolution';

export type principalTabs = 'profiles' | 'classes' | 'students' | 'teachers' |
  'academic_programs_at_risk' | 'academic_programs_average' | 'academic_programs_absences' |
  'study_classes_at_risk' | 'study_classes_average' | 'study_classes_absences' |
  'students_at_risk' | 'students_risk_evolution' |
  'inactive_teachers';
export type principalTabsMappingTypes =
  'profiles-academic_programs_at_risk' | 'profiles-academic_programs_average' | 'profiles-academic_programs_absences' |
  'classes-study_classes_at_risk' | 'classes-study_classes_average' | 'classes-study_classes_absences' |
  'students-students_at_risk' | 'students-students_risk_evolution' |
  'teachers-inactive_teachers';

export type teacherTabs = 'my_classes' | 'class_mastery' |
  'study_classes_at_risk' |
  'students_at_risk' | 'own_students_average' | 'own_students_absences' | 'own_students_behaviour_grade' | 'own_students_risk_evolution' | 'inactive_parents';
export type notClassMasterTabsMappingTypes = 'my_classes-study_classes_at_risk';
export type classMasterTabsMappingTypes = 'my_classes-study_classes_at_risk' |
  'class_mastery-students_at_risk' | 'class_mastery-own_students_average' | 'class_mastery-own_students_absences' |
  'class_mastery-own_students_behaviour_grade' | 'class_mastery-own_students_risk_evolution' | 'class_mastery-inactive_parents';

export type parentStudentTabs = 'student_school_activity' | 'student_subjects_at_risk' | 'student_absences_evolution' | 'student_statistics';
