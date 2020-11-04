const express = require("express");
const app = express();
const dynamoDB = require("./config/config");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/avatar", express.static("avatar"));

app.set("view engine", "ejs");
app.set("views", "./views");

//upload file

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./avatar/");
  },
  filename: function (req, file, cb) {
    const now = new Date().toISOString();
    const date = now.replace(/:/g, "-");
    cb(null, date + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

//Lay Sinh Vien
app.get("/", (req, res) => {
  let params = {
    TableName: "SinhVien",
  };
  dynamoDB.scan(params, (err, data) => {
    if (err) {
      console.error(JSON.stringify(err, null, 2));
    } else {
      res.render("index", {
        dataSV: data.Items,
      });
    }
  });
});

//Them Sinh Vien

app.post("/addstudent", upload.single("anh"), (req, res) => {
  const anh = req.protocol + "://" + req.hostname + ":5000/" + req.file.path;
  const { masv, tensv, ns } = req.body;
  let student = {
    id: Math.ceil(Math.random() * 1000),
    maSV: masv,
    tenSV: tensv,
    ngaySinh: ns,
    avatar: anh,
  };
  let params = {
    TableName: "SinhVien",
    Item: student,
  };
  dynamoDB.put(params, (err, data) => {
    if (err) {
      console.error("Errors:", JSON.stringify(err, null, 2));
    } else {
      res.redirect("/");
    }
  });
});

//Xoa Sinh Vien

app.post("/delete", (req, res) => {
  const { idSV } = req.body;
  let parrams = {
    TableName: "SinhVien",
    Key: {
      id: parseInt(idSV),
    },
  };
  dynamoDB.delete(parrams, (err, data) => {
    if (err) {
      console.error("Errors:", JSON.stringify(err, null, 2));
    } else {
      res.redirect("/");
    }
  });
});

//Cap Nhat Sinh Vien

app.post("/update", (req, res) => {
  const { idSV, maSV, tenSV, ngaySinh } = req.body;
  let studentUpdate = {
    idSV: idSV,
    maSV: maSV,
    tenSV: tenSV,
    ngaySinh: ngaySinh,
  };
  if (idSV) {
    return res.render("updateForm", {
      studentOld: studentUpdate,
    });
  }
  const { id, masv, tensv, ns, anh } = req.body;
  let params = {
    TableName: "SinhVien",
    Key: {
      id: parseInt(id),
    },
    UpdateExpression: "set #maSV=:ma ,#tenSV=:ten ,#ngaySinh=:ns ,#avatar=:ava",
    ExpressionAttributeNames: {
      "#maSV": "maSV",
      "#tenSV": "tenSV",
      "#ngaySinh": "ngaySinh",
      "#avatar": "avatar",
    },
    ExpressionAttributeValues: {
      ":ma": masv,
      ":ten": tensv,
      ":ns": ns,
      ":ava": anh,
    },
    ReturnValues: "UPDATED_NEW",
  };
  dynamoDB.update(params, (err, data) => {
    if (err) {
      console.error("Errors:", JSON.stringify(err, null, 2));
    } else {
      res.redirect("/");
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log("start " + PORT));
