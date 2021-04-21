const users = [];

const addUser = ({ id, name, room }) => {
  console.log(id, name, room);
  name = name;
  room = room;

  const existingUser = users.find(
    (user) => user.room === room && user.name === name
  );

  if (existingUser) {
    return { error: "User name already exists" };
  }

  const user = { id, name, room };
  users.push(user);
  console.log("user_1", user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = { addUser, removeUser, getUsersInRoom, getUser };
