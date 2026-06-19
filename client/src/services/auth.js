

const USERS = [
  {
    countryCode: "+91",
    phone: "9999999999",
    password: "user1@123",
    name: "User1",
  },
  {
    countryCode: "+91",
    phone: "8888888888",
    password: "user2@123",
    name: "User2",
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

