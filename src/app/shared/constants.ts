export const menuLinks = {     // moved this here to be able to automatically corelate the menu items with the location enforcement of roles
  'ADMINISTRATOR': [
    {path: 'home', text: 'Acasă', className: 'home'},
    {path: 'manage-schools', text: 'Gestionare unități de învățământ', className: 'manage-schools'},
    {path: 'manage-school-calendar', text: 'Gestionare calendar an școlar', className: 'manage-school-calendar'},
    {path: 'students-situation', text: 'Situație elevi', className: 'students-situation'},
    {path: 'reports', text: 'Rapoarte', className: 'reports'},
    {path: 'manage-users', text: 'Gestionare utilizatori', className: 'manage-users'},
    {path: 'my-account', text: 'Contul meu', className: 'my-account'},
  ],
  'SCHOOL_PRINCIPAL': [
    {path: 'home', text: 'Acasă', className: 'home'},
    {path: 'manage-class-profiles', text: 'Gestionare profile clase', className: 'manage-class-profiles'},
    {path: 'manage-classes', text: 'Gestionare clase', className: 'manage-classes'},
    {path: 'students-situation', text: 'Situație elevi', className: 'students-situation'},
    {path: 'reports', text: 'Rapoarte', className: 'reports'},
    {path: 'manage-users', text: 'Gestionare utilizatori', className: 'manage-users'},
    {path: 'my-account', text: 'Contul meu', className: 'my-account'},
    {path: 'messages', text: 'Mesaje', className: 'messages'},
  ],
  'TEACHER': [
    {path: 'home', text: 'Acasă', className: 'home'},
    {path: 'my-classes', text: 'Clasele mele', className: 'my-classes'},
    {path: 'students-situation', text: 'Situație elevi', className: 'students-situation'},
    {path: 'reports', text: 'Rapoarte', className: 'reports'},
    {path: 'my-account', text: 'Contul meu', className: 'my-account'},
    {path: 'messages', text: 'Mesaje', className: 'messages'},
  ],
  'PARENT': [
    {path: 'home', text: 'Acasă', className: 'home'},
    {path: 'school-situation', text: 'Situație școlară', className: 'school-situation'},
    {path: 'reports', text: 'Rapoarte', className: 'reports'},
    {path: 'my-account', text: 'Contul meu', className: 'my-account'},
    {path: 'messages', text: 'Mesaje', className: 'messages'},
  ],
  'STUDENT': [
    {path: 'home', text: 'Acasă', className: 'home'},
    {path: 'school-situation', text: 'Situație școlară', className: 'school-situation'},
    {path: 'reports', text: 'Rapoarte', className: 'reports'},
    {path: 'my-account', text: 'Contul meu', className: 'my-account'},
    {path: 'messages', text: 'Mesaje', className: 'messages'},
  ],
};

export const monthDatesAndNames = [
  {id: 1, name: 'Ianuarie'},
  {id: 2, name: 'Februarie'},
  {id: 3, name: 'Martie'},
  {id: 4, name: 'Aprilie'},
  {id: 5, name: 'Mai'},
  {id: 6, name: 'Iunie'},
  {id: 7, name: 'Iulie'},
  {id: 8, name: 'August'},
  {id: 9, name: 'Septembrie'},
  {id: 10, name: 'Octombrie'},
  {id: 11, name: 'Noiembrie'},
  {id: 12, name: 'Decembrie'}
];

export const weekdays = [
  {day: 0, name: 'Luni'},
  {day: 1, name: 'Marți'},
  {day: 2, name: 'Miercuri'},
  {day: 3, name: 'Joi'},
  {day: 4, name: 'Vineri'},
  {day: 5, name: 'Sâmbătă'},
  {day: 6, name: 'Duminică'}
];
