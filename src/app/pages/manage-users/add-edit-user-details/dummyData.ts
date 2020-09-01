import {Label} from "../../../models/label";
import {Parent} from "../../../models/parent";
import {Subject} from "../../../models/subject";

export const dummyData = {
    ors: {
      id: 1,
      full_name: 'John Doe',
      username: 'johndoe@test.com',
      user_role: "ADMINISTRATOR",
      email: 'johndoe@test.com',
      phone_number: '0740123456',
      use_phone_as_username: false,
      is_active: true,
      last_online: '01-01-2020T20:20:20'
    },
    school_principal: {
      id: 1,
      full_name: 'John Doe',
      username: 'johndoe@test.com',
      user_role: "PRINCIPAL",
      email: 'johndoe@test.com',
      phone_number: '0740123456',
      use_phone_as_username: false,
      is_active: true,
      last_online: '01-01-2020T20:20:20',
      labels: [
        {
          id: 1,
          text: 'abc'
        }
      ],
      taught_subjects: [
        {
          id: 1,
          name: 'Matematica'
        }
      ]
    },
    teacher: {
      id: 1,
      full_name: 'John Doe',
      username: 'johndoe@test.com',
      user_role: "TEACHER",
      email: 'johndoe@test.com',
      phone_number: '0740123456',
      use_phone_as_username: false,
      is_active: true,
      last_online: '01-01-2020T20:20:20',
      labels: [
        {
          id: 1,
          text: 'abc'
        }
      ],
      taught_subjects: [
        {
          id: 1,
          name: 'Matematica'
        },
        {
          id: 2,
          name: 'Romana'
        },
        {
          id: 3,
          name: 'Engleza'
        },
        {
          id: 4,
          name: 'Informatica'
        },
      ]
    },
    parent: {
      id: 1,
      full_name: 'John Doe',
      username: 'johndoe@test.com',
      user_role: "PARENT",
      email: 'johndoe@test.com',
      phone_number: '0740123456',
      use_phone_as_username: false,
      is_active: true,
      last_online: '01-01-2020T20:20:20',
      labels: [
        {
          id: 1,
          text: 'abc'
        }
      ],
      address: 'Strada Campul Painii 3-5'
    },
    student: {
      id: 1,
      full_name: 'Ion Zapada',
      username: 'johndoe@test.com',
      user_role: "STUDENT",
      email: 'johndoe@test.com',
      phone_number: '0740123456',
      use_phone_as_username: false,
      is_active: true,
      last_online: '01-01-2020T20:20:20',
      class_grade: 'XI',
      class_letter: 'A',
      labels: [
        {
          id: 1,
          text: 'Exmatriculat'
        },
        {
          id: 2,
          text: 'def'
        }
      ],
      address: 'Strada Campul Painii 3-5',
      personal_id_number: '1990125111222',
      birth_date: '25-01-1999',
      parents: [
        {
          id: 1,
          full_name: 'John Doe'
        },
        {
          id: 2,
          full_name: 'Johnanna Doe'
        }
      ],
      educator_full_name: 'Jane Doe',
      educator_email: 'janedoe@test.com',
      educator_phone_number: '0740123456',
      risk_alerts: {
        dates: [
          '20-01-2020',
          '20-02-2020'
        ],
        alerted_users: [
          {
            id: 132,
            user_role: 1,
            full_name: 'John Doe',
            email: 'johndoe@test.com',
            phone_number: '0740123456'
          }
        ]
      }
    }
  };


export const dummyLabels = [
  new Label({
    id: 1,
    text: 'Exmatriculat',
  }),
  new Label({
    id: 2,
    text: 'Pensionar',
  }),
  new Label({
    id: 3,
    text: 'Corigent',
  })
];

export const dummyParents = [
  new Parent({
    id: 1,
    full_name: 'Jean de la Craiova',
  }),
  new Parent({
    id: 2,
    full_name: 'Mircea Bravo',
  }),
  new Parent({
    id: 3,
    full_name: 'Andrei Versace',
  }),
  new Parent({
    id: 4,
    full_name: 'Abi Talent',
  })
];

export const dummyClasses = [
  new Subject({
    id: 1,
    name: 'Matematica',
  }),
  new Subject({
    id: 2,
    name: 'Limba Romana',
  }),
  new Subject({
    id: 3,
    name: 'Limba Engleza',
  }),
  new Subject({
    id: 4,
    name: 'Informatica',
  }),
  new Subject({
    id: 5,
    name: 'Arte vizuale si abilitati prative',
  }),
  new Subject({
    id: 6,
    name: 'Informatica',
  }),
];

