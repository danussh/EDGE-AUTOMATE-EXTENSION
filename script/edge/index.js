const fs = require("fs");
const archiver = require("archiver");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const { getAccessToken } = require("./auth");
const { uploadPackage, checkUploadPackageStatus } = require("./upload");
const { publishPackage, checkPublishPackageStatus } = require("./publish");

const clientID = process.env.EDGE_CLIENT_ID;
const clientSecret = process.env.EDGE_CLIENT_SECRET;
const productID = process.env.EDGE_PRODUCT_ID;

const zipFolder = (sourceFolder, targetZip) => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(targetZip);
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    output.on("close", () => {
      resolve(`Folder successfully zipped: ${archive.pointer()} total bytes`);
    });

    archive.on("error", (err) => {
      reject(err);
    });

    archive.pipe(output);
    archive.directory(sourceFolder, false);
    archive.finalize();
  });
};

const publishForEdge = async () => {
  const sourceFolder = "../../extension"; // Replace with your folder path
  const targetZip = "../../build.zip"; // Output zip file name

  try {
    // Step 1: Zip the folder
    console.log("Step 1. Zipping folder...");
    const zipMessage = await zipFolder(sourceFolder, targetZip);
    console.log("---zipMessage---",zipMessage);

    // Step 2: Get access token
    console.log("Step 2. Get access token");
    const accessToken = await getAccessToken({
      clientID,
      clientSecret,
    });
    console.log("Access token generated successfully",accessToken);

    console.log("Step 3. Upload package");
    const binaryData = fs.readFileSync(path.join(__dirname, targetZip));
    const uploadOperationID = await uploadPackage({
      accessToken,
      productID,
      binaryData,
    });
    console.log(
      "Upload operationID As Upload is Successful",
      uploadOperationID
    );

    if (!uploadOperationID) {
      throw new Error("Upload operationID is empty");
    }

    // Step 4: Check upload status
    console.log("Step 4. Check upload status");
    const uploadStatus = await checkUploadPackageStatus({
      accessToken,
      productID,
      operationID: uploadOperationID,
    });
    console.log("Upload status", uploadStatus);

    // // Step 5: Publish package
    console.log("Step 5. Publish package");
    const publishOperationID = await publishPackage({
      accessToken,
      productID,
    });
    console.log("Publish operationID", publishOperationID);

    if (!publishOperationID) {
      throw new Error("Publish operationID is empty");
    }

    // Step 6: Check publish status
    console.log("Step 6. Check publish status");
    const publishStatus = await checkPublishPackageStatus({
      accessToken,
      productID,
      operationID: publishOperationID,
    });
    console.log("Publish status", publishStatus);
  } catch (error) {
    console.log("error", error);
  }
};

publishForEdge();
