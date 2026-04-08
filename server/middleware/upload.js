const multer = require('multer');
const path = require('path');


const storage = multer.memoryStorage();

const upload = multer({ storage: storage }).fields([
    { name: 'questionImage', maxCount: 1 },
    { name: 'solutionImage', maxCount: 1 },
    ...Array.from({ length: 5 }, (_, idx) => ({ name: `optionImage${idx + 1}`, maxCount: 1 }))
]);

module.exports = upload;
