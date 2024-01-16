import User from "../model/User.js";

export const signUp = async (req, res) => {
  try {
    const { name, email, password } = await req.body;

    if (!name || !email || !password) {
      return res.status(401).send("All fields should be entered");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).send("Email already registred with ezshop");
    }

    const newUser = await User.create({ name, email, password });
    if (newUser) {
      res.status(201).json({
        _id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
      });
    } else {
      return res.status(403).send("Error creating the account");
    }
  } catch (error) {
    res.status(501).send(error.message);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(401).send("All fields should be entered");
  }

  const existingUser = await User.findOne({ email });

  if (await existingUser.matchPassword(password)) {
    const response = {
      _id: existingUser._id,
      name: existingUser.name,
      email: existingUser.email,
      password: existingUser.password,
    };

    res.json(response);
  } else {
    res.status(401).send("Invalid email or password");
  }
};
