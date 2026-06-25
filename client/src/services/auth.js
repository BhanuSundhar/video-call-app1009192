

const USERS = [
  {
    countryCode: "+212",
    phone: "9470604949",
    password: "kSb@hu7694",
    name: "Sri",
    role: "client"
  },
  {
    countryCode: "+0195",
    phone: "9124060749", 
    password: "jJhT9G@123",
    name: "Nb@user",
    role: "admin"
  },
  {
    countryCode: "+061601",
    phone: "9097931045",
    password: "Jiyatv@9075",
    name: "ubB@users",
    role: "client"
  },
];

export const verifyPhone = (countryCode, phone) => {
  return USERS.find(
    (user) =>
      user.countryCode === countryCode &&
      user.phone === phone
  );
};

export const verifyPassword = (phone, password) => {
  return USERS.find(
    (user) =>
      user.phone === phone &&
      user.password === password
  );
};

