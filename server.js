const fs = require('fs');
const cors = require('cors');
const express = require('express');
var sizeOf = require('image-size');

const app = express();

const API = {
  STATUS: '/status',
  API: '/api',
  GET_ALL_PAGES_NAMES: '/getAllChapters',
  GET_IMAGE: '/getImage'
};

app.use(express.static('public'));
app.use(cors());

app.get(API.API, (request, response) => {
  response.send(API);
});

app.get(API.STATUS, (request, response) => {
  response.sendStatus(200);
});

app.get(API.GET_ALL_PAGES_NAMES, (request, response) => {
  fs.readdir('./public/pages', (error, fileNames) => {
    if (error) {
      console.error(error);
      response.send({ success: false });
    } else {
      const mangaChapters = {};
      for (const fileName of fileNames) {
        const mangaChapterNumber = fileName.split('-')[0];
        const mangaChaptersFiles = Object
          .keys(mangaChapters)
          .filter(chapterNumber => chapterNumber === mangaChapterNumber);
        const dimensions = sizeOf(`./public/pages/${fileName}`);

        if (mangaChaptersFiles.length > 0) {
          mangaChapters[mangaChapterNumber] = {
            ...mangaChapters[mangaChapterNumber],
            fileNames: mangaChapters[mangaChapterNumber].fileNames.concat({
              fileName,
              isPageDouble: dimensions.width > dimensions.height
            }),
            numberOfPages: mangaChapters[mangaChapterNumber].numberOfPages + 1
          }
        } else {
          const chapterNumber = parseInt(mangaChapterNumber, 10);
          mangaChapters[mangaChapterNumber] = {
            isCoverPageDouble: [1].includes(chapterNumber),
            number: chapterNumber,
            numberOfPages: 1,
            fileNames: [{ 
              fileName,
              isPageDouble: dimensions.width > dimensions.height
            }]
          };
        }
      }

      response.send({
        success: true,
        body: mangaChapters
      });
    }
  });
});

const listener = app.listen(4242, () => {
  console.info(`Server is running on port ${listener.address().port}`);
});