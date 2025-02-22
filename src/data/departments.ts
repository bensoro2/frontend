export const departmentGroups = {
  ACADEMIC_ADMIN: "กลุ่มบริหารวิชาการ",
  GENERAL_ADMIN: "กลุ่มบริหารทั่วไป",
  PERSONNEL_ADMIN: "กลุ่มบริหารงานบุคคล",
  BUDGET_ADMIN: "กลุ่มบริหารงบประมาณ",
  BUILDING_MANAGEMENT: "งานอาคารสถานที่",
  THAI_LANGUAGE: "กลุ่มสาระการเรียนรู้ ภาษาไทย",
  SOCIAL_STUDIES: "กลุ่มสาระการเรียนรู้ สังคมศึกษาฯ",
  FOREIGN_LANGUAGES: "กลุ่มสาระการเรียนรู้ ภาษาต่างประเทศ",
  ARTS: "กลุ่มสาระการเรียนรู้ ศิลปะ",
  MATHEMATICS: "กลุ่มสาระการเรียนรู้ คณิตศาสตร์",
  SCIENCE_TECH: "กลุ่มสาระการเรียนรู้ วิทยาศาสตร์ และเทคโนโลยี",
  CAREER_TECH: "กลุ่มสาระการเรียนรู้ การงานอาชีพ",
  HEALTH_PE: "กลุ่มสาระการเรียนรู้ สุขศึกษาและพลศึกษา",
  SPECIAL_CLASSROOM: "งานห้องเรียนพิเศษ",
  INNOVATION_CENTER: "งานศูนย์นวัตกรรมและเทคโนโลยี",
} as const;

export type DepartmentGroup = keyof typeof departmentGroups;
