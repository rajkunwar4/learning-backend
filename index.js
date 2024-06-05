import express from "express";
import path from "path";
import mongoose, { Schema } from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

//connnecting the db
mongoose
  .connect("mongodb://localhost:27017", {
    dbName: "backend",
  })
  .then(() => {
    console.log("DB connected");
  })
  .catch((e) => {
    console.log(e);
  });

/*---------------------------------------------------------------- */

//schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

/*---------------------------------------------------------------- */

const app = express();

//middleware
app.use(express.urlencoded({ extended: true })); //use to access the values posted via form

app.use(cookieParser()); //accessin the web pages cookies

app.use(express.json());

async function isAuthenticated(req, res, next) {
  const { token } = req.cookies;

  if (token) {
    const decoded = jwt.verify(token, "jksagjgrogjragjkdslagnng");
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      console.log(`erorr: no user`);
    }
    next();
  } else {
    res.redirect("/login");
  }
}

app.get("/register", (req, res) => {
  console.log("on register page");
  const register = path.join(path.resolve(), "register.html");
  res.sendFile(register);
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  let user = await User.findOne({ email });
  console.log(user);
  if (user) {
    console.log("already a user");
    res.redirect("/login");
  } else {
    const hashedPass=await bcrypt.hash(password,10);
    user = await User.create({
      name,
      email,
      password:hashedPass,
    });
    const token = jwt.sign({ id: user._id }, "jksagjgrogjragjkdslagnng");
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 1000),
    });
    res.redirect("/");
  }
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(path.resolve(), "/login.html"));
});

app.get("/", isAuthenticated, (req, res) => {
  console.log(`${req.user.name} welcome to the authenticated website`);
  
  const logout = path.resolve() + "/logout.html";
  res.sendFile(logout);
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email: email });

  if (!user) {
    console.log("No user found, register first");
    res.redirect("/register");
    return;
  }

  

  const isMatch = await bcrypt.compare(password,user.password);
  console.log(isMatch===true)

  if (!isMatch) {
    console.log("Wrong password");
    res.redirect("/login");
    return;
  }

  //putting login info in db
  console.log("correct pass, welcome");
  const token = jwt.sign({ id: user._id }, "jksagjgrogjragjkdslagnng");
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});

app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});

app.listen(5000, () => {
  console.log("*****server is running******");
});
