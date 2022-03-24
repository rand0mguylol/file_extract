const express = require("express")
const app = express()
const path = require('path');
const multer = require("multer")
const streamZip = require("node-stream-zip")
const { v4: uuidv4 } = require('uuid')
const fs = require("fs")

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
   
    cb(null, `public/zip`);
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `/${file.originalname}`);
  },
})

const uploadZip= multer({
  storage: multerStorage,
  limits: { fileSize: 1000000},
}).single("zipFile")

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({ extended: true}))

app.get("/", (req, res) => {

  const imageFilesArray = [];
  if(req.query.image){
    const imageFiles= fs.readdirSync(`public/image/${req.query.image}`);
    for(let image of imageFiles){
      imageFilesArray.push(`/image/${req.query.image}/${image}`)
    }

  }
  res.render("index", {imageFilesArray})
})

app.post("/", (req, res) => {
  uploadZip(req, res, async function(err){

    const zipPath = `${req.file.destination}${req.file.filename}`

    const uuid = uuidv4();
    const savePath = `public/image/${uuid}`
    fs.mkdirSync(savePath)

    const zip = new streamZip.async({ file: zipPath });
    await zip.extract(null, savePath);
    await zip.close();
    
    let image = encodeURIComponent(uuid)
    res.redirect(`/?image=${image}`)
  })
})


app.listen(3000, () => {
  console.log("Listening on Port 3000")
})
